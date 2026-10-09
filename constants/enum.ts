export enum Provider {
	LOCAL = 'LOCAL',
	GOOGLE = 'GOOGLE',
	GITHUB = 'GITHUB',
}

export enum ItemStatus {
	DRAFT = 'DRAFT',
	ACTIVE = 'ACTIVE',
	ARCHIVED = 'ARCHIVED',
	INACTIVE = 'INACTIVE',
}

export enum ItemPriority {
	LOW = 'LOW',
	MEDIUM = 'MEDIUM',
	HIGH = 'HIGH',
}

export enum ContactStatus {
	NEW = 'NEW',
	READ = 'READ',
	REPLIED = 'REPLIED',
	ARCHIVED = 'ARCHIVED',
}

export enum AuditAction {
	CREATE = 'CREATE',
	UPDATE = 'UPDATE',
	DELETE = 'DELETE',
}

export enum AppointmentStatus {
	PENDING = 'PENDING',
	CONFIRMED = 'CONFIRMED',
	ATTENDED = 'ATTENDED',
	CANCELLED = 'CANCELLED',
	NO_SHOW = 'NO_SHOW',
}

export enum OrderStatus {
	PENDING = 'PENDING',
	FULFILLED = 'FULFILLED',
	CANCELLED = 'CANCELLED',
}

export enum PetSex {
	MALE = 'MALE',
	FEMALE = 'FEMALE',
}

export enum ConsultationStatus {
	DRAFT = 'DRAFT',
	FINALIZED = 'FINALIZED',
	CANCELLED = 'CANCELLED',
}

export enum ConsultationKind {
	GENERAL = 'GENERAL',
	PREVENTIVE = 'PREVENTIVE',
	DERMATOLOGICAL = 'DERMATOLOGICAL',
	DIGESTIVE = 'DIGESTIVE',
	RESPIRATORY = 'RESPIRATORY',
	OTHER = 'OTHER',
}

export enum DiagnosisType {
	PRESUMPTIVE = 'PRESUMPTIVE',
	DIFFERENTIAL = 'DIFFERENTIAL',
	CONFIRMED = 'CONFIRMED',
}

export enum DiagnosisStatus {
	UNDER_EVALUATION = 'UNDER_EVALUATION',
	ACTIVE = 'ACTIVE',
	CONTROLLED = 'CONTROLLED',
	RESOLVED = 'RESOLVED',
}

export enum DiagnosisSeverity {
	MILD = 'MILD',
	MODERATE = 'MODERATE',
	SEVERE = 'SEVERE',
}

export enum MedicalHistoryType {
	MEDICAL = 'MEDICAL',
	SURGICAL = 'SURGICAL',
	REPRODUCTIVE = 'REPRODUCTIVE',
	OTHER = 'OTHER',
}

export enum MedicalHistoryStatus {
	ACTIVE = 'ACTIVE',
	CHRONIC = 'CHRONIC',
	CONTROLLED = 'CONTROLLED',
	RESOLVED = 'RESOLVED',
}

export enum ClinicalAlertType {
	ALLERGY = 'ALLERGY',
	ADVERSE_REACTION = 'ADVERSE_REACTION',
	CHRONIC_CONDITION = 'CHRONIC_CONDITION',
}

export enum ClinicalEncounterType {
	CONSULTATION = 'CONSULTATION',
}

export enum ClinicalMeasurementType {
	WEIGHT = 'WEIGHT',
	TEMPERATURE = 'TEMPERATURE',
	HEART_RATE = 'HEART_RATE',
	RESPIRATORY_RATE = 'RESPIRATORY_RATE',
}

export enum FollowUpStatus {
	PENDING = 'PENDING',
	COMPLETED = 'COMPLETED',
	CANCELLED = 'CANCELLED',
}
