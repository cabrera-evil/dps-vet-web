import { Button } from '@/components/ui/button';
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { TreatmentStatus } from '@/constants/enum';
import { TREATMENT_OUTCOME_LABEL } from '@/constants/treatment';
import type { TreatmentPlan } from '@/types/treatment.type';
import { formatDate } from '@/utils/date';
import Link from 'next/link';
import { MedicationOrderSummary } from './medication-order-summary';
import { TreatmentStatusBadge } from './treatment-status-badge';

interface TreatmentHistoryItemProps {
	petId: string;
	plan: TreatmentPlan;
}

export function TreatmentHistoryItem({
	petId,
	plan,
}: TreatmentHistoryItemProps) {
	const end = plan.outcome?.closedAt ?? plan.endsAt;

	return (
		<Card size="sm">
			<CardHeader>
				<CardTitle className="flex flex-wrap items-center gap-2">
					{plan.diagnosis}
					<TreatmentStatusBadge status={plan.status} />
				</CardTitle>
				<CardAction>
					<Button
						variant="ghost"
						size="sm"
						nativeButton={false}
						render={
							<Link
								href={`/dashboard/patients/${petId}/treatments/${plan.id}`}
							/>
						}
					>
						Ver detalle
					</Button>
				</CardAction>
			</CardHeader>
			<CardContent className="flex flex-col gap-3">
				<p className="text-sm text-muted-foreground">
					{formatDate(plan.startsAt)}
					{end && ` – ${formatDate(end)}`}
					{plan.outcome &&
						plan.status !== TreatmentStatus.CANCELLED &&
						` · ${TREATMENT_OUTCOME_LABEL[plan.outcome.result]}`}
					{' · '}
					{plan.sourceConsultationId ? (
						<Link
							href={`/dashboard/patients/${petId}/consultations/${plan.sourceConsultationId}`}
							className="underline-offset-4 hover:underline focus-visible:underline"
						>
							{plan.sourceConsultationLabel}
						</Link>
					) : (
						plan.sourceConsultationLabel
					)}
				</p>
				<ul className="flex flex-col gap-2">
					{plan.orders.map((order) => (
						<li key={order.id}>
							<MedicationOrderSummary order={order} />
						</li>
					))}
				</ul>
			</CardContent>
		</Card>
	);
}
