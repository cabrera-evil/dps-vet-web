'use client';

import { PatientRecordNotice } from '@/components/patients/patient-record-notice';
import { PatientRecordSkeleton } from '@/components/patients/patient-record-skeleton';
import { Button } from '@/components/ui/button';
import { Permission } from '@/constants/permission';
import { usePatientClinicalSummary } from '@/hooks/use-patient-record';
import { useTreatmentPlan } from '@/hooks/use-treatments';
import { getAgeLabel } from '@/utils/age';
import { isNotFoundError } from '@/utils/http-error';
import { hasPermission } from '@/utils/permission';
import {
	ArrowLeft,
	CircleAlert,
	FileQuestion,
	Printer,
	ShieldAlert,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { PrescriptionView } from './prescription-view';

interface PrescriptionWorkspaceProps {
	patientId: string;
	treatmentId: string;
}

export function PrescriptionWorkspace({
	patientId,
	treatmentId,
}: PrescriptionWorkspaceProps) {
	const { data: session, status } = useSession();
	const canRead = hasPermission(session?.user?.permissions, [
		Permission.MEDICAL_RECORDS_MANAGE_ALL,
	]);
	const summaryQuery = usePatientClinicalSummary(patientId, canRead);
	const planQuery = useTreatmentPlan(patientId, treatmentId, canRead);
	const treatmentHref = `/dashboard/patients/${patientId}/treatments/${treatmentId}`;

	if (status === 'loading') return <PatientRecordSkeleton />;

	const backAction = (
		<Button
			variant="outline"
			nativeButton={false}
			render={<Link href={treatmentHref} />}
		>
			Volver al tratamiento
		</Button>
	);

	if (!canRead)
		return (
			<PatientRecordNotice
				icon={ShieldAlert}
				title="No tienes permisos para ver esta receta"
				description="Solicita acceso al administrador de la clínica."
			/>
		);

	const error = summaryQuery.error ?? planQuery.error;
	if (error)
		return isNotFoundError(error) ? (
			<PatientRecordNotice
				icon={FileQuestion}
				title="No encontramos esta receta"
				description="Es posible que el tratamiento haya sido movido o que el enlace sea incorrecto."
				action={backAction}
			/>
		) : (
			<PatientRecordNotice
				icon={CircleAlert}
				title="No pudimos cargar la receta"
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
				title="No encontramos esta receta"
				description="Es posible que el tratamiento haya sido movido o que el enlace sea incorrecto."
				action={backAction}
			/>
		);

	const { patient } = summary;
	const patientDetail = [
		patient.species,
		patient.breed,
		getAgeLabel(patient.birthDate),
	]
		.filter(Boolean)
		.join(' · ');

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
				<Button
					variant="ghost"
					size="sm"
					nativeButton={false}
					render={<Link href={treatmentHref} />}
				>
					<ArrowLeft />
					Volver al tratamiento
				</Button>
				<Button onClick={() => window.print()}>
					<Printer />
					Imprimir
				</Button>
			</div>
			<PrescriptionView
				plan={plan}
				patientName={patient.name}
				patientDetail={patientDetail}
				ownerName={summary.owner?.name}
				veterinarianName={session?.user?.name ?? 'Veterinario'}
			/>
		</div>
	);
}
