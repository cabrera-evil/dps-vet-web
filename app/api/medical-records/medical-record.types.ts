import type { WithId } from '@/app/api/_shared/repository/repository.types';
import type { ApiPagination } from '@/types/api.type';
import type { MedicalRecord } from './medical-record.schema';

export type MedicalRecordListResult = {
	items: WithId<MedicalRecord>[];
	pagination: ApiPagination;
};

export type AttachmentUploadResult = {
	path: string;
	uploadUrl: string;
};

export type AttachmentDownloadResult = {
	downloadUrl: string;
};
