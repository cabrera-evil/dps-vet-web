import {
	ClinicalAlertType,
	ConsultationKind,
	ConsultationStatus,
	DiagnosisSeverity,
	DiagnosisStatus,
	DiagnosisType,
	ItemStatus,
	MedicalHistoryStatus,
	MedicalHistoryType,
	PetSex,
} from './enum';

export interface SelectOption {
	value: string;
	label: string;
}

const toOptions = (labels: Record<string, string>): SelectOption[] =>
	Object.entries(labels).map(([value, label]) => ({ value, label }));

export const RECORD_TABS = [
	'resumen',
	'consultas',
	'antecedentes',
	'examenes',
	'tratamientos',
	'vacunas',
	'archivos',
	'datos',
] as const;

export type RecordTab = (typeof RECORD_TABS)[number];

export const PATIENT_STATUS_LABEL: Partial<Record<ItemStatus, string>> = {
	[ItemStatus.ACTIVE]: 'Activo',
	[ItemStatus.INACTIVE]: 'Inactivo',
};

export const PET_SEX_LABEL: Record<PetSex, string> = {
	[PetSex.MALE]: 'Macho',
	[PetSex.FEMALE]: 'Hembra',
};

export const PET_SEX_OPTIONS = toOptions(PET_SEX_LABEL);

export const CONSULTATION_STATUS_LABEL: Record<ConsultationStatus, string> = {
	[ConsultationStatus.DRAFT]: 'Borrador',
	[ConsultationStatus.FINALIZED]: 'Finalizada',
	[ConsultationStatus.CANCELLED]: 'Anulada',
};

export const CONSULTATION_KIND_LABEL: Record<ConsultationKind, string> = {
	[ConsultationKind.GENERAL]: 'Consulta general',
	[ConsultationKind.PREVENTIVE]: 'Consulta preventiva',
	[ConsultationKind.DERMATOLOGICAL]: 'Consulta dermatológica',
	[ConsultationKind.DIGESTIVE]: 'Consulta digestiva',
	[ConsultationKind.RESPIRATORY]: 'Consulta respiratoria',
	[ConsultationKind.OTHER]: 'Otra consulta',
};

export const CONSULTATION_KIND_OPTIONS: SelectOption[] = [
	{ value: ConsultationKind.GENERAL, label: 'General' },
	{ value: ConsultationKind.PREVENTIVE, label: 'Preventiva' },
	{ value: ConsultationKind.DERMATOLOGICAL, label: 'Dermatológica' },
	{ value: ConsultationKind.DIGESTIVE, label: 'Digestiva' },
	{ value: ConsultationKind.RESPIRATORY, label: 'Respiratoria' },
	{ value: ConsultationKind.OTHER, label: 'Otra' },
];

export const DIAGNOSIS_TYPE_LABEL: Record<DiagnosisType, string> = {
	[DiagnosisType.PRESUMPTIVE]: 'Presuntivo',
	[DiagnosisType.DIFFERENTIAL]: 'Diferencial',
	[DiagnosisType.CONFIRMED]: 'Confirmado',
};

export const DIAGNOSIS_STATUS_LABEL: Record<DiagnosisStatus, string> = {
	[DiagnosisStatus.UNDER_EVALUATION]: 'En evaluación',
	[DiagnosisStatus.ACTIVE]: 'Activo',
	[DiagnosisStatus.CONTROLLED]: 'Controlado',
	[DiagnosisStatus.RESOLVED]: 'Resuelto',
};

export const DIAGNOSIS_SEVERITY_LABEL: Record<DiagnosisSeverity, string> = {
	[DiagnosisSeverity.MILD]: 'Leve',
	[DiagnosisSeverity.MODERATE]: 'Moderada',
	[DiagnosisSeverity.SEVERE]: 'Severa',
};

export const DIAGNOSIS_TYPE_OPTIONS = toOptions(DIAGNOSIS_TYPE_LABEL);
export const DIAGNOSIS_STATUS_OPTIONS = toOptions(DIAGNOSIS_STATUS_LABEL);
export const DIAGNOSIS_SEVERITY_OPTIONS = toOptions(DIAGNOSIS_SEVERITY_LABEL);

export const MEDICAL_HISTORY_TYPE_LABEL: Record<MedicalHistoryType, string> = {
	[MedicalHistoryType.MEDICAL]: 'Médicos',
	[MedicalHistoryType.SURGICAL]: 'Quirúrgicos',
	[MedicalHistoryType.REPRODUCTIVE]: 'Reproductivos',
	[MedicalHistoryType.OTHER]: 'Otros',
};

