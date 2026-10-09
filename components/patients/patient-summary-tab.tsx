import { ActiveTreatmentsBlock } from '@/components/treatments/active-treatments-block';
import { PendingTodayCard } from '@/components/treatments/pending-today-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { RecordTab } from '@/constants/clinical';
import {
	CLINICAL_ALERT_LABEL,
	MEDICAL_HISTORY_STATUS_LABEL,
} from '@/constants/clinical';
import { useTreatmentPlans } from '@/hooks/use-treatments';
import type { ConsultationListItem } from '@/types/consultation.type';
import type { MedicalHistoryEntry } from '@/types/medical-history.type';
import type { PatientClinicalSummary } from '@/types/patient-record.type';
import { getConsultationKindLabel } from '@/utils/consultation';
import { formatDate } from '@/utils/date';
import {
	CalendarClock,
	Scale,
	TrendingDown,
	TrendingUp,
	TriangleAlert,
} from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

interface PatientSummaryTabProps {
	patientId: string;
	patientName: string;
	summary: PatientClinicalSummary;
	histories: MedicalHistoryEntry[];
	lastConsultation?: ConsultationListItem;
	canWrite: boolean;
	onGoToTab: (tab: RecordTab) => void;
}

function SummaryBlock({
	title,
	children,
}: {
	title: string;
	children: ReactNode;
}) {
	return (
		<section className="flex flex-col gap-2">
			<h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
				{title}
			</h3>
			{children}
		</section>
	);
}

const Muted = ({ children }: { children: ReactNode }) => (
	<p className="text-sm text-muted-foreground">{children}</p>
);

function WeightBlock({
	history,
}: {
	history: PatientClinicalSummary['weightHistory'];
}) {
	const [latest, previous] = history;
	if (!latest) return <Muted>Sin peso registrado.</Muted>;

	const delta = previous
		? Math.round((latest.valueKg - previous.valueKg) * 100) / 100
		: undefined;
	const DeltaIcon =
		delta !== undefined && delta < 0 ? TrendingDown : TrendingUp;

	return (
		<div className="flex flex-col gap-1">
			<p className="flex items-baseline gap-2">
				<Scale className="size-4 self-center text-muted-foreground" />
				<span className="text-2xl font-semibold tabular-nums">
					{latest.valueKg} kg
				</span>
			</p>
			<p className="text-xs text-muted-foreground">
				Medido el {formatDate(latest.measuredAt)}
			</p>
			{previous && delta !== undefined && (
				<p className="flex items-center gap-1 text-xs text-muted-foreground">
					<DeltaIcon className="size-3" />
					{delta > 0 ? '+' : ''}
					{delta} kg frente a {previous.valueKg} kg (
					{formatDate(previous.measuredAt)})
				</p>
			)}
		</div>
	);
}

