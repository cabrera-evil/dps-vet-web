import {
	ConsultationKind,
	ConsultationStatus,
	DiagnosisSeverity,
	DiagnosisStatus,
	DiagnosisType,
} from '@/constants/enum';

export interface ConsultationDiagnosis {
	id: string;
	name: string;
	type: DiagnosisType;
	status: DiagnosisStatus;
	severity?: DiagnosisSeverity;
	notes?: string;
	isActiveProblem: boolean;
}

export interface ConsultationMeasurements {
	weightKg?: number;
	temperatureC?: number;
	heartRateBpm?: number;
	respiratoryRateRpm?: number;
	bodyConditionScore?: number;
	hydration?: string;
	mucousMembranes?: string;
	capillaryRefill?: string;
	pain?: string;
}

export interface FollowUp {
	id: string;
	recommendedDate: string;
	reason: string;
	sourceConsultationId: string;
}

export interface ConsultationListItem {
	id: string;
	kind: ConsultationKind;
	status: ConsultationStatus;
	occurredAt: string;
	staffName: string;
	reason: string;
	mainDiagnosis?: string;
	requiresFollowUp: boolean;
}

export interface ConsultationRecord extends ConsultationListItem {
	appointmentLabel?: string;
	anamnesis: string;
	measurements: ConsultationMeasurements;
	physicalExam: string;
	diagnoses: ConsultationDiagnosis[];
	noDefinedDiagnosis: boolean;
	instructions: string;
	internalNotes?: string;
	prognosis?: string;
	followUp?: Omit<FollowUp, 'id' | 'sourceConsultationId'>;
}

export interface ConsultationOption {
	id: string;
	label: string;
}
