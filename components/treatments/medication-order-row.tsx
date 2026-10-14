'use client';

import { Button } from '@/components/ui/button';
import { AdministrationContext } from '@/constants/enum';
import type { MedicationOrder, TreatmentPlan } from '@/types/treatment.type';
import { formatDate } from '@/utils/date';
import {
	getEndDate,
	getNextApplication,
	getProgress,
	isOverdue,
} from '@/utils/treatment';
import { formatScheduledAt } from '@/utils/treatment-format';
import { parseISO } from 'date-fns';
import { ApplicationProgress } from './application-progress';
import { ApplicationStatusBadge } from './application-status-badge';
import { MedicationOrderSummary } from './medication-order-summary';
import { RegisterApplicationDialog } from './register-application-dialog';

interface MedicationOrderRowProps {
	petId: string;
	petName: string;
	plan: TreatmentPlan;
	order: MedicationOrder;
	canWrite: boolean;
}

/** One medication of a plan: what was indicated, progress and the next action. */
export function MedicationOrderRow({
	petId,
	petName,
	plan,
	order,
	canWrite,
}: MedicationOrderRowProps) {
	const isClinic = order.context === AdministrationContext.CLINIC;
	const { done, total } = getProgress(order);
	const next = getNextApplication(order);

	return (
		<li className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0">
			<MedicationOrderSummary order={order} />
			{isClinic ? (
				<div className="flex flex-wrap items-end justify-between gap-3">
					<div className="flex flex-col gap-2">
						<ApplicationProgress done={done} total={total} />
						{next ? (
							<p className="flex flex-wrap items-center gap-2 text-sm">
								<span className="text-muted-foreground">Próxima:</span>
								<span className="font-medium">
									{formatScheduledAt(next.scheduledAt)}
								</span>
								{isOverdue(next, new Date()) && (
									<ApplicationStatusBadge status={next.status} overdue />
								)}
							</p>
						) : (
							<p className="text-sm text-muted-foreground">
								No hay aplicaciones pendientes.
							</p>
						)}
					</div>
					{canWrite && next && (
						<RegisterApplicationDialog
							petId={petId}
							petName={petName}
							treatmentId={plan.id}
							order={order}
							application={next}
							trigger={<Button size="sm">Registrar aplicación</Button>}
						/>
					)}
				</div>
			) : (
				<p className="text-sm text-muted-foreground">
					En casa · Finaliza{' '}
					{formatDate(
						getEndDate(parseISO(order.startsAt), order).toISOString()
					)}
				</p>
			)}
		</li>
	);
}
