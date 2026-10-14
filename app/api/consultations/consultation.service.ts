import {
	assertCanReadPetRecord,
	assertClinicalStaff,
	isClinicalStaff,
} from '@/app/api/_shared/http/authorization';
import type { Identity } from '@/app/api/_shared/http/http.types';
import type { FirestoreReadRepository } from '@/app/api/_shared/repository/repository.contract';
import type { RoleDocument } from '@/app/api/_shared/repository/role.types';
import type { Appointment } from '@/app/api/appointments/appointment.schema';
import type { ClinicalEncounter } from '@/app/api/encounters/encounter.schema';
import type { Medication } from '@/app/api/medications/medication.schema';
import type { Pet } from '@/app/api/pets/pet.schema';
import { buildPlanWrites } from '@/app/api/treatment-plans/treatment-plan.builder';
import type { CreateTreatmentInput } from '@/app/api/treatment-plans/treatment-plan.schema';
import type { User } from '@/app/api/users/user.schema';
import { CONSULTATION_KIND_LABEL } from '@/constants/clinical';
import {
	ClinicalEncounterType,
	ClinicalMeasurementType,
	ConsultationStatus,
	FollowUpStatus,
} from '@/constants/enum';
import { Permission } from '@/constants/permission';
import { formatClinicDate } from '@/utils/date';
import { hasPermission } from '@/utils/permission';
import createHttpError from 'http-errors';
import { MEASUREMENT_SOURCES } from './clinical-measurement.schema';
import type { ConsultationRepository } from './consultation.repository';
import {
	finalizeConsultationSchema,
	type ConsultationContent,
	type CreateConsultationInput,
	type UpdateConsultationInput,
} from './consultation.schema';
import type {
	ConsultationDetail,
	ConsultationSnapshot,
	FinalizationWrites,
} from './consultation.types';

type Staff = { id: string; name: string };
type MedicationNames = ReadonlyMap<string, string>;

// Firestore allows 500 writes per transaction; keep headroom.
const MAX_FINALIZATION_WRITES = 450;

const countWrites = (writes: FinalizationWrites): number =>
	1 +
	writes.measurements.length +
	writes.diagnoses.length +
	(writes.followUp ? 1 : 0) +
	writes.plans.length +
	writes.administrations.length;

export function assertWithinWriteLimit(writes: FinalizationWrites): void {
	if (countWrites(writes) > MAX_FINALIZATION_WRITES)
		throw new createHttpError.UnprocessableEntity(
			'Too many scheduled applications for one operation'
		);
}

const distinctMedicationIds = (treatments: CreateTreatmentInput): string[] => [
	...new Set(
		treatments.flatMap((plan) =>
			plan.medications.map((medication) => medication.medicationId)
		)
	),
];

/**
 * Consultation domain logic: a draft is freely editable by any staff member
 * with clinical permissions; finalizing makes it part of the patient's
 * history. Depends only on repository abstractions (DIP); concrete
 * repositories are chosen in `consultation.module.ts`.
 */
export class ConsultationService {
	constructor(
		private readonly repo: ConsultationRepository,
		private readonly encounterRepo: FirestoreReadRepository<ClinicalEncounter>,
		private readonly petRepo: FirestoreReadRepository<Pet>,
		private readonly appointmentRepo: FirestoreReadRepository<Appointment>,
		private readonly userRepo: FirestoreReadRepository<User>,
		private readonly roleRepo: FirestoreReadRepository<RoleDocument>,
		private readonly medicationRepo: FirestoreReadRepository<Medication>
	) {}

	private async assertPetExists(petId: string): Promise<void> {
		if (!(await this.petRepo.exists(petId)))
			throw new createHttpError.NotFound('Pet not found');
	}

	private async assertAppointmentBelongsToPet(
		appointmentId: string | undefined,
		petId: string
	): Promise<void> {
		if (!appointmentId) return;
		const appointment = await this.appointmentRepo.findById(appointmentId);
		if (!appointment || appointment.petId !== petId)
			throw new createHttpError.NotFound('Appointment not found');
	}

	private async resolveStaff(staffId: string): Promise<Staff> {
		const user = await this.userRepo.findById(staffId);
		if (!user) throw new createHttpError.NotFound('Staff user not found');
		const role = await this.roleRepo.findById(user.role);
		if (
			!hasPermission(role?.permissions, [Permission.MEDICAL_RECORDS_MANAGE_ALL])
		)
			throw new createHttpError.UnprocessableEntity(
				'The selected user cannot attend consultations'
			);
		return { id: staffId, name: user.name };
	}

	/** Every prescribed medication must exist and be active; returns id -> name. */
	private async resolveMedicationNames(
		treatments: CreateTreatmentInput
	): Promise<MedicationNames> {
		const entries = await Promise.all(
			distinctMedicationIds(treatments).map(async (medicationId) => {
				const medication = await this.medicationRepo.findById(medicationId);
				if (!medication?.active)
					throw new createHttpError.UnprocessableEntity(
						`Medication not available: ${medicationId}`
					);
				return [medicationId, medication.name] as const;
			})
		);
		return new Map(entries);
	}

