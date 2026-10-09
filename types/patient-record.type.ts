import { ClinicalAlertType, ItemStatus, PetSex } from '@/constants/enum';
import type { ConsultationListItem, FollowUp } from './consultation.type';
import type { MedicalHistoryEntry } from './medical-history.type';

export interface ClinicalAlert {
	id: string;
	type: ClinicalAlertType;
	title: string;
	detail?: string;
}

export interface PatientIdentity {
	id: string;
	name: string;
	recordNumber: string;
	species: string;
	breed: string;
	sex: PetSex;
	sterilized: boolean;
	birthDate: string;
	color?: string;
	markings?: string;
	microchip?: string;
	status: ItemStatus;
	ownerName: string;
	ownerPhone?: string;
	ownerEmail?: string;
}

export interface WeightMeasurement {
	valueKg: number;
	measuredAt: string;
}

export interface ActiveProblem {
	id: string;
	name: string;
	statusLabel: string;
}

export interface CurrentMedication {
	id: string;
	name: string;
	instructions: string;
}

export interface PatientClinicalSummary {
	alerts: ClinicalAlert[];
	activeProblems: ActiveProblem[];
	weightHistory: WeightMeasurement[];
	currentMedications: CurrentMedication[];
	nextFollowUp?: FollowUp;
}

export interface PatientRecordData {
	patient: PatientIdentity;
	summary: PatientClinicalSummary;
	histories: MedicalHistoryEntry[];
	consultations: ConsultationListItem[];
}
