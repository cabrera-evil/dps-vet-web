import { ClinicalDataList } from '@/components/clinical/clinical-data-list';
import { Badge } from '@/components/ui/badge';
import { TreatmentStatus } from '@/constants/enum';
import type { TreatmentPlan } from '@/types/treatment.type';
import { formatDate } from '@/utils/date';
import Link from 'next/link';

interface FollowUpContextCardProps {
	patientId: string;
	patientName: string;
	followUp: { reason: string; sourceConsultationId?: string };
	/** Plan the follow-up belongs to; undefined when it has no treatment attached. */
	plan?: TreatmentPlan;
}

export function FollowUpContextCard({
	patientId,
	patientName,
	followUp,
	plan,
}: FollowUpContextCardProps) {
	const problem = plan?.diagnosis ?? followUp.reason;
	const sourceConsultationId =
		plan?.sourceConsultationId || followUp.sourceConsultationId;
	const medications = (plan?.orders ?? [])
		.filter((order) => order.status === TreatmentStatus.ACTIVE)
		.map((order) => order.medicationName)
		.join(' + ');
	const lastControl = plan?.controls?.at(-1);

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
								{plan
									? `${plan.sourceConsultationLabel} · ${formatDate(plan.startsAt)}`
									: 'Ver consulta'}
							</Link>
						) : (
							plan &&
							`${plan.sourceConsultationLabel} · ${formatDate(plan.startsAt)}`
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
