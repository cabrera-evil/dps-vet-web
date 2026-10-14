'use client';

import { Button } from '@/components/ui/button';
import {
	AdverseReactionSeverity,
	ApplicationStatus,
	TreatmentStatus,
} from '@/constants/enum';
import {
	ADMINISTRATION_ROUTE_SHORT_LABEL,
	DOSE_UNIT_LABEL,
} from '@/constants/treatment';
import type {
	MedicationApplication,
	MedicationOrder,
} from '@/types/treatment.type';
import { getNextApplication, isOverdue } from '@/utils/treatment';
import { formatScheduledAt } from '@/utils/treatment-format';
import { AdverseReactionCallout } from './adverse-reaction-callout';
import { ApplicationStatusBadge } from './application-status-badge';
import { RegisterApplicationDialog } from './register-application-dialog';
import { SkipApplicationDialog } from './skip-application-dialog';

interface ApplicationTimelineProps {
	petId: string;
	petName: string;
	treatmentId: string;
	order: MedicationOrder;
	canWrite: boolean;
}

function ApplicationDetail({
	application,
	order,
}: {
	application: MedicationApplication;
	order: MedicationOrder;
}) {
	const lines = [
		application.administeredAt &&
			`Aplicada: ${formatScheduledAt(application.administeredAt)}`,
		application.actualDose !== undefined &&
			`Dosis: ${application.actualDose} ${
				DOSE_UNIT_LABEL[application.actualDoseUnit ?? order.doseUnit]
			}`,
		application.actualRoute &&
			ADMINISTRATION_ROUTE_SHORT_LABEL[application.actualRoute],
		application.site,
		application.administeredByName && `Por ${application.administeredByName}`,
		application.skipReason && `Motivo: ${application.skipReason}`,
		application.notes,
	].filter(Boolean);

	return lines.length ? (
		<p className="text-xs text-muted-foreground">{lines.join(' · ')}</p>
	) : null;
}

/** Every application of a medication, in order; only the next one can be acted on. */
export function ApplicationTimeline({
	petId,
	petName,
	treatmentId,
	order,
	canWrite,
}: ApplicationTimelineProps) {
	const now = new Date();
	const next = getNextApplication(order);
	const isOpen = order.status === TreatmentStatus.ACTIVE;
	const applications = [...order.applications].sort(
		(a, b) => a.sequence - b.sequence
	);

	if (applications.length === 0)
		return (
			<p className="text-sm text-muted-foreground">
				No hay aplicaciones programadas.
			</p>
		);

	return (
		<ol className="flex flex-col divide-y">
			{applications.map((application) => {
				const actionable =
					canWrite &&
					isOpen &&
					next?.id === application.id &&
					application.status === ApplicationStatus.SCHEDULED;
				const reaction = application.adverseReaction;
				const showCallout =
					canWrite &&
					reaction &&
					(reaction.severity === AdverseReactionSeverity.MODERATE ||
						reaction.severity === AdverseReactionSeverity.SEVERE);

				return (
					<li key={application.id} className="flex flex-col gap-2 py-3">
						<div className="flex flex-wrap items-center justify-between gap-2">
							<div className="flex flex-col gap-0.5">
								<p className="text-sm font-medium tabular-nums">
									Aplicación {application.sequence} de {application.total} ·{' '}
									{formatScheduledAt(application.scheduledAt)}
								</p>
								<ApplicationDetail application={application} order={order} />
							</div>
							<div className="flex flex-wrap items-center gap-2">
								<ApplicationStatusBadge
									status={application.status}
									overdue={isOverdue(application, now)}
								/>
								{actionable && (
									<>
										<RegisterApplicationDialog
											petId={petId}
											petName={petName}
											treatmentId={treatmentId}
											order={order}
											application={application}
											trigger={<Button size="sm">Registrar aplicación</Button>}
										/>
										<SkipApplicationDialog
											petId={petId}
											treatmentId={treatmentId}
											order={order}
											application={application}
											trigger={
												<Button size="sm" variant="ghost">
													Omitir
												</Button>
											}
										/>
									</>
								)}
							</div>
						</div>
						{showCallout && (
							<AdverseReactionCallout
								petId={petId}
								medicationName={order.medicationName}
								reaction={reaction}
							/>
						)}
					</li>
				);
			})}
		</ol>
	);
}
