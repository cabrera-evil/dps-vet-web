'use client';

import { getPatientRecordMock } from '@/components/patients/mocks/patient-record.mock';
import { PatientRecordNotice } from '@/components/patients/patient-record-notice';
import { PatientRecordSkeleton } from '@/components/patients/patient-record-skeleton';
import { Button } from '@/components/ui/button';
import { ConsultationStatus } from '@/constants/enum';
import { Permission } from '@/constants/permission';
import { usePreviewScenario } from '@/hooks/use-preview-scenario';
import { hasPermission } from '@/utils/permission';
import { FileQuestion, ShieldAlert } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useMemo } from 'react';
import { ConsultationDetail } from './consultation-detail';
import { ConsultationForm } from './consultation-form';
import type { ConsultationPatientContext } from './consultation-patient-bar';
import { getConsultationMock } from './mocks/consultations.mock';

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
	const scenario = usePreviewScenario();
	const record = useMemo(
		() => getPatientRecordMock(patientId, scenario),
		[patientId, scenario]
	);

	if (status === 'loading' || scenario === 'loading')
		return <PatientRecordSkeleton />;

	const permissions = session?.user?.permissions;
	const canRead = hasPermission(permissions, [Permission.MEDICAL_RECORDS_READ]);
	const canWrite = hasPermission(permissions, [
		Permission.MEDICAL_RECORDS_WRITE,
	]);
	const backAction = (
		<Button
			variant="outline"
			nativeButton={false}
			render={<Link href={`/dashboard/patients/${patientId}`} />}
		>
			Volver al expediente
		</Button>
	);

	if (!canRead || scenario === 'denied')
		return (
			<PatientRecordNotice
				icon={ShieldAlert}
				title="No tienes permisos para ver esta consulta"
				description="Solicita acceso al administrador de la clínica."
				action={backAction}
			/>
		);

	const patient: ConsultationPatientContext = {
		name: record.patient.name,
		species: record.patient.species,
		breed: record.patient.breed,
		birthDate: record.patient.birthDate,
		lastWeight: record.summary.weightHistory[0],
		alerts: record.summary.alerts,
	};
	const consultation = consultationId
		? getConsultationMock(consultationId)
		: undefined;

	if (consultationId && !consultation)
		return (
			<PatientRecordNotice
				icon={FileQuestion}
				title="No encontramos esta consulta"
				description="Es posible que haya sido movida o que el enlace sea incorrecto."
				action={backAction}
			/>
		);

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
