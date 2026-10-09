import { Badge } from '@/components/ui/badge';
import { ApplicationStatus } from '@/constants/enum';
import { APPLICATION_STATUS_LABEL } from '@/constants/treatment';
import {
	CircleCheck,
	CircleSlash,
	CircleX,
	Clock,
	TriangleAlert,
	type LucideIcon,
} from 'lucide-react';

const STATUS_VISUAL: Record<
	ApplicationStatus,
	{
		variant: 'default' | 'secondary' | 'destructive' | 'outline';
		icon: LucideIcon;
	}
> = {
	[ApplicationStatus.SCHEDULED]: { variant: 'outline', icon: Clock },
	[ApplicationStatus.COMPLETED]: { variant: 'secondary', icon: CircleCheck },
	[ApplicationStatus.SKIPPED]: { variant: 'outline', icon: CircleSlash },
	[ApplicationStatus.CANCELLED]: { variant: 'outline', icon: CircleX },
};

interface ApplicationStatusBadgeProps {
	status: ApplicationStatus;
	overdue?: boolean;
}

/** `overdue` is derived (scheduled in the past), not a stored status. */
export function ApplicationStatusBadge({
	status,
	overdue = false,
}: ApplicationStatusBadgeProps) {
	if (overdue && status === ApplicationStatus.SCHEDULED)
		return (
			<Badge variant="destructive">
				<TriangleAlert aria-hidden="true" />
				Vencida
			</Badge>
		);

	const { variant, icon: Icon } = STATUS_VISUAL[status];
	return (
		<Badge variant={variant}>
			<Icon aria-hidden="true" />
			{APPLICATION_STATUS_LABEL[status]}
		</Badge>
	);
}
