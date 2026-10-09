'use client';

import { ConsultationsTab } from '@/components/consultations/consultations-tab';
import { MedicalHistoryTab } from '@/components/medical-histories/medical-history-tab';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RECORD_TABS } from '@/constants/clinical';
import { ConsultationStatus } from '@/constants/enum';
import { Permission } from '@/constants/permission';
import { usePatientRecord } from '@/hooks/use-patient-record';
import { isNotFoundError } from '@/utils/http-error';
import { hasPermission } from '@/utils/permission';
import { CircleAlert, FileQuestion, ShieldAlert } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { useState } from 'react';
import { PatientEditSheet } from './patient-edit-sheet';
import { PatientGeneralDataTab } from './patient-general-data-tab';
import { PatientRecordHeader } from './patient-record-header';
import { PatientRecordNotice } from './patient-record-notice';
import { PatientRecordSkeleton } from './patient-record-skeleton';
import { PatientSummaryTab } from './patient-summary-tab';

export function PatientRecord({ patientId }: { patientId: string }) {
	const { data: session, status } = useSession();
	const [tab, setTab] = useQueryState(
		'tab',
		parseAsStringLiteral(RECORD_TABS).withDefault('resumen')
	);
	const [editOpen, setEditOpen] = useState(false);

	const permissions = session?.user?.permissions;
	const canRead = hasPermission(permissions, [
		Permission.MEDICAL_RECORDS_MANAGE_ALL,
	]);
	const canWrite =
		canRead && hasPermission(permissions, [Permission.MEDICAL_RECORDS_WRITE]);
	const record = usePatientRecord(patientId, canRead);

	if (status === 'loading') return <PatientRecordSkeleton />;

	if (!canRead)
		return (
			<PatientRecordNotice
				icon={ShieldAlert}
				title="No tienes permisos para ver este expediente"
				description="Solicita acceso al administrador de la clínica."
			/>
		);

	if (record.error)
		return isNotFoundError(record.error) ? (
			<PatientRecordNotice
				icon={FileQuestion}
				title="No encontramos este paciente"
				description="Es posible que haya sido eliminado o que el enlace sea incorrecto."
			/>
		) : (
			<PatientRecordNotice
				icon={CircleAlert}
				title="No pudimos cargar el expediente"
				description="Ocurrió un problema al obtener la información del paciente. Intenta nuevamente."
				action={
					<Button variant="outline" onClick={() => record.refetch()}>
						Reintentar
					</Button>
				}
			/>
		);

	if (!record.data) return <PatientRecordSkeleton />;

	const { patient, summary, histories, consultations } = record.data;
	const lastConsultation = consultations.find(
		(consultation) => consultation.status === ConsultationStatus.FINALIZED
	);

	return (
		<div className="flex flex-col gap-6">
			<PatientRecordHeader
				patient={patient}
				alerts={summary.alerts}
				lastWeight={summary.weightHistory[0]}
				canWrite={canWrite}
				onEdit={() => setEditOpen(true)}
			/>
			<Tabs value={tab} onValueChange={(value) => setTab(value as typeof tab)}>
				<TabsList
					variant="line"
					className="w-full justify-start overflow-x-auto"
				>
					<TabsTrigger value="resumen" className="flex-none px-3">
						Resumen
					</TabsTrigger>
					<TabsTrigger value="consultas" className="flex-none px-3">
						Consultas
					</TabsTrigger>
					<TabsTrigger value="antecedentes" className="flex-none px-3">
						Antecedentes
					</TabsTrigger>
					<TabsTrigger value="examenes" disabled className="flex-none px-3">
						Exámenes
					</TabsTrigger>
					<TabsTrigger value="tratamientos" disabled className="flex-none px-3">
						Tratamientos
					</TabsTrigger>
					<TabsTrigger value="vacunas" disabled className="flex-none px-3">
						Vacunas
					</TabsTrigger>
					<TabsTrigger value="archivos" disabled className="flex-none px-3">
						Archivos
					</TabsTrigger>
					<TabsTrigger value="datos" className="flex-none px-3">
						Datos generales
					</TabsTrigger>
				</TabsList>
				<TabsContent value="resumen" className="pt-4">
					<PatientSummaryTab
						patientId={patientId}
						summary={summary}
						histories={histories}
						lastConsultation={lastConsultation}
						canWrite={canWrite}
						onGoToTab={setTab}
					/>
				</TabsContent>
				<TabsContent value="consultas" className="pt-4">
					<ConsultationsTab
						patientId={patientId}
						consultations={consultations}
						canWrite={canWrite}
					/>
				</TabsContent>
				<TabsContent value="antecedentes" className="pt-4">
					<MedicalHistoryTab
						petId={patientId}
						entries={histories}
						canWrite={canWrite}
					/>
				</TabsContent>
				<TabsContent value="datos" className="pt-4">
					<PatientGeneralDataTab
						patient={patient}
						canWrite={canWrite}
						onEdit={() => setEditOpen(true)}
					/>
				</TabsContent>
			</Tabs>
			<PatientEditSheet
				patient={patient}
				open={editOpen}
				onOpenChange={setEditOpen}
			/>
		</div>
	);
}
