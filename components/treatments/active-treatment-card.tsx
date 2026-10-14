'use client';

import { Button } from '@/components/ui/button';
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { TreatmentStatus } from '@/constants/enum';
import type { TreatmentPlan } from '@/types/treatment.type';
import { formatDate } from '@/utils/date';
import Link from 'next/link';
import { MedicationOrderRow } from './medication-order-row';
import { TreatmentStatusBadge } from './treatment-status-badge';

interface ActiveTreatmentCardProps {
	petId: string;
	petName: string;
	plan: TreatmentPlan;
	canWrite: boolean;
}

export function ActiveTreatmentCard({
	petId,
	petName,
	plan,
	canWrite,
}: ActiveTreatmentCardProps) {
	const activeOrders = plan.orders.filter(
		(order) =>
			order.status === TreatmentStatus.ACTIVE ||
			order.status === TreatmentStatus.PLANNED
	);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex flex-wrap items-center gap-2">
					{plan.diagnosis}
					<TreatmentStatusBadge status={plan.status} />
				</CardTitle>
				<CardAction>
					<Button
						variant="outline"
						size="sm"
						nativeButton={false}
						render={
							<Link
								href={`/dashboard/patients/${petId}/treatments/${plan.id}`}
							/>
						}
					>
						Ver tratamiento
					</Button>
				</CardAction>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
					<div>
						<dt className="text-xs text-muted-foreground">Inicio</dt>
						<dd className="font-medium">{formatDate(plan.startsAt)}</dd>
					</div>
					{plan.endsAt && (
						<div>
							<dt className="text-xs text-muted-foreground">Finaliza</dt>
							<dd className="font-medium">{formatDate(plan.endsAt)}</dd>
						</div>
					)}
					<div>
						<dt className="text-xs text-muted-foreground">
							Consulta de origen
						</dt>
						<dd className="font-medium">
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
						</dd>
					</div>
				</dl>
				<ul className="divide-y">
					{activeOrders.map((order) => (
						<MedicationOrderRow
							key={order.id}
							petId={petId}
							petName={petName}
							plan={plan}
							order={order}
							canWrite={canWrite}
						/>
					))}
				</ul>
			</CardContent>
		</Card>
	);
}
