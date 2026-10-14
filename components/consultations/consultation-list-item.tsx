import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConsultationStatus } from '@/constants/enum';
import { cn } from '@/lib/utils';
import type { ConsultationListItem as ConsultationListItemData } from '@/types/consultation.type';
import { getConsultationKindLabel } from '@/utils/consultation';
import { formatDate, formatTime } from '@/utils/date';
import { CalendarClock } from 'lucide-react';
import Link from 'next/link';
import { ConsultationStatusBadge } from './consultation-status-badge';

interface ConsultationListItemProps {
	patientId: string;
	consultation: ConsultationListItemData;
}

export function ConsultationListItem({
	patientId,
	consultation,
}: ConsultationListItemProps) {
	const isDraft = consultation.status === ConsultationStatus.DRAFT;
	const isFinalized = consultation.status === ConsultationStatus.FINALIZED;

	return (
		<li className="relative pb-6 pl-6 last:pb-0">
			<span
				aria-hidden="true"
				className={cn(
					'absolute top-1.5 -left-[5px] size-2.5 rounded-full ring-4 ring-background',
					isFinalized ? 'bg-primary' : 'bg-border'
				)}
			/>
			<div className="flex flex-col gap-2 rounded-xl p-3 ring-1 ring-foreground/10">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
						{formatDate(consultation.occurredAt)} ·{' '}
						{formatTime(consultation.occurredAt)}
					</p>
					<div className="flex flex-wrap items-center gap-2">
						{consultation.requiresFollowUp && (
							<Badge variant="outline">
								<CalendarClock data-icon="inline-start" />
								Requiere seguimiento
							</Badge>
						)}
						<ConsultationStatusBadge status={consultation.status} />
					</div>
				</div>
				<div>
					<h4 className="font-heading text-sm font-medium">
						{getConsultationKindLabel(consultation.kind)}
					</h4>
					<p className="text-xs text-muted-foreground">
						{consultation.staffName}
					</p>
				</div>
				<p className="line-clamp-2 text-sm">
					{consultation.reason ?? (
						<span className="text-muted-foreground">
							Sin motivo registrado.
						</span>
					)}
				</p>
				{consultation.mainDiagnosis && (
					<p className="text-sm">
						<span className="text-muted-foreground">Diagnóstico: </span>
						{consultation.mainDiagnosis}
					</p>
				)}
				<div>
					<Button
						variant="outline"
						size="sm"
						nativeButton={false}
						render={
							<Link
								href={`/dashboard/patients/${patientId}/consultations/${consultation.id}`}
							/>
						}
					>
						{isDraft ? 'Continuar borrador' : 'Ver detalle'}
					</Button>
				</div>
			</div>
		</li>
	);
}
