import { ClinicalDataList } from '@/components/clinical/clinical-data-list';
import { MeasurementGrid } from '@/components/clinical/measurement-grid';
import { Badge } from '@/components/ui/badge';
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
	CONSULTATION_KIND_LABEL,
	DIAGNOSIS_SEVERITY_LABEL,
	DIAGNOSIS_STATUS_LABEL,
	DIAGNOSIS_TYPE_LABEL,
	PROGNOSIS_OPTIONS,
} from '@/constants/clinical';
import type { ConsultationRecord } from '@/types/consultation.type';
import { formatDate, formatTime } from '@/utils/date';
import { ArrowLeft, CalendarClock, Lock } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import {
	ConsultationPatientBar,
	type ConsultationPatientContext,
} from './consultation-patient-bar';
import { ConsultationStatusBadge } from './consultation-status-badge';

function NoteSection({
	title,
	children,
}: {
	title: string;
	children: ReactNode;
}) {
	return (
		<section className="flex flex-col gap-2">
			<h3 className="font-heading text-sm font-medium">{title}</h3>
			{children}
		</section>
	);
}

const Narrative = ({ text }: { text?: string }) =>
	text ? (
		<p className="text-sm whitespace-pre-line">{text}</p>
	) : (
		<p className="text-sm text-muted-foreground">Sin información registrada.</p>
	);

interface ConsultationDetailProps {
	patientId: string;
	patient: ConsultationPatientContext;
	consultation: ConsultationRecord;
}

/** Read-only clinical note for a consultation that is already part of the history. */
export function ConsultationDetail({
	patientId,
	patient,
	consultation,
}: ConsultationDetailProps) {
	const prognosis = PROGNOSIS_OPTIONS.find(
		(option) => option.value === consultation.prognosis
	)?.label;

	return (
		<div className="flex flex-col gap-4">
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink
							render={
								<Link href={`/dashboard/patients/${patientId}?tab=consultas`} />
							}
						>
							Expediente de {patient.name}
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>Detalle de consulta</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
			<ConsultationPatientBar patient={patient} />

			<article className="flex max-w-4xl flex-col gap-6">
				<header className="flex flex-col gap-2">
					<div className="flex flex-wrap items-center gap-3">
						<h2 className="font-heading text-xl font-semibold">
							{CONSULTATION_KIND_LABEL[consultation.kind]}
						</h2>
						<ConsultationStatusBadge status={consultation.status} />
					</div>
					<p className="text-sm text-muted-foreground">
						{formatDate(consultation.occurredAt)} ·{' '}
						{formatTime(consultation.occurredAt)} · {consultation.staffName}
						{consultation.appointmentLabel &&
							` · Cita: ${consultation.appointmentLabel}`}
					</p>
				</header>
				<Separator />
				<NoteSection title="Motivo">
					<Narrative text={consultation.reason} />
				</NoteSection>
				<NoteSection title="Anamnesis">
					<Narrative text={consultation.anamnesis} />
				</NoteSection>
				<NoteSection title="Evaluación clínica">
					<MeasurementGrid measurements={consultation.measurements} />
				</NoteSection>
				<NoteSection title="Examen físico">
					<Narrative text={consultation.physicalExam} />
				</NoteSection>
				<NoteSection title="Diagnósticos">
					{consultation.diagnoses.length === 0 ? (
						<p className="text-sm text-muted-foreground">
							{consultation.noDefinedDiagnosis
								? 'Sin diagnóstico definido.'
								: 'Sin diagnósticos registrados.'}
						</p>
					) : (
						<ul className="flex flex-col gap-3">
							{consultation.diagnoses.map((diagnosis) => (
								<li
									key={diagnosis.id}
									className="flex flex-col gap-1.5 rounded-xl p-3 ring-1 ring-foreground/10"
								>
									<div className="flex flex-wrap items-center gap-2">
										<span className="text-sm font-medium">
											{diagnosis.name}
										</span>
										<Badge variant="outline">
											{DIAGNOSIS_TYPE_LABEL[diagnosis.type]}
										</Badge>
										<Badge variant="secondary">
											{DIAGNOSIS_STATUS_LABEL[diagnosis.status]}
										</Badge>
										{diagnosis.severity && (
											<Badge variant="outline">
												Severidad{' '}
												{DIAGNOSIS_SEVERITY_LABEL[
													diagnosis.severity
												].toLowerCase()}
											</Badge>
										)}
										{diagnosis.isActiveProblem && (
											<Badge>Problema activo</Badge>
										)}
									</div>
									{diagnosis.notes && (
										<p className="text-sm text-muted-foreground">
											{diagnosis.notes}
										</p>
									)}
								</li>
							))}
						</ul>
					)}
				</NoteSection>
				<NoteSection title="Indicaciones">
					<Narrative text={consultation.instructions} />
				</NoteSection>
				{(prognosis || consultation.followUp) && (
					<NoteSection title="Pronóstico y seguimiento">
						<ClinicalDataList
							className="lg:grid-cols-2"
							items={[
								{ label: 'Pronóstico', value: prognosis },
								{
									label: 'Seguimiento',
									value: consultation.followUp && (
										<span className="flex items-start gap-1.5">
											<CalendarClock className="mt-0.5 size-4 shrink-0" />
											{formatDate(consultation.followUp.recommendedDate)} ·{' '}
											{consultation.followUp.reason}
										</span>
									),
								},
							]}
						/>
					</NoteSection>
				)}
				{consultation.internalNotes && (
					<NoteSection title="Notas internas">
						<div className="flex flex-col gap-2 rounded-xl bg-muted p-3">
							<p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
								<Lock className="size-3" />
								Solo visible para el personal de la clínica
							</p>
							<Narrative text={consultation.internalNotes} />
						</div>
					</NoteSection>
				)}
				<div>
					<Button
						variant="outline"
						nativeButton={false}
						render={
							<Link href={`/dashboard/patients/${patientId}?tab=consultas`} />
						}
					>
						<ArrowLeft />
						Volver al expediente
					</Button>
				</div>
			</article>
		</div>
	);
}
