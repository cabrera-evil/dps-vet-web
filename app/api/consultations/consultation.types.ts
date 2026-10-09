import type { ClinicalEncounter } from '@/app/api/encounters/encounter.schema';
import type { ConsultationStatus } from '@/constants/enum';
import type { ClinicalMeasurement } from './clinical-measurement.schema';
import type {
	ConsultationContent,
	ConsultationDiagnosis,
	ConsultationMeasurements,
} from './consultation.schema';
import type { Diagnosis } from './diagnosis.schema';
import type { FollowUp } from './follow-up.schema';

/** Encounter + consultation content, as one record for the client. */
export type ConsultationDetail = {
	id: string;
	petId: string;
	status: ConsultationStatus;
	occurredAt: string;
	staffId: string;
	staffName: string;
	appointmentId?: string;
	kind?: ConsultationContent['kind'];
	reason?: string;
	anamnesis?: string;
	measurements: ConsultationMeasurements;
	physicalExam?: string;
	diagnoses: (ConsultationDiagnosis & { id: string })[];
	noDefinedDiagnosis: boolean;
	instructions?: string;
	internalNotes?: string;
	prognosis?: string;
	followUp?: ConsultationContent['followUp'];
	mainDiagnosis?: string;
	requiresFollowUp: boolean;
	createdAt: string;
	createdBy: string;
	updatedAt: string;
	updatedBy: string;
	finalizedAt?: string;
	finalizedBy?: string;
};

export type ConsultationSnapshot = {
	encounter: ClinicalEncounter;
	consultation: ConsultationContent;
};

type DocumentWrite<T> = { id: string; data: T };

/** Everything finalizing a consultation writes, applied in one transaction. */
export type FinalizationWrites = {
	encounter: ClinicalEncounter;
	measurements: DocumentWrite<ClinicalMeasurement>[];
	diagnoses: DocumentWrite<Diagnosis>[];
	followUp?: DocumentWrite<FollowUp>;
};
