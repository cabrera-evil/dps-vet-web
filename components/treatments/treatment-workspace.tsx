'use client';

import type { ConsultationPatientContext } from '@/components/consultations/consultation-patient-bar';
import { PatientRecordNotice } from '@/components/patients/patient-record-notice';
import { PatientRecordSkeleton } from '@/components/patients/patient-record-skeleton';
import { Button } from '@/components/ui/button';
import { Permission } from '@/constants/permission';
import { usePatientClinicalSummary } from '@/hooks/use-patient-record';
import { useTreatmentPlan } from '@/hooks/use-treatments';
import { isNotFoundError } from '@/utils/http-error';
import { hasPermission } from '@/utils/permission';
import { CircleAlert, FileQuestion, ShieldAlert } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { TreatmentDetail } from './treatment-detail';

interface TreatmentWorkspaceProps {
	patientId: string;
	treatmentId: string;
}

/** Resolves permissions, loading and error states for one treatment plan. */
export function TreatmentWorkspace({
	patientId,
	treatmentId,
}: TreatmentWorkspaceProps) {
	const { data: session, status } = useSession();
	const permissions = session?.user?.permissions;
	const canRead = hasPermission(permissions, [
		Permission.MEDICAL_RECORDS_MANAGE_ALL,
	]);
	const canWrite =
		canRead && hasPermission(permissions, [Permission.MEDICAL_RECORDS_WRITE]);
	const summaryQuery = usePatientClinicalSummary(patientId, canRead);
	const planQuery = useTreatmentPlan(patientId, treatmentId, canRead);

	if (status === 'loading') return <PatientRecordSkeleton />;

	const backAction = (
		<Button
			variant="outline"
			nativeButton={false}
			render={
				<Link href={`/dashboard/patients/${patientId}?tab=tratamientos`} />
			}
		>
			Volver al expediente
		</Button>
	);

	if (!canRead)
		return (
			<PatientRecordNotice
				icon={ShieldAlert}
				title="No tienes permisos para ver este tratamiento"
				description="Solicita acceso al administrador de la clínica."
				action={backAction}
			/>
		);

	const error = summaryQuery.error ?? planQuery.error;
	if (error)
		return isNotFoundError(error) ? (
			<PatientRecordNotice
				icon={FileQuestion}
				title="No encontramos este tratamiento"
				description="Es posible que haya sido movido o que el enlace sea incorrecto."
				action={backAction}
			/>
		) : (
			<PatientRecordNotice
				icon={CircleAlert}
				title="No pudimos cargar el tratamiento"
				description="Ocurrió un problema al obtener la información. Intenta nuevamente."
				action={
					<Button
						variant="outline"
						onClick={() => {
							summaryQuery.refetch();
							planQuery.refetch();
						}}
					>
						Reintentar
					</Button>
				}
			/>
		);

	const summary = summaryQuery.data;
	if (!summary || planQuery.isLoading) return <PatientRecordSkeleton />;

	const plan = planQuery.data;
	if (!plan || plan.petId !== patientId)
		return (
			<PatientRecordNotice
				icon={FileQuestion}
				title="No encontramos este tratamiento"
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
		<TreatmentDetail
			patientId={patientId}
			patient={patient}
			plan={plan}
			canWrite={canWrite}
		/>
	);
}
