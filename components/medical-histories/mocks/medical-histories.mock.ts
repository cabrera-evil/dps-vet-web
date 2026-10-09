import { MedicalHistoryStatus, MedicalHistoryType } from '@/constants/enum';
import type { MedicalHistoryEntry } from '@/types/medical-history.type';

export const MEDICAL_HISTORIES_MOCK: MedicalHistoryEntry[] = [
	{
		id: 'history-1',
		type: MedicalHistoryType.MEDICAL,
		name: 'Dermatitis atópica',
		approximateDate: '2025-03-10',
		status: MedicalHistoryStatus.CHRONIC,
		description:
			'Presenta episodios recurrentes de prurito durante la temporada seca.',
		isAlert: true,
	},
	{
		id: 'history-2',
		type: MedicalHistoryType.MEDICAL,
		name: 'Otitis externa',
		approximateDate: '2024-08-02',
		status: MedicalHistoryStatus.RESOLVED,
		description:
			'Episodio único en oído derecho, resuelto con tratamiento tópico.',
		isAlert: false,
	},
	{
		id: 'history-3',
		type: MedicalHistoryType.SURGICAL,
		name: 'Orquiectomía',
		approximateDate: '2021-05-18',
		status: MedicalHistoryStatus.RESOLVED,
		description: 'Sin complicaciones postoperatorias.',
		isAlert: false,
	},
	{
		id: 'history-4',
		type: MedicalHistoryType.OTHER,
		name: 'Fractura de falange en miembro posterior',
		approximateDate: '2023-11-21',
		status: MedicalHistoryStatus.CONTROLLED,
		isAlert: false,
	},
];
