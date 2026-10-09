import { assertClinicalStaff } from '@/app/api/_shared/http/authorization';
import type { Identity } from '@/app/api/_shared/http/http.types';
import type { FirestoreReadRepository } from '@/app/api/_shared/repository/repository.contract';
import type { ClinicalMeasurement } from '@/app/api/consultations/clinical-measurement.schema';
import type { Diagnosis } from '@/app/api/consultations/diagnosis.schema';
import type { FollowUp } from '@/app/api/consultations/follow-up.schema';
import type { ClinicalEncounter } from '@/app/api/encounters/encounter.schema';
import type { MedicalHistory } from '@/app/api/medical-histories/medical-history.schema';
import type { Pet } from '@/app/api/pets/pet.schema';
import type { User } from '@/app/api/users/user.schema';
import { DIAGNOSIS_STATUS_LABEL } from '@/constants/clinical';
import {
	ClinicalMeasurementType,
	ConsultationStatus,
	DiagnosisStatus,
	FollowUpStatus,
	ItemStatus,
} from '@/constants/enum';
import createHttpError from 'http-errors';
import {
	RECENT_DIAGNOSES_LIMIT,
	SUMMARY_ALERTS_LIMIT,
	SUMMARY_WEIGHTS_LIMIT,
} from './clinical-summary.constants';
import type { ClinicalSummary } from './clinical-summary.types';

/**
 * Read model for the patient's record header and summary. It never reads
 * drafts' content: weights and problems come from rows that only exist once a
 * consultation is finalized. Every query is bounded and runs in parallel.
 * Depends only on read-repository abstractions (DIP); concrete repositories
 * are chosen in `clinical-summary.module.ts`.
 */
export class ClinicalSummaryService {
	constructor(
		private readonly petRepo: FirestoreReadRepository<Pet>,
		private readonly userRepo: FirestoreReadRepository<User>,
		private readonly historyRepo: FirestoreReadRepository<MedicalHistory>,
		private readonly encounterRepo: FirestoreReadRepository<ClinicalEncounter>,
		private readonly measurementRepo: FirestoreReadRepository<ClinicalMeasurement>,
		private readonly diagnosisRepo: FirestoreReadRepository<Diagnosis>,
		private readonly followUpRepo: FirestoreReadRepository<FollowUp>
	) {}

	async get(identity: Identity, petId: string): Promise<ClinicalSummary> {
		assertClinicalStaff(identity);
		const pet = await this.petRepo.findById(petId);
		if (!pet) throw new createHttpError.NotFound('Pet not found');

		const [
			owner,
			alertHistories,
			diagnoses,
			weights,
			followUp,
			lastConsultation,
		] = await Promise.all([
			this.userRepo.findById(pet.ownerId),
			this.historyRepo.findMany({
				where: [
					{ field: 'petId', op: '==', value: petId },
					{ field: 'archived', op: '==', value: false },
					{ field: 'isAlert', op: '==', value: true },
				],
				orderBy: [{ field: 'createdAt', direction: 'desc' }],
				limit: SUMMARY_ALERTS_LIMIT,
			}),
			this.diagnosisRepo.findMany({
				where: [{ field: 'petId', op: '==', value: petId }],
				orderBy: [
					{ field: 'occurredAt', direction: 'desc' },
					{ field: 'position', direction: 'desc' },
				],
				limit: RECENT_DIAGNOSES_LIMIT,
			}),
			this.measurementRepo.findMany({
				where: [
					{ field: 'petId', op: '==', value: petId },
					{
						field: 'measurementType',
						op: '==',
						value: ClinicalMeasurementType.WEIGHT,
					},
				],
				orderBy: [{ field: 'measuredAt', direction: 'desc' }],
				limit: SUMMARY_WEIGHTS_LIMIT,
			}),
			this.followUpRepo.findOne({
				where: [
					{ field: 'petId', op: '==', value: petId },
					{ field: 'status', op: '==', value: FollowUpStatus.PENDING },
					{
						field: 'recommendedDate',
						op: '>=',
						value: this.followUpFromDate(),
					},
				],
				orderBy: [{ field: 'recommendedDate', direction: 'asc' }],
			}),
			this.encounterRepo.findOne({
				where: [
					{ field: 'petId', op: '==', value: petId },
					{
						field: 'status',
						op: '==',
						value: ConsultationStatus.FINALIZED,
					},
				],
				orderBy: [{ field: 'occurredAt', direction: 'desc' }],
			}),
		]);

		return {
			patient: {
				id: petId,
				name: pet.name,
				species: pet.species,
				breed: pet.breed,
				birthDate: pet.birthDate,
				sex: pet.sex,
				sterilized: pet.sterilized,
				color: pet.color,
				markings: pet.markings,
				microchip: pet.microchip,
				recordNumber: `EXP-${petId.slice(0, 6).toUpperCase()}`,
				status: ItemStatus.ACTIVE,
			},
			owner: owner
				? { name: owner.name, phone: owner.phone, email: owner.email }
				: undefined,
			alerts: alertHistories.flatMap((history) =>
				history.alertType
					? [
							{
								id: history.id,
								type: history.alertType,
								title: history.name,
								detail: history.description,
							},
						]
					: []
			),
			activeProblems: this.toActiveProblems(diagnoses),
			weightHistory: weights.map((weight) => ({
				valueKg: weight.numericValue,
				measuredAt: weight.measuredAt,
			})),
			currentMedications: [],
			nextFollowUp: followUp
				? {
						id: followUp.id,
						recommendedDate: followUp.recommendedDate,
						reason: followUp.reason,
						sourceConsultationId: followUp.sourceEncounterId,
					}
				: undefined,
			lastConsultation: lastConsultation ?? undefined,
		};
	}

	/** Yesterday (UTC), so a follow-up due today is still shown in any timezone. */
	private followUpFromDate(): string {
		return new Date(Date.now() - 24 * 60 * 60 * 1000)
			.toISOString()
			.slice(0, 10);
	}

	/** Latest state per diagnosis name; a later "resolved" entry closes an older active one. */
	private toActiveProblems(
		diagnoses: (Diagnosis & { id: string })[]
	): ClinicalSummary['activeProblems'] {
		const latestByName = new Map<string, Diagnosis & { id: string }>();
		for (const diagnosis of diagnoses) {
			const key = diagnosis.name.toLowerCase();
			if (!latestByName.has(key)) latestByName.set(key, diagnosis);
		}
		return [...latestByName.values()]
			.filter(
				(diagnosis) =>
					diagnosis.isActiveProblem &&
					diagnosis.status !== DiagnosisStatus.RESOLVED
			)
			.map((diagnosis) => ({
				id: diagnosis.id,
				name: diagnosis.name,
				statusLabel: DIAGNOSIS_STATUS_LABEL[diagnosis.status],
			}));
	}
}