	private async getSnapshot(id: string): Promise<{
		encounter: ClinicalEncounter;
		consultation: ConsultationContent;
	}> {
		const [encounter, consultation] = await Promise.all([
			this.encounterRepo.findById(id),
			this.repo.findById(id),
		]);
		if (!encounter || !consultation)
			throw new createHttpError.NotFound('Consultation not found');
		return { encounter, consultation };
	}

	private toDetail(
		id: string,
		{ encounter, consultation }: ConsultationSnapshot
	): ConsultationDetail {
		return {
			id,
			petId: encounter.petId,
			status: encounter.status,
			occurredAt: encounter.occurredAt,
			staffId: encounter.staffId,
			staffName: encounter.staffName,
			appointmentId: encounter.appointmentId,
			kind: consultation.kind,
			reason: consultation.reason,
			anamnesis: consultation.anamnesis,
			measurements: consultation.measurements,
			physicalExam: consultation.physicalExam,
			diagnoses: consultation.diagnoses.map((diagnosis, index) => ({
				id: `${id}-${index}`,
				...diagnosis,
			})),
			noDefinedDiagnosis: consultation.noDefinedDiagnosis,
			instructions: consultation.instructions,
			internalNotes: consultation.internalNotes,
			prognosis: consultation.prognosis,
			followUp: consultation.followUp,
			treatments: consultation.treatments ?? [],
			mainDiagnosis: encounter.mainDiagnosis,
			requiresFollowUp: encounter.requiresFollowUp,
			createdAt: encounter.createdAt,
			createdBy: encounter.createdBy,
			updatedAt: encounter.updatedAt,
			updatedBy: encounter.updatedBy,
			finalizedAt: encounter.finalizedAt,
			finalizedBy: encounter.finalizedBy,
		};
	}

	async create(
		identity: Identity,
		petId: string,
		input: CreateConsultationInput
	): Promise<ConsultationDetail> {
		assertClinicalStaff(identity);
		await this.assertPetExists(petId);
		const { occurredAt, appointmentId, staffId, ...content } = input;
		await this.assertAppointmentBelongsToPet(appointmentId, petId);
		const staff = await this.resolveStaff(staffId ?? identity.uid);

		const now = new Date().toISOString();
		const id = await this.repo.createDraft(
			{
				petId,
				type: ClinicalEncounterType.CONSULTATION,
				status: ConsultationStatus.DRAFT,
				staffId: staff.id,
				staffName: staff.name,
				appointmentId,
				occurredAt,
				kind: content.kind,
				reason: content.reason,
				mainDiagnosis: this.mainDiagnosisOf(content),
				requiresFollowUp: !!content.followUp,
				createdAt: now,
				createdBy: identity.uid,
				updatedAt: now,
				updatedBy: identity.uid,
			},
			{
				petId,
				...content,
				createdAt: now,
				createdBy: identity.uid,
				updatedAt: now,
				updatedBy: identity.uid,
			}
		);
		return this.getById(identity, id);
	}

	async getById(identity: Identity, id: string): Promise<ConsultationDetail> {
		const snapshot = await this.getSnapshot(id);
		const { encounter } = snapshot;
		assertCanReadPetRecord(
			identity,
			await this.petRepo.findById(encounter.petId)
		);
		if (isClinicalStaff(identity)) return this.toDetail(id, snapshot);

		// Owners only see finalized consultations, without staff-only notes.
		if (encounter.status !== ConsultationStatus.FINALIZED)
			throw new createHttpError.NotFound('Consultation not found');
		return { ...this.toDetail(id, snapshot), internalNotes: undefined };
	}

	async update(
		identity: Identity,
		id: string,
		input: UpdateConsultationInput
	): Promise<ConsultationDetail> {
		assertClinicalStaff(identity);
		const { encounter, consultation } = await this.getSnapshot(id);
		if (encounter.status !== ConsultationStatus.DRAFT)
			throw new createHttpError.UnprocessableEntity(
				`Cannot edit a consultation with status ${encounter.status}`
			);
		const {
			occurredAt,
			appointmentId,
			staffId,
			expectedUpdatedAt,
			...content
		} = input;
		await this.assertAppointmentBelongsToPet(appointmentId, encounter.petId);
		const staff: Staff =
			staffId && staffId !== encounter.staffId
				? await this.resolveStaff(staffId)
				: { id: encounter.staffId, name: encounter.staffName };

		const now = new Date().toISOString();
		await this.repo.replaceDraft(
			id,
			{
				petId: encounter.petId,
				type: encounter.type,
				status: ConsultationStatus.DRAFT,
				staffId: staff.id,
				staffName: staff.name,
				appointmentId,
				occurredAt,
				kind: content.kind,
				reason: content.reason,
				mainDiagnosis: this.mainDiagnosisOf(content),
				requiresFollowUp: !!content.followUp,
				createdAt: encounter.createdAt,
				createdBy: encounter.createdBy,
				updatedAt: now,
				updatedBy: identity.uid,
			},
			{
				petId: encounter.petId,
				...content,
				createdAt: consultation.createdAt,
				createdBy: consultation.createdBy,
				updatedAt: now,
				updatedBy: identity.uid,
			},
			expectedUpdatedAt
		);
		return this.getById(identity, id);
	}

