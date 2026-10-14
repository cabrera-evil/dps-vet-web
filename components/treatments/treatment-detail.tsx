'use client';

import {
	ConsultationPatientBar,
	type ConsultationPatientContext,
} from '@/components/consultations/consultation-patient-bar';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
	AdministrationContext,
	FollowUpStatus,
	TreatmentStatus,
} from '@/constants/enum';
import {
	CONTROL_DECISION_LABEL,
	FOLLOW_UP_EVOLUTION_LABEL,
	FOLLOW_UP_STATUS_LABEL,
	TREATMENT_OUTCOME_LABEL,
	TREATMENT_STATUS_LABEL,
} from '@/constants/treatment';
import type { TreatmentPlan } from '@/types/treatment.type';
import { formatDate } from '@/utils/date';
import { toOwnerCarePlan } from '@/utils/owner-care-plan';
import { getEndDate, getProgress } from '@/utils/treatment';
import { parseISO } from 'date-fns';
import { CalendarClock, FileText } from 'lucide-react';
import Link from 'next/link';
import { ApplicationProgress } from './application-progress';
import { ApplicationTimeline } from './application-timeline';
import { CloseTreatmentDialog } from './close-treatment-dialog';
import { MedicationOrderSummary } from './medication-order-summary';
import { OwnerCarePreview } from './owner-care-preview';
import { OwnerVisibilityNote } from './owner-visibility-note';
import { TreatmentStatusBadge } from './treatment-status-badge';

interface TreatmentDetailProps {
	patientId: string;
	patient: ConsultationPatientContext;
	plan: TreatmentPlan;
	canWrite: boolean;
}

