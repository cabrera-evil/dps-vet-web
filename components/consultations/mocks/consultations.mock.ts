import {
	ConsultationKind,
	ConsultationStatus,
	DiagnosisSeverity,
	DiagnosisStatus,
	DiagnosisType,
} from '@/constants/enum';
import type {
	ConsultationListItem,
	ConsultationOption,
	ConsultationRecord,
} from '@/types/consultation.type';

export const STAFF_OPTIONS_MOCK: ConsultationOption[] = [
	{ id: 'staff-1', label: 'Dr. Carlos Hernández' },
	{ id: 'staff-2', label: 'Dra. Ana López' },
];

export const APPOINTMENT_OPTIONS_MOCK: ConsultationOption[] = [
	{
		id: 'appointment-1',
		label: '08 oct 2026 · 10:30 a. m. · Consulta general',
	},
	{ id: 'appointment-2', label: '12 oct 2026 · 9:00 a. m. · Control' },
];

export const DIAGNOSIS_CATALOG_MOCK: string[] = [
	'Gastroenteritis',
	'Dermatitis atópica',
	'Dermatitis alérgica por pulgas',
	'Otitis externa',
	'Parasitosis intestinal',
	'Infección respiratoria superior',
	'Enfermedad periodontal',
	'Obesidad',
	'Cojera de origen traumático',
	'Conjuntivitis',
];

export const CONSULTATION_RECORDS_MOCK: ConsultationRecord[] = [
	{
		id: 'consultation-3',
		kind: ConsultationKind.DERMATOLOGICAL,
		status: ConsultationStatus.DRAFT,
		occurredAt: '2026-10-07T15:20:00.000Z',
		staffName: 'Dr. Carlos Hernández',
		reason: 'Prurito intenso en flancos y lamido constante de patas.',
		mainDiagnosis: undefined,
		requiresFollowUp: false,
		anamnesis:
			'Propietario refiere prurito desde hace una semana, con empeoramiento por las noches.',
		measurements: { weightKg: 12.4, temperatureC: 38.6 },
		physicalExam: '',
		diagnoses: [],
		noDefinedDiagnosis: false,
		instructions: '',
		internalNotes: '',
	},
	{
		id: 'consultation-1',
		kind: ConsultationKind.GENERAL,
		status: ConsultationStatus.FINALIZED,
		occurredAt: '2026-10-05T16:30:00.000Z',
		staffName: 'Dr. Carlos Hernández',
		reason: 'Vómitos desde hace dos días y disminución del apetito.',
		mainDiagnosis: 'Gastroenteritis presuntiva',
		requiresFollowUp: true,
		appointmentLabel: '05 oct 2026 · 10:30 a. m. · Consulta general',
		anamnesis:
			'Propietario refiere vómitos desde hace dos días, disminución del apetito y menor consumo de agua. Sin diarrea. Última desparasitación hace cuatro meses.',
		measurements: {
			weightKg: 12.4,
			temperatureC: 39.1,
			heartRateBpm: 110,
			respiratoryRateRpm: 28,
			bodyConditionScore: 5,
			hydration: 'MILD',
			mucousMembranes: 'PINK',
			capillaryRefill: 'LT_2S',
			pain: 'MILD',
		},
		physicalExam:
			'Estado general decaído pero alerta. Abdomen levemente doloroso a la palpación, sin masas. Piel y pelaje sin alteraciones. Ganglios sin hallazgos.',
		diagnoses: [
			{
				id: 'diagnosis-1',
				name: 'Gastroenteritis',
				type: DiagnosisType.PRESUMPTIVE,
				status: DiagnosisStatus.ACTIVE,
				severity: DiagnosisSeverity.MODERATE,
				notes: 'Pendiente de respuesta a dieta y soporte.',
				isActiveProblem: true,
			},
		],
		noDefinedDiagnosis: false,
		instructions:
			'Dieta blanda por 5 días, fraccionada en porciones pequeñas. Ofrecer agua fresca con frecuencia. Acudir de inmediato si presenta vómitos persistentes, sangre en las heces o decaimiento marcado.',
		internalNotes:
			'Propietario preocupado por costos; se explicó plan escalonado.',
		prognosis: 'FAVORABLE',
		followUp: {
			recommendedDate: '2026-10-12',
			reason: 'Control de evolución digestiva.',
		},
	},
	{
		id: 'consultation-2',
		kind: ConsultationKind.PREVENTIVE,
		status: ConsultationStatus.FINALIZED,
		occurredAt: '2026-09-20T14:00:00.000Z',
		staffName: 'Dra. Ana López',
		reason: 'Revisión preventiva semestral.',
		mainDiagnosis: undefined,
		requiresFollowUp: false,
		anamnesis: 'Sin quejas del propietario. Come y bebe con normalidad.',
		measurements: {
			weightKg: 11.8,
			temperatureC: 38.5,
			heartRateBpm: 96,
			respiratoryRateRpm: 24,
			bodyConditionScore: 5,
		},
		physicalExam: 'Paciente clínicamente estable. Sin hallazgos relevantes.',
		diagnoses: [],
		noDefinedDiagnosis: true,
		instructions: 'Mantener dieta y actividad habituales.',
		internalNotes: '',
		prognosis: 'FAVORABLE',
	},
	{
		id: 'consultation-0',
		kind: ConsultationKind.OTHER,
		status: ConsultationStatus.CANCELLED,
		occurredAt: '2026-06-10T13:00:00.000Z',
		staffName: 'Dra. Ana López',
		reason: 'Registro duplicado de una consulta anterior.',
		mainDiagnosis: undefined,
		requiresFollowUp: false,
		anamnesis: 'Registro anulado por duplicidad.',
		measurements: { weightKg: 11.5 },
		physicalExam: 'Sin información.',
		diagnoses: [],
		noDefinedDiagnosis: true,
		instructions: 'Sin indicaciones.',
	},
];

export function toConsultationListItem({
	id,
	kind,
	status,
	occurredAt,
	staffName,
	reason,
	mainDiagnosis,
	requiresFollowUp,
}: ConsultationRecord): ConsultationListItem {
	return {
		id,
		kind,
		status,
		occurredAt,
		staffName,
		reason,
		mainDiagnosis,
		requiresFollowUp,
	};
}

export function getConsultationMock(id: string) {
	return CONSULTATION_RECORDS_MOCK.find((record) => record.id === id);
}
