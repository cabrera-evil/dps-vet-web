'use client';

import { PatientRecordNotice } from '@/components/patients/patient-record-notice';
import { PatientRecordSkeleton } from '@/components/patients/patient-record-skeleton';
import { Button } from '@/components/ui/button';
import { ConsultationStatus } from '@/constants/enum';
import { Permission } from '@/constants/permission';
import { usePatientClinicalSummary } from '@/hooks/use-patient-record';
import { useGet } from '@/hooks/use-rest';
import type { ConsultationRecord } from '@/types/consultation.type';
import { isNotFoundError } from '@/utils/http-error';
import { hasPermission } from '@/utils/permission';
import { CircleAlert, FileQuestion, ShieldAlert } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ConsultationDetail } from './consultation-detail';
import { ConsultationForm } from './consultation-form';
import type { ConsultationPatientContext } from './consultation-patient-bar';

interface ConsultationWorkspaceProps {
	patientId: string;
	consultationId?: string;
}

/** Resolves new / draft / finalized consultation views for one patient. */
export function ConsultationWorkspace({
	patientId,
	consultationId,
}: ConsultationWorkspaceProps) {
	const { data: session, status } = useSession();
	const permissions = session?.user?.permissions;
	const canRead = hasPermission(permissions, [
		Permission.MEDICAL_RECORDS_MANAGE_ALL,
	]);
	const canWrite =
		canRead && hasPermission(permissions, [Permission.MEDICAL_RECORDS_WRITE]);
	const summaryQuery = usePatientClinicalSummary(patientId, canRead);
	const consultationQuery = useGet<ConsultationRecord>(
		{ path: `/consultations/${consultationId}` },
		{ enabled: canRead && !!consultationId }
	);

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

	if (!canRead)
		return (
			<PatientRecordNotice
				icon={ShieldAlert}
				title="No tienes permisos para ver esta consulta"
				description="Solicita acceso al administrador de la clínica."
				action={backAction}
			/>
		);

	const error = summaryQuery.error ?? consultationQuery.error;
	if (error)
		return isNotFoundError(error) ? (
			<PatientRecordNotice
				icon={FileQuestion}
				title="No encontramos esta consulta"
				description="Es posible que haya sido movida o que el enlace sea incorrecto."
				action={backAction}
			/>
		) : (
			<PatientRecordNotice
				icon={CircleAlert}
				title="No pudimos cargar la consulta"
				description="Ocurrió un problema al obtener la información. Intenta nuevamente."
				action={
					<Button
						variant="outline"
						onClick={() => {
							summaryQuery.refetch();
							if (consultationId) consultationQuery.refetch();
						}}
					>
						Reintentar
					</Button>
				}
			/>
		);

	const summary = summaryQuery.data;
	const consultation = consultationQuery.data;
	if (!summary || (consultationId && !consultation))
		return <PatientRecordSkeleton />;

	if (consultation && consultation.petId !== patientId)
		return (
			<PatientRecordNotice
				icon={FileQuestion}
				title="No encontramos esta consulta"
				description="Es posible que haya sido movida o que el enlace sea incorrecto."
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

	if (!consultation || consultation.status === ConsultationStatus.DRAFT) {
		if (!canWrite)
			return (
				<PatientRecordNotice
					icon={ShieldAlert}
					title="No tienes permisos para registrar consultas"
					description="Solicita acceso al administrador de la clínica."
					action={backAction}
				/>
			);
		return (
			<ConsultationForm
				patientId={patientId}
				patient={patient}
				consultation={consultation}
			/>
		);
	}

	return (
		<ConsultationDetail
			patientId={patientId}
			patient={patient}
			consultation={consultation}
		/>
	);
}