export const MEDICAL_HISTORY_TYPE_OPTIONS: SelectOption[] = [
	{ value: MedicalHistoryType.MEDICAL, label: 'Médico' },
	{ value: MedicalHistoryType.SURGICAL, label: 'Quirúrgico' },
	{ value: MedicalHistoryType.REPRODUCTIVE, label: 'Reproductivo' },
	{ value: MedicalHistoryType.OTHER, label: 'Otro' },
];

export const MEDICAL_HISTORY_STATUS_LABEL: Record<
	MedicalHistoryStatus,
	string
> = {
	[MedicalHistoryStatus.ACTIVE]: 'Activo',
	[MedicalHistoryStatus.CHRONIC]: 'Crónico',
	[MedicalHistoryStatus.CONTROLLED]: 'Controlado',
	[MedicalHistoryStatus.RESOLVED]: 'Resuelto',
};

export const MEDICAL_HISTORY_STATUS_OPTIONS = toOptions(
	MEDICAL_HISTORY_STATUS_LABEL
);

export const CLINICAL_ALERT_LABEL: Record<ClinicalAlertType, string> = {
	[ClinicalAlertType.ALLERGY]: 'Alergia',
	[ClinicalAlertType.ADVERSE_REACTION]: 'Reacción adversa',
	[ClinicalAlertType.CHRONIC_CONDITION]: 'Enfermedad crónica',
};

export const CLINICAL_ALERT_OPTIONS = toOptions(CLINICAL_ALERT_LABEL);

export const BODY_CONDITION_OPTIONS: SelectOption[] = [
	{ value: '1', label: '1 · Caquéctico' },
	{ value: '2', label: '2 · Muy delgado' },
	{ value: '3', label: '3 · Delgado' },
	{ value: '4', label: '4 · Ligeramente delgado' },
	{ value: '5', label: '5 · Ideal' },
	{ value: '6', label: '6 · Ligero sobrepeso' },
	{ value: '7', label: '7 · Sobrepeso' },
	{ value: '8', label: '8 · Obeso' },
	{ value: '9', label: '9 · Obesidad severa' },
];

export const HYDRATION_OPTIONS: SelectOption[] = [
	{ value: 'NORMAL', label: 'Normal' },
	{ value: 'MILD', label: 'Leve' },
	{ value: 'MODERATE', label: 'Moderada' },
	{ value: 'SEVERE', label: 'Severa' },
	{ value: 'NOT_EVALUATED', label: 'No evaluado' },
];

export const MUCOUS_MEMBRANE_OPTIONS: SelectOption[] = [
	{ value: 'PINK', label: 'Rosadas' },
	{ value: 'PALE', label: 'Pálidas' },
	{ value: 'ICTERIC', label: 'Ictéricas' },
	{ value: 'CYANOTIC', label: 'Cianóticas' },
	{ value: 'OTHER', label: 'Otro' },
];

export const CAPILLARY_REFILL_OPTIONS: SelectOption[] = [
	{ value: 'LT_2S', label: 'Menor a 2 s' },
	{ value: 'BETWEEN_2_3S', label: '2 a 3 s' },
	{ value: 'GT_3S', label: 'Mayor a 3 s' },
	{ value: 'NOT_EVALUATED', label: 'No evaluado' },
];

export const PAIN_OPTIONS: SelectOption[] = [
	{ value: 'NONE', label: 'Sin dolor' },
	{ value: 'MILD', label: 'Leve' },
	{ value: 'MODERATE', label: 'Moderado' },
	{ value: 'SEVERE', label: 'Severo' },
	{ value: 'NOT_EVALUATED', label: 'No evaluado' },
];

export const PROGNOSIS_OPTIONS: SelectOption[] = [
	{ value: 'FAVORABLE', label: 'Favorable' },
	{ value: 'GUARDED', label: 'Reservado' },
	{ value: 'UNFAVORABLE', label: 'Desfavorable' },
	{ value: 'UNDEFINED', label: 'No definido' },
];

export interface MeasurementRange {
	min: number;
	max: number;
}

/** Plausibility bounds that trigger a non-blocking "unusual value" hint. */
export const UNUSUAL_RANGES = {
	weightKg: { min: 0.05, max: 120 },
	temperatureC: { min: 35, max: 42 },
	heartRateBpm: { min: 20, max: 300 },
	respiratoryRateRpm: { min: 5, max: 150 },
} satisfies Record<string, MeasurementRange>;
