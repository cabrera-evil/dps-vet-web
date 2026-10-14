import { CLINICAL_ALERT_LABEL } from '@/constants/clinical';
import { ClinicalAlertType } from '@/constants/enum';
import { cn } from '@/lib/utils';
import type { ClinicalAlert } from '@/types/patient-record.type';
import { HeartPulse, ShieldCheck, TriangleAlert } from 'lucide-react';

const ALERT_ICON = {
	[ClinicalAlertType.ALLERGY]: TriangleAlert,
	[ClinicalAlertType.ADVERSE_REACTION]: TriangleAlert,
	[ClinicalAlertType.CHRONIC_CONDITION]: HeartPulse,
};

interface ClinicalAlertListProps {
	alerts: ClinicalAlert[];
	showEmpty?: boolean;
	className?: string;
}

/** Compact, persistent alert chips: icon + type label + name, never color alone. */
export function ClinicalAlertList({
	alerts,
	showEmpty = true,
	className,
}: ClinicalAlertListProps) {
	if (alerts.length === 0) {
		if (!showEmpty) return null;
		return (
			<p
				className={cn(
					'flex items-center gap-1.5 text-sm text-muted-foreground',
					className
				)}
			>
				<ShieldCheck className="size-4" />
				Sin alertas clínicas registradas
			</p>
		);
	}

	return (
		<ul
			aria-label="Alertas clínicas"
			className={cn('flex flex-wrap gap-2', className)}
		>
			{alerts.map((alert) => {
				const Icon = ALERT_ICON[alert.type];
				const isCritical = alert.type !== ClinicalAlertType.CHRONIC_CONDITION;
				return (
					<li
						key={alert.id}
						className={cn(
							'flex items-center gap-2 rounded-lg border px-2.5 py-1 text-sm',
							isCritical
								? 'border-destructive/30 bg-destructive/10 text-destructive'
								: 'border-border bg-muted text-foreground'
						)}
					>
						<Icon className="size-4 shrink-0" aria-hidden="true" />
						<span className="text-xs font-semibold tracking-wide uppercase">
							{CLINICAL_ALERT_LABEL[alert.type]}
						</span>
						<span className="font-medium">{alert.title}</span>
					</li>
				);
			})}
		</ul>
	);
}