export function PatientSummaryTab({
	patientId,
	patientName,
	summary,
	histories,
	lastConsultation,
	canWrite,
	onGoToTab,
}: PatientSummaryTabProps) {
	const relevantHistories = histories.filter((entry) => entry.isAlert);
	const { data: plans } = useTreatmentPlans(patientId);
	const followUpHasPlan = !!plans?.some(
		(plan) => plan.followUp?.id === summary.nextFollowUp?.id
	);

	return (
		<div className="flex flex-col gap-4">
			{summary.alerts.length > 0 && (
				<div className="grid gap-2 md:grid-cols-2">
					{summary.alerts.map((alert) => (
						<Alert key={alert.id} variant="destructive">
							<TriangleAlert />
							<AlertTitle>
								{CLINICAL_ALERT_LABEL[alert.type]}: {alert.title}
							</AlertTitle>
							{alert.detail && (
								<AlertDescription>{alert.detail}</AlertDescription>
							)}
						</Alert>
					))}
				</div>
			)}

			<PendingTodayCard
				petId={patientId}
				petName={patientName}
				canWrite={canWrite}
			/>

			<div className="grid items-start gap-4 lg:grid-cols-3">
				<div className="flex flex-col gap-4 lg:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle>Última consulta</CardTitle>
							{lastConsultation && (
								<CardAction>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => onGoToTab('consultas')}
									>
										Ver historial
									</Button>
								</CardAction>
							)}
						</CardHeader>
						<CardContent className="flex flex-col gap-3">
							{lastConsultation ? (
								<>
									<div>
										<p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
											{formatDate(lastConsultation.occurredAt)}
										</p>
										<p className="font-heading text-sm font-medium">
											{getConsultationKindLabel(lastConsultation.kind)}
										</p>
									</div>
									<div>
										<p className="text-xs text-muted-foreground">Motivo</p>
										<p className="text-sm">
											{lastConsultation.reason ?? 'Sin motivo registrado.'}
										</p>
									</div>
									{lastConsultation.mainDiagnosis && (
										<div>
											<p className="text-xs text-muted-foreground">
												Diagnóstico
											</p>
											<p className="text-sm">
												{lastConsultation.mainDiagnosis}
											</p>
										</div>
									)}
									<div>
										<Button
											variant="outline"
											size="sm"
											nativeButton={false}
											render={
												<Link
													href={`/dashboard/patients/${patientId}/consultations/${lastConsultation.id}`}
												/>
											}
										>
											Ver consulta
										</Button>
									</div>
								</>
							) : (
								<>
									<Muted>
										Este paciente aún no tiene consultas finalizadas.
									</Muted>
									{canWrite && (
										<div>
											<Button
												size="sm"
												nativeButton={false}
												render={
													<Link
														href={`/dashboard/patients/${patientId}/consultations/new`}
													/>
												}
											>
												Registrar primera consulta
											</Button>
										</div>
									)}
								</>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Antecedentes importantes</CardTitle>
							{histories.length > 0 && (
								<CardAction>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => onGoToTab('antecedentes')}
									>
										Ver todos
									</Button>
								</CardAction>
							)}
						</CardHeader>
						<CardContent>
							{relevantHistories.length === 0 ? (
								<Muted>Sin antecedentes marcados como relevantes.</Muted>
							) : (
								<ul className="divide-y">
									{relevantHistories.map((entry) => (
										<li
											key={entry.id}
											className="flex items-center justify-between gap-2 py-2 first:pt-0 last:pb-0"
										>
											<span className="text-sm font-medium">{entry.name}</span>
											<Badge variant="outline">
												{MEDICAL_HISTORY_STATUS_LABEL[entry.status]}
											</Badge>
										</li>
									))}
								</ul>
							)}
						</CardContent>
					</Card>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Estado clínico actual</CardTitle>
					</CardHeader>
					<CardContent className="flex flex-col gap-4">
						<SummaryBlock title="Último peso">
							<WeightBlock history={summary.weightHistory} />
						</SummaryBlock>
						<Separator />
						<SummaryBlock title="Problemas activos">
							{summary.activeProblems.length === 0 ? (
								<Muted>Sin problemas activos.</Muted>
							) : (
								<ul className="flex flex-col gap-1.5">
									{summary.activeProblems.map((problem) => (
										<li
											key={problem.id}
											className="flex items-center justify-between gap-2 text-sm"
										>
											<span className="font-medium">{problem.name}</span>
											<Badge variant="outline">{problem.statusLabel}</Badge>
										</li>
									))}
								</ul>
							)}
						</SummaryBlock>
						<Separator />
						<SummaryBlock title="Tratamientos activos">
							<ActiveTreatmentsBlock petId={patientId} />
							<Button
								variant="ghost"
								size="sm"
								className="w-fit"
								onClick={() => onGoToTab('tratamientos')}
							>
								Ver tratamientos
							</Button>
						</SummaryBlock>
						<Separator />
						<SummaryBlock title="Próxima atención">
							{summary.nextFollowUp ? (
								<div className="flex items-start gap-2 text-sm">
									<CalendarClock className="mt-0.5 size-4 shrink-0" />
									<div>
										<p className="font-medium">
											Control recomendado ·{' '}
											{formatDate(summary.nextFollowUp.recommendedDate)}
										</p>
										<p className="text-muted-foreground">
											{summary.nextFollowUp.reason}
										</p>
										{canWrite && followUpHasPlan && (
											<Button
												variant="outline"
												size="sm"
												className="mt-2"
												nativeButton={false}
												render={
													<Link
														href={`/dashboard/patients/${patientId}/follow-ups/${summary.nextFollowUp.id}/control`}
													/>
												}
											>
												Registrar control
											</Button>
										)}
									</div>
								</div>
							) : (
								<Muted>Sin seguimientos pendientes.</Muted>
							)}
						</SummaryBlock>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
