'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { ConsultationStatus } from '@/constants/enum';
import { useConsultationOptions } from '@/hooks/use-consultation-options';
import {
	invalidateConsultation,
	invalidatePatientRecord,
} from '@/hooks/use-patient-record';
import { usePatch, usePost } from '@/hooks/use-rest';
import {
	ConsultationFormValues,
	consultationDraftSchema,
	consultationFinalizeSchema,
} from '@/schemas/consultation.schema';
import type { ConsultationRecord } from '@/types/consultation.type';
import {
	buildConsultationFormValues,
	buildConsultationPayload,
} from '@/utils/consultation';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CircleAlert, CircleCheck, TriangleAlert } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FieldPath, FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ConsultationClosureSection } from './consultation-closure-section';
import { ConsultationDiagnosesSection } from './consultation-diagnoses-section';
import { ConsultationEvaluationSection } from './consultation-evaluation-section';
import { ConsultationInfoSection } from './consultation-info-section';
import {
	ConsultationPatientBar,
	type ConsultationPatientContext,
} from './consultation-patient-bar';
import { ConsultationReasonSection } from './consultation-reason-section';
import { ConsultationStatusBadge } from './consultation-status-badge';

const SECTIONS = [
	{ id: 'informacion', label: 'Información' },
	{ id: 'motivo', label: 'Motivo y anamnesis' },
	{ id: 'evaluacion', label: 'Evaluación clínica' },
	{ id: 'diagnostico', label: 'Diagnóstico' },
	{ id: 'cierre', label: 'Indicaciones y cierre' },
];

interface ConsultationFormProps {
	patientId: string;
	patient: ConsultationPatientContext;
	consultation?: ConsultationRecord;
}

