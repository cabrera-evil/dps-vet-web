'use client';

import {
	ConsultationPatientBar,
	type ConsultationPatientContext,
} from '@/components/consultations/consultation-patient-bar';
import { PatientRecordNotice } from '@/components/patients/patient-record-notice';
import { PatientRecordSkeleton } from '@/components/patients/patient-record-skeleton';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { FollowUpStatus } from '@/constants/enum';
import { Permission } from '@/constants/permission';
import { usePatientClinicalSummary } from '@/hooks/use-patient-record';
import { useTreatmentPlans } from '@/hooks/use-treatments';
import { isNotFoundError } from '@/utils/http-error';
import { hasPermission } from '@/utils/permission';
import {
	CircleAlert,
	CircleCheck,
	FileQuestion,
	ShieldAlert,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { FollowUpContextCard } from './follow-up-context-card';
import { FollowUpControlForm } from './follow-up-control-form';

interface FollowUpControlWorkspaceProps {
	patientId: string;
	followUpId: string;
}

/** Resolves permissions, loading and error states for registering one follow-up control. */
export function FollowUpControlWorkspace({
	patientId,
	followUpId,
}: FollowUpControlWorkspaceProps) {
	const { data: session, status } = useSession();
	const permissions = session?.user?.permissions;
	const canRead = hasPermission(permissions, [
		Permission.MEDICAL_RECORDS_MANAGE_ALL,
	]);
	const canWrite =
		canRead && hasPermission(permissions, [Permission.MEDICAL_RECORDS_WRITE]);
	const summaryQuery = usePatientClinicalSummary(patientId, canRead);
	const plansQuery = useTreatmentPlans(patientId, canRead);

	if (status === 'loading') return <PatientRecordSkeleton />;

	const backAction = (
		<Button
			variant="outline"
			nativeButton={false}
			render={<Link href={`/dashboard/patients/${patientId}`} />}
		>
			Volver al expediente
		</Button>
	);

	if (!canWrite)
		return (
			<PatientRecordNotice
				icon={ShieldAlert}
				title="No tienes permisos para registrar este control"
				description="Solicita acceso al administrador de la clínica."
				action={backAction}
			/>
		);

	const error = summaryQuery.error ?? plansQuery.error;
	if (error)
		return isNotFoundError(error) ? (
			<PatientRecordNotice
				icon={FileQuestion}
				title="No encontramos este seguimiento"
				description="Es posible que haya sido movido o que el enlace sea incorrecto."
				action={backAction}
			/>
		) : (
			<PatientRecordNotice
				icon={CircleAlert}
				title="No pudimos cargar el seguimiento"
				description="Ocurrió un problema al obtener la información. Intenta nuevamente."
				action={
					<Button
						variant="outline"
						onClick={() => {
							summaryQuery.refetch();
							plansQuery.refetch();
						}}
					>
						Reintentar
					</Button>
				}
			/>
		);

	const summary = summaryQuery.data;
	const plans = plansQuery.data;
	if (!summary || !plans) return <PatientRecordSkeleton />;

	const plan = plans.find((item) => item.followUp?.id === followUpId);
	const wasRegistered = plans.some((item) =>
		item.controls?.some((control) => control.followUpId === followUpId)
	);
	const summaryFollowUp =
		summary.nextFollowUp?.id === followUpId ? summary.nextFollowUp : undefined;
	const followUp = plan?.followUp ?? summaryFollowUp;

	if (
		wasRegistered ||
		(plan?.followUp && plan.followUp.status !== FollowUpStatus.PENDING)
	)
		return (
			<PatientRecordNotice
				icon={CircleCheck}
				title="Este control ya fue registrado."
				description="Puedes consultar lo registrado en el detalle del tratamiento."
				action={backAction}
			/>
		);

	if (!followUp)
		return (
			<PatientRecordNotice
				icon={FileQuestion}
				title="No encontramos este seguimiento"
				description="Es posible que haya sido movido o que el enlace sea incorrecto."
				action={backAction}
			/>
		);

	const patient: ConsultationPatientContext = {
		name: summary.patient.name,
		species: summary.patient.species,
		breed: summary.patient.breed,
		birthDate: summary.patient.birthDate,
		lastWeight: summary.weightHistory[0],
		alerts: summary.alerts,
	};

	return (
		<div className="flex flex-col gap-4">
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink
							render={<Link href={`/dashboard/patients/${patientId}`} />}
						>
							Expediente de {patient.name}
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>Registrar control</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
			<ConsultationPatientBar patient={patient} />
			<h2 className="font-heading text-xl font-semibold">Registrar control</h2>
			<FollowUpContextCard
				patientId={patientId}
				patientName={patient.name}
				followUp={{
					reason: followUp.reason,
					sourceConsultationId: summaryFollowUp?.sourceConsultationId,
				}}
				plan={plan}
			/>
			<FollowUpControlForm
				patientId={patientId}
				followUp={{ id: followUp.id, reason: followUp.reason }}
				plan={plan}
			/>
		</div>
	);
}
