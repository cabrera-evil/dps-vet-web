'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FollowUpStatus, TreatmentStatus } from '@/constants/enum';
import { useTreatmentPlans } from '@/hooks/use-treatments';
import { formatDate } from '@/utils/date';
import {
	getNextApplication,
	getPendingToday,
	isOverdue,
} from '@/utils/treatment';
import { formatScheduledAt } from '@/utils/treatment-format';
import { endOfDay, isBefore, parseISO } from 'date-fns';
import Link from 'next/link';
import { ApplicationStatusBadge } from './application-status-badge';
import { RegisterApplicationDialog } from './register-application-dialog';

interface PendingTodayCardProps {
	petId: string;
	petName: string;
	canWrite: boolean;
}

/** What the patient needs today; renders nothing when there is nothing pending. */
export function PendingTodayCard({
	petId,
	petName,
	canWrite,
}: PendingTodayCardProps) {
	const { data: plans } = useTreatmentPlans(petId);
	const now = new Date();
	const applications = getPendingToday(plans ?? [], now);
	const controls = (plans ?? []).flatMap((plan) =>
		plan.followUp?.status === FollowUpStatus.PENDING &&
		plan.status !== TreatmentStatus.CANCELLED &&
		!isBefore(endOfDay(now), parseISO(plan.followUp.recommendedDate))
			? [{ plan, followUp: plan.followUp }]
			: []
	);

	if (applications.length === 0 && controls.length === 0) return null;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Pendientes de hoy</CardTitle>
			</CardHeader>
			<CardContent>
				<ul className="divide-y">
					{applications.map(({ plan, order, application }) => (
						<li
							key={application.id}
							className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
						>
							<div className="flex flex-col gap-0.5">
								<p className="text-sm font-medium">{order.medicationName}</p>
								<p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
									Dosis {application.sequence} de {application.total} ·
									Programada: {formatScheduledAt(application.scheduledAt)}
									{isOverdue(application, now) && (
										<ApplicationStatusBadge
											status={application.status}
											overdue
										/>
									)}
								</p>
							</div>
							{canWrite && getNextApplication(order)?.id === application.id && (
								<RegisterApplicationDialog
									petId={petId}
									petName={petName}
									treatmentId={plan.id}
									order={order}
									application={application}
									trigger={<Button size="sm">Registrar aplicación</Button>}
								/>
							)}
						</li>
					))}
					{controls.map(({ plan, followUp }) => (
						<li
							key={followUp.id}
							className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
						>
							<div className="flex flex-col gap-0.5">
								<p className="text-sm font-medium">
									Control · {plan.diagnosis}
								</p>
								<p className="text-sm text-muted-foreground">
									Recomendado: {formatDate(followUp.recommendedDate)} ·{' '}
									{followUp.reason}
								</p>
							</div>
							{canWrite && (
								<Button
									size="sm"
									variant="outline"
									nativeButton={false}
									render={
										<Link
											href={`/dashboard/patients/${petId}/follow-ups/${followUp.id}/control`}
										/>
									}
								>
									Registrar control
								</Button>
							)}
						</li>
					))}
				</ul>
			</CardContent>
		</Card>
	);
}
