import type { WithId } from '@/app/api/_shared/repository/repository.types';
import type { ApiPagination } from '@/types/api.type';
import type { Appointment } from './appointment.schema';

export type AppointmentListResult = {
	items: WithId<Appointment>[];
	pagination: ApiPagination;
};
