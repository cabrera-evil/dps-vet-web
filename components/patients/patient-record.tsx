'use client';

import { ConsultationsTab } from '@/components/consultations/consultations-tab';
import { MedicalHistoryTab } from '@/components/medical-histories/medical-history-tab';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RECORD_TABS } from '@/constants/clinical';
import { ConsultationStatus, PetSex } from '@/constants/enum';
import { Permission } from '@/constants/permission';
import { usePreviewScenario } from '@/hooks/use-preview-scenario';
import type { MedicalHistoryFormValues } from '@/schemas/medical-history.schema';
import type { PatientGeneralDataFormValues } from '@/schemas/patient-record.schema';
import type { MedicalHistoryEntry } from '@/types/medical-history.type';
import type { PatientIdentity } from '@/types/patient-record.type';
import { hasPermission } from '@/utils/permission';
import { CircleAlert, ShieldAlert } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { useEffect, useMemo, useState } from 'react';
import { getPatientRecordMock } from './mocks/patient-record.mock';
import { PatientEditSheet } from './patient-edit-sheet';
import { PatientGeneralDataTab } from './patient-general-data-tab';
import { PatientRecordHeader } from './patient-record-header';
import { PatientRecordNotice } from './patient-record-notice';
import { PatientRecordSkeleton } from './patient-record-skeleton';
import { PatientSummaryTab } from './patient-summary-tab';

export function PatientRecord({ patientId }: { patientId: string }) {
	const { data: session, status } = useSession();
	const scenario = usePreviewScenario();
	const [tab, setTab] = useQueryState(
		'tab',
		parseAsStringLiteral(RECORD_TABS).withDefault('resumen')
	);
	const record = useMemo(
		() => getPatientRecordMock(patientId, scenario),
		[patientId, scenario]
	);
	const [patientOverrides, setPatientOverrides] =
		useState<Partial<PatientIdentity>>();
	const [histories, setHistories] = useState<MedicalHistoryEntry[]>(
		record.histories
	);
	const [editOpen, setEditOpen] = useState(false);

	useEffect(() => {
		setHistories(record.histories);
		setPatientOverrides(undefined);
	}, [record]);

	if (status === 'loading' || scenario === 'loading')
		return <PatientRecordSkeleton />;

	const permissions = session?.user?.permissions;
	const canRead = hasPermission(permissions, [Permission.MEDICAL_RECORDS_READ]);
	const canWrite = hasPermission(permissions, [
		Permission.MEDICAL_RECORDS_WRITE,
	]);

	if (!canRead || scenario === 'denied')
		return (
			<PatientRecordNotice
				icon={ShieldAlert}
				title="No tienes permisos para ver este expediente"
				description="Solicita acceso al administrador de la clínica."
			/>
		);

	if (scenario === 'error')
		return (
			<PatientRecordNotice
				icon={CircleAlert}
				title="No pudimos cargar el expediente"
				description="Ocurrió un problema al obtener la información del paciente. Intenta nuevamente."
				action={
					<Button
						variant="outline"
						onClick={() => window.location.assign(window.location.pathname)}
					>
						Reintentar
					</Button>
				}
			/>
		);

	const patient: PatientIdentity = { ...record.patient, ...patientOverrides };
	const lastConsultation = record.consultations.find(
		(consultation) => consultation.status === ConsultationStatus.FINALIZED
	);

	function saveGeneralData(values: PatientGeneralDataFormValues) {
		setPatientOverrides({
			...values,
			sex: values.sex as PetSex,
			color: values.color || undefined,
			markings: values.markings || undefined,
			microchip: values.microchip || undefined,
		});
	}

	function saveHistory(values: MedicalHistoryFormValues, id?: string) {
		const entry = {
			...values,
			approximateDate: values.approximateDate || undefined,
			description: values.description || undefined,
		};
		setHistories((current) =>
			id
				? current.map((item) => (item.id === id ? { ...item, ...entry } : item))
				: [{ id: `history-${Date.now()}`, ...entry }, ...current]
		);
	}

	return (
		<div className="flex flex-col gap-6">
			<PatientRecordHeader
				patient={patient}
				alerts={record.summary.alerts}
				lastWeight={record.summary.weightHistory[0]}
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
						summary={record.summary}
						histories={histories}
						lastConsultation={lastConsultation}
						canWrite={canWrite}
						onGoToTab={setTab}
					/>
				</TabsContent>
				<TabsContent value="consultas" className="pt-4">
					<ConsultationsTab
						patientId={patientId}
						consultations={record.consultations}
						canWrite={canWrite}
					/>
				</TabsContent>
				<TabsContent value="antecedentes" className="pt-4">
					<MedicalHistoryTab
						entries={histories}
						canWrite={canWrite}
						onSave={saveHistory}
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
				onSave={saveGeneralData}
			/>
		</div>
	);
}