	async finalize(identity: Identity, id: string): Promise<ConsultationDetail> {
		assertClinicalStaff(identity);
		const snapshot = await this.getSnapshot(id);
		if (snapshot.encounter.status !== ConsultationStatus.DRAFT)
			throw new createHttpError.UnprocessableEntity(
				`Cannot finalize a consultation with status ${snapshot.encounter.status}`
			);
		// Fails with per-field errors (400); re-checked inside the transaction.
		const { treatments } = finalizeConsultationSchema.parse(
			this.toFinalizationCandidate(snapshot)
		);
		const medicationNames = await this.resolveMedicationNames(treatments);

		await this.repo.finalizeDraft(id, (current) =>
			this.buildFinalization(identity, id, current, medicationNames)
		);
		return this.getById(identity, id);
	}

	private mainDiagnosisOf(content: {
		diagnoses: CreateConsultationInput['diagnoses'];
	}): string | undefined {
		return content.diagnoses.find((diagnosis) => diagnosis.name)?.name;
	}

	private toFinalizationCandidate({
		encounter,
		consultation,
	}: ConsultationSnapshot) {
		return {
			occurredAt: encounter.occurredAt,
			kind: consultation.kind,
			reason: consultation.reason,
			anamnesis: consultation.anamnesis,
			physicalExam: consultation.physicalExam,
			instructions: consultation.instructions,
			diagnoses: consultation.diagnoses,
			noDefinedDiagnosis: consultation.noDefinedDiagnosis,
			measurements: consultation.measurements,
			followUp: consultation.followUp,
			treatments: consultation.treatments ?? [],
		};
	}

	private buildFinalization(
		identity: Identity,
		id: string,
		snapshot: ConsultationSnapshot,
		medicationNames: MedicationNames
	): FinalizationWrites {
		const { encounter, consultation } = snapshot;
		const parsed = finalizeConsultationSchema.safeParse(
			this.toFinalizationCandidate(snapshot)
		);
		if (!parsed.success)
			throw new createHttpError.Conflict(
				'The consultation changed and no longer meets the finalization requirements'
			);
		const { treatments } = parsed.data;
		const medicationIds = distinctMedicationIds(treatments);
		if (
			medicationIds.some((medicationId) => !medicationNames.has(medicationId))
		)
			throw new createHttpError.Conflict(
				'The consultation changed and its medications were not validated'
			);

		const now = new Date().toISOString();
		const audit = { createdAt: now, createdBy: identity.uid };
		const { petId, occurredAt } = encounter;

		const { plans, administrations } = treatments.length
			? buildPlanWrites(treatments, {
					petId,
					encounterId: id,
					occurredAt,
					followUpId: consultation.followUp ? id : undefined,
					createdBy: identity.uid,
					staff: { id: encounter.staffId, name: encounter.staffName },
					now,
					medicationNames,
					sourceConsultationLabel: `${
						consultation.kind
							? CONSULTATION_KIND_LABEL[consultation.kind]
							: 'Consulta'
					} · ${formatClinicDate(occurredAt)}`,
				})
			: { plans: [], administrations: [] };

		const writes: FinalizationWrites = {
			encounter: {
				...encounter,
				status: ConsultationStatus.FINALIZED,
				finalizedAt: now,
				finalizedBy: identity.uid,
				updatedAt: now,
				updatedBy: identity.uid,
			},
			measurements: Object.values(ClinicalMeasurementType).flatMap((type) => {
				const { field, unit } = MEASUREMENT_SOURCES[type];
				const numericValue = consultation.measurements[field];
				return numericValue === undefined
					? []
					: [
							{
								id: `${id}_${type}`,
								data: {
									petId,
									encounterId: id,
									measurementType: type,
									numericValue,
									unit,
									measuredAt: occurredAt,
									...audit,
								},
							},
						];
			}),
			diagnoses: consultation.diagnoses.map((diagnosis, index) => ({
				id: `${id}_${index}`,
				data: {
					...diagnosis,
					petId,
					encounterId: id,
					occurredAt,
					position: index,
					...audit,
				},
			})),
			followUp: consultation.followUp && {
				id,
				data: {
					petId,
					sourceEncounterId: id,
					recommendedDate: consultation.followUp.recommendedDate,
					reason: consultation.followUp.reason,
					status: FollowUpStatus.PENDING,
					...audit,
				},
			},
			plans,
			administrations,
		};
		assertWithinWriteLimit(writes);
		return writes;
	}
}
