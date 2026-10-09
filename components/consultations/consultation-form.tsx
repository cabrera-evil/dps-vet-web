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
import { usePreviewScenario } from '@/hooks/use-preview-scenario';
import {
	ConsultationFormValues,
	consultationDraftSchema,
	consultationFinalizeSchema,
} from '@/schemas/consultation.schema';
import type { ConsultationRecord } from '@/types/consultation.type';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, parseISO } from 'date-fns';
import { CircleAlert, CircleCheck, TriangleAlert } from 'lucide-react';
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
import {
	APPOINTMENT_OPTIONS_MOCK,
	DIAGNOSIS_CATALOG_MOCK,
	STAFF_OPTIONS_MOCK,
} from './mocks/consultations.mock';

const SECTIONS = [
	{ id: 'informacion', label: 'Información' },
	{ id: 'motivo', label: 'Motivo y anamnesis' },
	{ id: 'evaluacion', label: 'Evaluación clínica' },
	{ id: 'diagnostico', label: 'Diagnóstico' },
	{ id: 'cierre', label: 'Indicaciones y cierre' },
];

const str = (value?: number | string) =>
	value === undefined ? '' : String(value);

function buildDefaultValues(
	consultation?: ConsultationRecord
): ConsultationFormValues {
	const occurredAt = consultation && parseISO(consultation.occurredAt);
	const measurements = consultation?.measurements;
	return {
		date: occurredAt ? format(occurredAt, 'yyyy-MM-dd') : '',
		time: occurredAt ? format(occurredAt, 'HH:mm') : '',
		staffId:
			STAFF_OPTIONS_MOCK.find(
				(staff) => staff.label === consultation?.staffName
			)?.id ?? STAFF_OPTIONS_MOCK[0].id,
		appointmentId: '',
		kind: consultation?.kind ?? '',
		reason: consultation?.reason ?? '',
		anamnesis: consultation?.anamnesis ?? '',
		weightKg: str(measurements?.weightKg),
		temperatureC: str(measurements?.temperatureC),
		heartRateBpm: str(measurements?.heartRateBpm),
		respiratoryRateRpm: str(measurements?.respiratoryRateRpm),
		bodyConditionScore: str(measurements?.bodyConditionScore),
		hydration: measurements?.hydration ?? '',
		mucousMembranes: measurements?.mucousMembranes ?? '',
		mucousMembranesOther: '',
		capillaryRefill: measurements?.capillaryRefill ?? '',
		pain: measurements?.pain ?? '',
		physicalExam: consultation?.physicalExam ?? '',
		diagnoses:
			consultation?.diagnoses.map((diagnosis) => ({
				name: diagnosis.name,
				type: diagnosis.type,
				status: diagnosis.status,
				severity: diagnosis.severity ?? '',
				notes: diagnosis.notes ?? '',
				isActiveProblem: diagnosis.isActiveProblem,
			})) ?? [],
		noDefinedDiagnosis: consultation?.noDefinedDiagnosis ?? false,
		instructions: consultation?.instructions ?? '',
		internalNotes: consultation?.internalNotes ?? '',
		prognosis: consultation?.prognosis ?? '',
		requiresFollowUp: !!consultation?.followUp,
		followUpDate: consultation?.followUp?.recommendedDate ?? '',
		followUpReason: consultation?.followUp?.reason ?? '',
	};
}

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
	const scenario = usePreviewScenario();
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const methods = useForm<ConsultationFormValues>({
		resolver: zodResolver(consultationFinalizeSchema),
		defaultValues: buildDefaultValues(consultation),
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

	useEffect(() => {
		if (consultation) return;
		const now = new Date();
		setValue('date', format(now, 'yyyy-MM-dd'));
		setValue('time', format(now, 'HH:mm'));
	}, [consultation, setValue]);

	function handleSaveDraft() {
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
		if (scenario === 'save-error') {
			setSaveError(
				'No se pudo guardar el borrador. Lo que escribiste se conserva en el formulario.'
			);
			return;
		}
		setSaveError(null);
		toast.success('Borrador guardado');
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

	function confirmFinalize() {
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
					<ConsultationInfoSection
						staff={STAFF_OPTIONS_MOCK}
						appointments={APPOINTMENT_OPTIONS_MOCK}
					/>
					<ConsultationReasonSection />
					<ConsultationEvaluationSection />
					<ConsultationDiagnosesSection catalog={DIAGNOSIS_CATALOG_MOCK} />
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
							<Button type="button" variant="outline" onClick={handleSaveDraft}>
								Guardar borrador
							</Button>
							<Button type="button" onClick={handleFinalize}>
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
