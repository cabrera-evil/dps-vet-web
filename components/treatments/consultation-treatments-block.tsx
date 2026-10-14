'use client';

import { Button } from '@/components/ui/button';
import { AdministrationContext } from '@/constants/enum';
import { useTreatmentPlans } from '@/hooks/use-treatments';
import { getProgress } from '@/utils/treatment';
import Link from 'next/link';
import { MedicationOrderSummary } from './medication-order-summary';
import { TreatmentStatusBadge } from './treatment-status-badge';

interface ConsultationTreatmentsBlockProps {
	patientId: string;
	consultationId: string;
}

/** Treatments born in a finalized consultation; renders nothing when it has none. */
export function ConsultationTreatmentsBlock({
	patientId,
	consultationId,
}: ConsultationTreatmentsBlockProps) {
	const { data: plans } = useTreatmentPlans(patientId);
	const own = (plans ?? []).filter(
		(plan) => plan.sourceConsultationId === consultationId
	);

	if (own.length === 0) return null;

	return (
		<section className="flex flex-col gap-3">
			<h3 className="font-heading text-sm font-medium">Tratamiento indicado</h3>
			{own.map((plan) => (
				<div
					key={plan.id}
					className="flex flex-col gap-3 rounded-xl p-3 ring-1 ring-foreground/10"
				>
					<div className="flex flex-wrap items-center gap-2">
						<span className="text-sm font-medium">{plan.diagnosis}</span>
						<TreatmentStatusBadge status={plan.status} />
					</div>
					<ul className="flex flex-col gap-2">
						{plan.orders.map((order) => {
							const { done, total } = getProgress(order);
							return (
								<li key={order.id} className="flex flex-col gap-0.5">
									<MedicationOrderSummary order={order} />
									{order.context === AdministrationContext.CLINIC &&
										total > 0 && (
											<p className="text-xs text-muted-foreground tabular-nums">
												{done}/{total} aplicaciones
											</p>
										)}
								</li>
							);
						})}
					</ul>
					<div>
						<Button
							variant="outline"
							size="sm"
							nativeButton={false}
							render={
								<Link
									href={`/dashboard/patients/${patientId}/treatments/${plan.id}`}
								/>
							}
						>
							Ver tratamiento completo
						</Button>
					</div>
				</div>
			))}
		</section>
	);
}