export function TreatmentDetail({
	patientId,
	patient,
	plan,
	canWrite,
}: TreatmentDetailProps) {
	const expedienteHref = `/dashboard/patients/${patientId}?tab=tratamientos`;
	const isOpen =
		plan.status === TreatmentStatus.ACTIVE ||
		plan.status === TreatmentStatus.PLANNED;
	const followUp = plan.followUp;

	return (
		<div className="flex flex-col gap-4">
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink render={<Link href={expedienteHref} />}>
							Expediente de {patient.name}
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>Tratamiento</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
			<ConsultationPatientBar patient={patient} />

			<article className="flex max-w-4xl flex-col gap-6">
				<header className="flex flex-col gap-3">
					<div className="flex flex-wrap items-center gap-3">
						<h2 className="font-heading text-xl font-semibold">
							{plan.diagnosis}
						</h2>
						<TreatmentStatusBadge status={plan.status} />
					</div>
					<p className="text-sm text-muted-foreground">
						Inicio {formatDate(plan.startsAt)}
						{plan.endsAt && ` · Finaliza ${formatDate(plan.endsAt)}`}
						{' · Consulta de origen: '}
						{plan.sourceConsultationId ? (
							<Link
								href={`/dashboard/patients/${patientId}/consultations/${plan.sourceConsultationId}`}
								className="underline-offset-4 hover:underline focus-visible:underline"
							>
								{plan.sourceConsultationLabel}
							</Link>
						) : (
							plan.sourceConsultationLabel
						)}
					</p>
					{plan.outcome && (
						<p className="text-sm">
							{[
								plan.status !== TreatmentStatus.CANCELLED &&
									`Resultado: ${TREATMENT_OUTCOME_LABEL[plan.outcome.result]}`,
								plan.outcome.notes,
							]
								.filter(Boolean)
								.join(' · ')}
						</p>
					)}
					<div className="flex flex-wrap gap-2">
						<Button
							variant="outline"
							nativeButton={false}
							render={
								<Link
									href={`/dashboard/patients/${patientId}/treatments/${plan.id}/prescription`}
								/>
							}
						>
							<FileText />
							Ver receta
						</Button>
						{canWrite && isOpen && (
							<>
								<CloseTreatmentDialog
									petId={patientId}
									plan={plan}
									action="COMPLETE"
									trigger={<Button>Finalizar tratamiento</Button>}
								/>
								<CloseTreatmentDialog
									petId={patientId}
									plan={plan}
									action="SUSPEND"
									trigger={<Button variant="outline">Suspender</Button>}
								/>
								<CloseTreatmentDialog
									petId={patientId}
									plan={plan}
									action="CANCEL"
									trigger={<Button variant="ghost">Cancelar</Button>}
								/>
							</>
						)}
					</div>
				</header>
				<Separator />

				<section className="flex flex-col gap-4" aria-label="Medicamentos">
					<h3 className="font-heading text-sm font-medium">Medicamentos</h3>
					{plan.orders.map((order) => {
						const { done, total } = getProgress(order);
						const isClinic = order.context === AdministrationContext.CLINIC;
						const replaced = plan.orders.find(
							({ replacedByOrderId }) => replacedByOrderId === order.id
						);
						const replacement = plan.orders.find(
							({ id }) => id === order.replacedByOrderId
						);
						return (
							<div
								key={order.id}
								className="flex flex-col gap-3 rounded-xl p-4 ring-1 ring-foreground/10"
							>
								<div className="flex flex-wrap items-start justify-between gap-2">
									<MedicationOrderSummary order={order} />
									{order.status !== TreatmentStatus.ACTIVE && (
										<TreatmentStatusBadge status={order.status} />
									)}
								</div>
								{(order.stoppedAt || order.stopReason) && (
									<p className="text-sm text-muted-foreground">
										{order.stoppedAt &&
											`${TREATMENT_STATUS_LABEL[order.status]} el ${formatDate(order.stoppedAt)}`}
										{order.stoppedAt && order.stopReason && ' · '}
										{order.stopReason && `Motivo: ${order.stopReason}`}
									</p>
								)}
								{replaced && (
									<p className="text-sm text-muted-foreground">
										Reemplaza a {replaced.medicationName}
									</p>
								)}
								{replacement && (
									<p className="text-sm text-muted-foreground">
										Reemplazado por {replacement.medicationName}
									</p>
								)}
								{order.instructions && (
									<div className="flex flex-col gap-1">
										<p className="text-sm whitespace-pre-line">
											{order.instructions}
										</p>
										<OwnerVisibilityNote variant="owner" />
									</div>
								)}
								{isClinic ? (
									<>
										<ApplicationProgress done={done} total={total} />
										<ApplicationTimeline
											petId={patientId}
											petName={patient.name}
											treatmentId={plan.id}
											order={order}
											canWrite={canWrite}
										/>
									</>
								) : (
									<p className="text-sm text-muted-foreground">
										En casa · Finaliza{' '}
										{formatDate(
											getEndDate(parseISO(order.startsAt), order).toISOString()
										)}
									</p>
								)}
							</div>
						);
					})}
				</section>

				{(plan.ownerInstructions || plan.internalNotes) && (
					<section className="flex flex-col gap-3" aria-label="Indicaciones">
						<h3 className="font-heading text-sm font-medium">Indicaciones</h3>
						{plan.ownerInstructions && (
							<div className="flex flex-col gap-1">
								<p className="text-sm whitespace-pre-line">
									{plan.ownerInstructions}
								</p>
								<OwnerVisibilityNote variant="owner" />
							</div>
						)}
						{plan.internalNotes && (
							<div className="flex flex-col gap-1 rounded-xl bg-muted p-3">
								<p className="text-sm whitespace-pre-line">
									{plan.internalNotes}
								</p>
								<OwnerVisibilityNote variant="internal" />
							</div>
						)}
					</section>
				)}

				{followUp && (
					<section className="flex flex-col gap-2" aria-label="Seguimiento">
						<h3 className="font-heading text-sm font-medium">Seguimiento</h3>
						<div className="flex flex-wrap items-center justify-between gap-3 rounded-xl p-3 ring-1 ring-foreground/10">
							<p className="flex items-start gap-2 text-sm">
								<CalendarClock className="mt-0.5 size-4 shrink-0" />
								<span>
									Control recomendado · {formatDate(followUp.recommendedDate)} ·{' '}
									{followUp.reason}{' '}
									<span className="text-muted-foreground">
										({FOLLOW_UP_STATUS_LABEL[followUp.status]})
									</span>
								</span>
							</p>
							{canWrite && followUp.status === FollowUpStatus.PENDING && (
								<Button
									variant="outline"
									size="sm"
									nativeButton={false}
									render={
										<Link
											href={`/dashboard/patients/${patientId}/follow-ups/${followUp.id}/control`}
										/>
									}
								>
									Registrar control
								</Button>
							)}
						</div>
					</section>
				)}

				{!!plan.controls?.length && (
					<section className="flex flex-col gap-2" aria-label="Controles">
						<h3 className="font-heading text-sm font-medium">Controles</h3>
						<ul className="flex flex-col gap-2">
							{plan.controls.map((control) => (
								<li
									key={control.id}
									className="flex flex-col gap-0.5 rounded-xl p-3 text-sm ring-1 ring-foreground/10"
								>
									<span className="font-medium">
										{formatDate(control.registeredAt)} ·{' '}
										{FOLLOW_UP_EVOLUTION_LABEL[control.evolution]}
										{control.decision &&
											` · ${CONTROL_DECISION_LABEL[control.decision]}`}
									</span>
									<span className="text-muted-foreground">
										{control.reason} · Control recomendado para{' '}
										{formatDate(control.recommendedDate)}
									</span>
									{(control.weightKg || control.temperatureC) && (
										<span>
											{[
												control.weightKg && `Peso: ${control.weightKg} kg`,
												control.temperatureC &&
													`Temperatura: ${control.temperatureC} °C`,
											]
												.filter(Boolean)
												.join(' · ')}
										</span>
									)}
									{control.clinicalNotes && (
										<span className="whitespace-pre-line">
											Observaciones: {control.clinicalNotes}
										</span>
									)}
									{control.treatmentResponse && (
										<span className="whitespace-pre-line">
											Respuesta al tratamiento: {control.treatmentResponse}
										</span>
									)}
								</li>
							))}
						</ul>
					</section>
				)}

				<OwnerCarePreview plan={toOwnerCarePlan(plan)} />

				<div>
					<Button
						variant="outline"
						nativeButton={false}
						render={<Link href={expedienteHref} />}
					>
						Volver al expediente
					</Button>
				</div>
			</article>
		</div>
	);
}
