import type { MedicationOrder } from '@/types/treatment.type';
import { formatOrderLine } from '@/utils/treatment-format';

interface MedicationOrderSummaryProps {
	order: MedicationOrder;
	/** The catalog medication is inactive or no longer exists. */
	unavailable?: boolean;
}

export function MedicationOrderSummary({
	order,
	unavailable = false,
}: MedicationOrderSummaryProps) {
	return (
		<div className="flex flex-col gap-0.5">
			<p className="text-sm font-medium">
				{order.medicationName}
				{order.presentation && (
					<span className="font-normal text-muted-foreground">
						{' '}
						· {order.presentation}
					</span>
				)}
			</p>
			<p className="text-sm text-muted-foreground">{formatOrderLine(order)}</p>
			{unavailable && (
				<p className="text-xs text-muted-foreground">
					Medicamento no disponible en el catálogo actual.
				</p>
			)}
		</div>
	);
}
