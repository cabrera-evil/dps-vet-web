import { Badge } from '@/components/ui/badge';
import { TreatmentStatus } from '@/constants/enum';
import { TREATMENT_STATUS_LABEL } from '@/constants/treatment';
import {
	CircleCheck,
	CircleDashed,
	CircleX,
	PauseCircle,
	PlayCircle,
	type LucideIcon,
} from 'lucide-react';

const STATUS_VISUAL: Record<
	TreatmentStatus,
	{
		variant: 'default' | 'secondary' | 'destructive' | 'outline';
		icon: LucideIcon;
	}
> = {
	[TreatmentStatus.PLANNED]: { variant: 'outline', icon: CircleDashed },
	[TreatmentStatus.ACTIVE]: { variant: 'default', icon: PlayCircle },
	[TreatmentStatus.COMPLETED]: { variant: 'secondary', icon: CircleCheck },
	[TreatmentStatus.SUSPENDED]: { variant: 'outline', icon: PauseCircle },
	[TreatmentStatus.CANCELLED]: { variant: 'destructive', icon: CircleX },
};

export function TreatmentStatusBadge({ status }: { status: TreatmentStatus }) {
	const { variant, icon: Icon } = STATUS_VISUAL[status];
	return (
		<Badge variant={variant}>
			<Icon aria-hidden="true" />
			{TREATMENT_STATUS_LABEL[status]}
		</Badge>
	);
}
