import { Separator } from '@/components/ui/separator';
import { AdministrationContext, TreatmentStatus } from '@/constants/enum';
import { ADMINISTRATION_ROUTE_LABEL } from '@/constants/treatment';
import type { TreatmentPlan } from '@/types/treatment.type';
import { formatDate } from '@/utils/date';
import { countApplications } from '@/utils/treatment';
import {
	formatDose,
	formatDuration,
	formatFrequency,
} from '@/utils/treatment-format';

interface PrescriptionViewProps {
	plan: TreatmentPlan;
	patientName: string;
	patientDetail: string;
	ownerName?: string;
	veterinarianName: string;
}

const Fact = ({ label, value }: { label: string; value?: string }) => (
	<div className="flex flex-col">
		<dt className="text-xs text-muted-foreground">{label}</dt>
		<dd className="text-sm font-medium">{value ?? '—'}</dd>
	</div>
);

/** Printable prescription derived from the plan; internal notes are never included. */
export function PrescriptionView({
	plan,
	patientName,
	patientDetail,
	ownerName,
	veterinarianName,
}: PrescriptionViewProps) {
	const isOpen =
		plan.status === TreatmentStatus.ACTIVE ||
		plan.status === TreatmentStatus.PLANNED;
	const orders = plan.orders.filter(
		(order) =>
			order.status !== TreatmentStatus.CANCELLED &&
			(!isOpen ||
				(order.status !== TreatmentStatus.SUSPENDED &&
					!order.replacedByOrderId))
	);

	return (
		<article
			aria-label="Receta"
			className="mx-auto flex w-full max-w-3xl flex-col gap-5 rounded-xl p-6 ring-1 ring-foreground/10 print:max-w-none print:rounded-none print:p-0 print:ring-0"
		>
			<header className="flex flex-col gap-1">
				<h2 className="font-heading text-xl font-semibold">
					Veterinaria San Roque
				</h2>
				<p className="text-sm text-muted-foreground">
					Receta médica veterinaria
				</p>
			</header>
			<Separator />
			<dl className="grid gap-4 sm:grid-cols-2">
				<Fact label="Paciente" value={`${patientName} · ${patientDetail}`} />
				<Fact label="Propietario" value={ownerName} />
				<Fact label="Fecha" value={formatDate(plan.startsAt)} />
				<Fact label="Veterinario" value={veterinarianName} />
				<Fact label="Diagnóstico" value={plan.diagnosis} />
			</dl>
			<Separator />
			<ol className="flex flex-col gap-5">
				{orders.map((order, index) => (
					<li key={order.id} className="flex flex-col gap-2 break-inside-avoid">
						<p className="font-heading text-base font-medium">
							{index + 1}. {order.medicationName}
							{order.presentation && (
								<span className="font-normal text-muted-foreground">
									{' '}
									· {order.presentation}
								</span>
							)}
						</p>
						<dl className="grid gap-x-6 gap-y-2 sm:grid-cols-4">
							<Fact label="Dosis" value={formatDose(order)} />
							<Fact
								label="Vía"
								value={ADMINISTRATION_ROUTE_LABEL[order.route]}
							/>
							<Fact
								label="Frecuencia"
								value={formatFrequency(order.frequencyHours)}
							/>
							<Fact label="Duración" value={formatDuration(order)} />
						</dl>
						{order.context === AdministrationContext.CLINIC && (
							<p className="text-sm">
								Se aplica en la clínica
								{countApplications(order) > 0 &&
									` · ${countApplications(order)} aplicaciones`}
								. Presente a la mascota en las fechas indicadas.
							</p>
						)}
						{order.instructions && (
							<p className="text-sm whitespace-pre-line">
								{order.instructions}
							</p>
						)}
					</li>
				))}
			</ol>
			{plan.ownerInstructions && (
				<>
					<Separator />
					<section className="flex flex-col gap-1">
						<h3 className="font-heading text-sm font-medium">
							Cuidados adicionales
						</h3>
						<p className="text-sm whitespace-pre-line">
							{plan.ownerInstructions}
						</p>
					</section>
				</>
			)}
		</article>
	);
}
