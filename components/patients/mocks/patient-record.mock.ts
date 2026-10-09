import {
	CONSULTATION_RECORDS_MOCK,
	toConsultationListItem,
} from '@/components/consultations/mocks/consultations.mock';
import { MEDICAL_HISTORIES_MOCK } from '@/components/medical-histories/mocks/medical-histories.mock';
import { ClinicalAlertType, ItemStatus, PetSex } from '@/constants/enum';
import type { PatientRecordData } from '@/types/patient-record.type';

const FULL_RECORD: PatientRecordData = {
	patient: {
		id: 'patient-mock',
		name: 'Max',
		recordNumber: 'EXP-000123',
		species: 'Perro',
		breed: 'Labrador',
		sex: PetSex.MALE,
		sterilized: true,
		birthDate: '2020-03-14',
		color: 'Dorado',
		markings: 'Mancha blanca en el pecho',
		microchip: '941000012345678',
		status: ItemStatus.ACTIVE,
		ownerName: 'María Fernanda Rivas',
		ownerPhone: '+503 7012 3456',
		ownerEmail: 'maria.rivas@example.com',
	},
	summary: {
		alerts: [
			{
				id: 'alert-1',
				type: ClinicalAlertType.ALLERGY,
				title: 'Penicilina',
				detail: 'Reacción previa: urticaria.',
			},
			{
				id: 'alert-2',
				type: ClinicalAlertType.CHRONIC_CONDITION,
				title: 'Dermatitis atópica',
				detail: 'Episodios recurrentes en temporada seca.',
			},
		],
		activeProblems: [
			{ id: 'problem-1', name: 'Gastroenteritis', statusLabel: 'Activo' },
			{ id: 'problem-2', name: 'Dermatitis atópica', statusLabel: 'Crónico' },
		],
		weightHistory: [
			{ valueKg: 12.4, measuredAt: '2026-10-05T16:30:00.000Z' },
			{ valueKg: 11.8, measuredAt: '2026-09-20T14:00:00.000Z' },
			{ valueKg: 11.5, measuredAt: '2026-06-10T13:00:00.000Z' },
		],
		currentMedications: [],
		nextFollowUp: {
			id: 'follow-up-1',
			recommendedDate: '2026-10-12',
			reason: 'Control de evolución digestiva.',
			sourceConsultationId: 'consultation-1',
		},
	},
	histories: MEDICAL_HISTORIES_MOCK,
	consultations: CONSULTATION_RECORDS_MOCK.map(toConsultationListItem),
};

const EMPTY_RECORD: PatientRecordData = {
	patient: {
		...FULL_RECORD.patient,
		name: 'Luna',
		recordNumber: 'EXP-000124',
		species: 'Gato',
		breed: 'Criollo',
		sex: PetSex.FEMALE,
		sterilized: false,
		birthDate: '2025-08-01',
		color: undefined,
		markings: undefined,
		microchip: undefined,
	},
	summary: {
		alerts: [],
		activeProblems: [],
		weightHistory: [],
		currentMedications: [],
	},
	histories: [],
	consultations: [],
};

const PARTIAL_RECORD: PatientRecordData = {
	...EMPTY_RECORD,
	patient: {
		...EMPTY_RECORD.patient,
		name: 'Toby',
		recordNumber: 'EXP-000125',
		ownerPhone: undefined,
		ownerEmail: undefined,
	},
	summary: {
		...EMPTY_RECORD.summary,
		weightHistory: [{ valueKg: 4.2, measuredAt: '2026-09-02T15:00:00.000Z' }],
	},
	histories: MEDICAL_HISTORIES_MOCK.slice(0, 1),
};

/** UI-only: swap for the API response once the endpoints exist. */
export function getPatientRecordMock(
	patientId: string,
	scenario: string | null
): PatientRecordData {
	const base =
		scenario === 'empty'
			? EMPTY_RECORD
			: scenario === 'partial'
				? PARTIAL_RECORD
				: FULL_RECORD;
	return { ...base, patient: { ...base.patient, id: patientId } };
}
