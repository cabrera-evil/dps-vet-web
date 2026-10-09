import { MedicalHistoryStatus, MedicalHistoryType } from '@/constants/enum';

export interface MedicalHistoryEntry {
	id: string;
	type: MedicalHistoryType;
	name: string;
	approximateDate?: string;
	status: MedicalHistoryStatus;
	description?: string;
	isAlert: boolean;
}
