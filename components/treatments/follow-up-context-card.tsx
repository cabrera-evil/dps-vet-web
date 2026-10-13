import { ClinicalDataList } from '@/components/clinical/clinical-data-list';
import { Badge } from '@/components/ui/badge';
import { TreatmentStatus } from '@/constants/enum';
import type { ControlRecord, TreatmentPlan } from '@/types/treatment.type';
import { formatDate } from '@/utils/date';
import Link from 'next/link';

interface FollowUpContextCardProps {
	patientId: string;
	patientName: string;
	followUp: { reason: string; sourceConsultationId?: string };
	/** Plans the follow-up belongs to; empty when it has no treatment attached. */
	plans: TreatmentPlan[];
	lastControl?: ControlRecord;
}

export function FollowUpContextCard({
	patientId,
	patientName,
	followUp,
	plans,
	lastControl,
}: FollowUpContextCardProps) {
	const plan = plans[0];
	const problem = plans.length
		? [...new Set(plans.map((item) => item.diagnosis))].join(' · ')
		: followUp.reason;
	const sourceConsultationId =
		plan?.sourceConsultationId || followUp.sourceConsultationId;
	const medications = plans
		.flatMap((item) => item.orders)
		.filter((order) => order.status === TreatmentStatus.ACTIVE)
		.map((order) => order.medicationName)
		.join(' + ');

	return (
		<section
			aria-label="Contexto del control"
			className="flex max-w-3xl flex-col gap-4 rounded-xl bg-muted/40 p-4 ring-1 ring-foreground/10"
		>
			<p className="flex flex-wrap items-center gap-2 text-sm font-medium">
				<Badge variant="secondary">CONTROL</Badge>
				<span>Relacionado con: {problem}</span>
			</p>
			<ClinicalDataList
				items={[
					{ label: 'Paciente', value: patientName },
					{ label: 'Problema original', value: problem },
					{
						label: 'Consulta de origen',
						value: sourceConsultationId ? (
							<Link
								href={`/dashboard/patients/${patientId}/consultations/${sourceConsultationId}`}
								className="underline-offset-4 hover:underline focus-visible:underline"
							>
								{plan?.sourceConsultationLabel ?? 'Ver consulta'}
							</Link>
						) : (
							plan?.sourceConsultationLabel
						),
					},
					{
						label: 'Tratamiento actual',
						value: plan ? medications || 'Sin medicamentos activos' : undefined,
					},
					{
						label: 'Último control',
						value: lastControl
							? formatDate(lastControl.registeredAt)
							: 'Sin controles previos',
					},
				]}
			/>
		</section>
	);
}
