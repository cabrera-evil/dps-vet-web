import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from '@/components/ui/empty';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface PatientRecordNoticeProps {
	icon: LucideIcon;
	title: string;
	description: string;
	action?: ReactNode;
}

/** Full-width state for errors, missing data, or insufficient permissions. */
export function PatientRecordNotice({
	icon: Icon,
	title,
	description,
	action,
}: PatientRecordNoticeProps) {
	return (
		<Empty className="border">
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<Icon />
				</EmptyMedia>
				<EmptyTitle>{title}</EmptyTitle>
				<EmptyDescription>{description}</EmptyDescription>
			</EmptyHeader>
			{action && <EmptyContent>{action}</EmptyContent>}
		</Empty>
	);
}
