import { Badge } from '@/components/ui/badge';
import { AppointmentStatus } from '@/constants/enum';

const STATUS_LABEL: Record<AppointmentStatus, string> = {
	[AppointmentStatus.PENDING]: 'Pendiente',
	[AppointmentStatus.CONFIRMED]: 'Confirmada',
	[AppointmentStatus.ATTENDED]: 'Atendida',
	[AppointmentStatus.CANCELLED]: 'Cancelada',
	[AppointmentStatus.NO_SHOW]: 'No asistió',
};

const STATUS_VARIANT: Record<
	AppointmentStatus,
	'default' | 'secondary' | 'destructive' | 'outline'
> = {
	[AppointmentStatus.PENDING]: 'outline',
	[AppointmentStatus.CONFIRMED]: 'default',
	[AppointmentStatus.ATTENDED]: 'secondary',
	[AppointmentStatus.CANCELLED]: 'destructive',
	[AppointmentStatus.NO_SHOW]: 'destructive',
};

export function AppointmentStatusBadge({
	status,
}: {
	status: AppointmentStatus;
}) {
	return <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>;
}
