import { Badge } from '@/components/ui/badge';
import { CONSULTATION_STATUS_LABEL } from '@/constants/clinical';
import { ConsultationStatus } from '@/constants/enum';

const STATUS_VARIANT: Record<
	ConsultationStatus,
	'default' | 'secondary' | 'destructive' | 'outline'
> = {
	[ConsultationStatus.DRAFT]: 'outline',
	[ConsultationStatus.FINALIZED]: 'secondary',
	[ConsultationStatus.CANCELLED]: 'destructive',
};

export function ConsultationStatusBadge({
	status,
}: {
	status: ConsultationStatus;
}) {
	return (
		<Badge variant={STATUS_VARIANT[status]}>
			{CONSULTATION_STATUS_LABEL[status]}
		</Badge>
	);
}