export function ConsultationForm({
	patientId,
	patient,
	consultation,
}: ConsultationFormProps) {
	const router = useRouter();
	const { data: session } = useSession();
	const { staff, appointments, diagnoses } = useConsultationOptions(patientId);
	const { mutateAsync: createConsultation, isPending: isCreating } =
		usePost<ConsultationRecord>();
	const { mutateAsync: updateConsultation, isPending: isUpdating } =
		usePatch<ConsultationRecord>();
	const { mutateAsync: finalizeConsultation, isPending: isFinalizing } =
		usePost<ConsultationRecord>();
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const [updatedAt, setUpdatedAt] = useState(consultation?.updatedAt);
	const methods = useForm<ConsultationFormValues>({
		resolver: zodResolver(consultationFinalizeSchema),
		defaultValues: buildConsultationFormValues(consultation),
	});
	const {
		setValue,
		setError,
		getValues,
		handleSubmit,
		formState: { errors, submitCount },
	} = methods;
	const expedienteHref = `/dashboard/patients/${patientId}?tab=consultas`;
	const errorCount = Object.keys(errors).length;
	const isBusy = isCreating || isUpdating || isFinalizing;
	const currentUserId = session?.user?.uid;

	useEffect(() => {
		if (consultation) return;
		const now = new Date();
		setValue('date', format(now, 'yyyy-MM-dd'));
		setValue('time', format(now, 'HH:mm'));
	}, [consultation, setValue]);

	useEffect(() => {
		if (consultation || !currentUserId || getValues('staffId')) return;
		if (staff.some((member) => member.id === currentUserId))
			setValue('staffId', currentUserId);
	}, [consultation, currentUserId, staff, getValues, setValue]);

	async function saveDraft(): Promise<ConsultationRecord | undefined> {
		const result = consultationDraftSchema.safeParse(getValues());
		if (!result.success) {
			result.error.issues.forEach((issue) =>
				setError(issue.path.join('.') as FieldPath<ConsultationFormValues>, {
					type: 'validate',
					message: issue.message,
				})
			);
			toast.error('Revisa los campos marcados');
			return;
		}

		try {
			const saved = consultation
				? await updateConsultation({
						path: `/consultations/${consultation.id}`,
						payload: buildConsultationPayload(result.data, updatedAt),
					})
				: await createConsultation({
						path: `/pets/${patientId}/consultations`,
						payload: buildConsultationPayload(result.data),
					});
			setSaveError(null);
			setUpdatedAt(saved.updatedAt);
			// A stale cached draft would send an outdated `expectedUpdatedAt` on the next edit.
			await invalidateConsultation(saved.id);
			return saved;
		} catch {
			setSaveError(
				'No se pudo guardar el borrador. Lo que escribiste se conserva en el formulario.'
			);
		}
	}

	async function handleSaveDraft() {
		const saved = await saveDraft();
		if (!saved) return;
		await invalidatePatientRecord(patientId);
		toast.success('Borrador guardado');
		if (!consultation)
			router.replace(
				`/dashboard/patients/${patientId}/consultations/${saved.id}`
			);
	}

	const handleFinalize = handleSubmit(
		() => {
			setSaveError(null);
			setConfirmOpen(true);
		},
		() =>
			toast.error('Faltan datos para finalizar', {
				description: 'Completa los campos marcados en cada sección.',
			})
	);

	async function confirmFinalize() {
		setConfirmOpen(false);
		const saved = await saveDraft();
		if (!saved) return;
		try {
			await finalizeConsultation({
				path: `/consultations/${saved.id}/finalize`,
			});
		} catch {
			// The draft exists now; moving to it prevents creating a duplicate on retry.
			if (!consultation)
				router.replace(
					`/dashboard/patients/${patientId}/consultations/${saved.id}`
				);
			return;
		}
		await Promise.all([
			invalidatePatientRecord(patientId),
			invalidateConsultation(saved.id),
		]);
		toast.success('Consulta finalizada', {
			description: `Ya forma parte del historial de ${patient.name}.`,
		});
		router.push(expedienteHref);
	}

	return (
		<FormProvider {...methods}>
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
							<BreadcrumbPage>
								{consultation ? 'Editar borrador' : 'Nueva consulta'}
							</BreadcrumbPage>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>
				<div className="flex flex-wrap items-center gap-3">
					<h2 className="font-heading text-lg font-semibold">
						Nueva consulta clínica
					</h2>
					<ConsultationStatusBadge status={ConsultationStatus.DRAFT} />
				</div>
				<ConsultationPatientBar patient={patient} sections={SECTIONS} sticky />

				{saveError && (
					<Alert variant="destructive">
						<CircleAlert />
						<AlertTitle>No se guardó el borrador</AlertTitle>
						<AlertDescription>
							{saveError}
							<div className="mt-2">
								<Button
									type="button"
									size="sm"
									variant="outline"
									disabled={isBusy}
									onClick={handleSaveDraft}
								>
									Reintentar
								</Button>
							</div>
						</AlertDescription>
					</Alert>
				)}
				{submitCount > 0 && errorCount > 0 && (
					<Alert variant="destructive">
						<TriangleAlert />
						<AlertTitle>Revisa la consulta antes de finalizar</AlertTitle>
						<AlertDescription>
							Hay campos obligatorios sin completar. Están marcados en cada
							sección.
						</AlertDescription>
					</Alert>
				)}

				<form
					noValidate
					onSubmit={(event) => event.preventDefault()}
					className="flex flex-col"
				>
					<ConsultationInfoSection staff={staff} appointments={appointments} />
					<ConsultationReasonSection />
					<ConsultationEvaluationSection />
					<ConsultationDiagnosesSection catalog={diagnoses} />
					<ConsultationClosureSection />

					<div className="sticky bottom-0 z-20 -mx-4 flex flex-wrap items-center justify-between gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/80 md:-mx-6 md:px-6">
						<p className="text-sm text-muted-foreground">
							Los cambios no se guardan automáticamente.
						</p>
						<div className="flex flex-wrap gap-2">
							<Button
								type="button"
								variant="ghost"
								nativeButton={false}
								render={<Link href={expedienteHref} />}
							>
								Cancelar
							</Button>
							<Button
								type="button"
								variant="outline"
								disabled={isBusy}
								onClick={handleSaveDraft}
							>
								Guardar borrador
							</Button>
							<Button type="button" disabled={isBusy} onClick={handleFinalize}>
								<CircleCheck />
								Finalizar consulta
							</Button>
						</div>
					</div>
				</form>
			</div>

			<AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Finalizar consulta</AlertDialogTitle>
						<AlertDialogDescription>
							La consulta pasará a formar parte definitiva del historial clínico
							de {patient.name} y ya no podrá editarse libremente. ¿Deseas
							finalizarla?
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Seguir editando</AlertDialogCancel>
						<AlertDialogAction onClick={confirmFinalize}>
							Finalizar consulta
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</FormProvider>
	);
}
