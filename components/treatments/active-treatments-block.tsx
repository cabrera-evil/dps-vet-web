'use client';

import { AdministrationContext, TreatmentStatus } from '@/constants/enum';
import { useTreatmentPlans } from '@/hooks/use-treatments';
import { formatDate } from '@/utils/date';
import { getEndDate, getNextApplication, getProgress } from '@/utils/treatment';
import { formatScheduledAt } from '@/utils/treatment-format';
import { parseISO } from 'date-fns';
import { Pill } from 'lucide-react';

/** Actionable one-liners for the summary: progress and next dose, never the full plan. */
export function ActiveTreatmentsBlock({ petId }: { petId: string }) {
	const { data: plans } = useTreatmentPlans(petId);
	const orders = (plans ?? [])
		.filter((plan) => plan.status === TreatmentStatus.ACTIVE)
		.flatMap((plan) =>
			plan.orders.filter((order) => order.status === TreatmentStatus.ACTIVE)
		);

	if (orders.length === 0)
		return (
			<p className="flex items-start gap-2 text-sm text-muted-foreground">
				<Pill className="mt-0.5 size-4 shrink-0" />
				Sin tratamientos activos.
			</p>
		);

	return (
		<ul className="flex flex-col gap-2 text-sm">
			{orders.map((order) => {
				const next = getNextApplication(order);
				const { done, total } = getProgress(order);
				return (
					<li key={order.id} className="flex flex-col">
						<span className="font-medium">{order.medicationName}</span>
						<span className="text-muted-foreground">
							{order.context === AdministrationContext.CLINIC
								? `${done} de ${total} aplicaciones${
										next
											? ` · Próxima: ${formatScheduledAt(next.scheduledAt)}`
											: ''
									}`
								: `En casa · Finaliza ${formatDate(
										getEndDate(parseISO(order.startsAt), order).toISOString()
									)}`}
						</span>
					</li>
				);
			})}
		</ul>
	);
}
