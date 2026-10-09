'use client';

import { ClinicalTextarea } from '@/components/clinical/clinical-textarea';
import { DatePicker } from '@/components/custom/date-picker';
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
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Switch } from '@/components/ui/switch';
import { ApplicationStatus, TreatmentStatus } from '@/constants/enum';
import { FOLLOW_UP_EVOLUTION_OPTIONS } from '@/constants/treatment';
import { useRegisterControl } from '@/hooks/use-treatments';
import {
	controlFormSchema,
	type ControlFormValues,
} from '@/schemas/treatment.schema';
import type { TreatmentPlan } from '@/types/treatment.type';
import { zodResolver } from '@hookform/resolvers/zod';
import { CircleAlert } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { ControlMeasurementInput } from './control-measurement-input';
import { ControlRadioField } from './control-radio-field';
import { ControlTreatmentDecision } from './control-treatment-decision';

interface FollowUpControlFormProps {
	patientId: string;
	followUp: { id: string; reason: string };
	/** Plan the follow-up belongs to; undefined when the follow-up has no treatment attached. */
	plan?: TreatmentPlan;
}

const isOpen = (status: TreatmentStatus) =>
	status === TreatmentStatus.ACTIVE || status === TreatmentStatus.PLANNED;

export function FollowUpControlForm({
	patientId,
	followUp,
	plan,
}: FollowUpControlFormProps) {
	const router = useRouter();
	const [submitError, setSubmitError] = useState('');
	const [confirmOpen, setConfirmOpen] = useState(false);
	const isSubmitting = useRef(false);
	const pendingValues = useRef<ControlFormValues | null>(null);
	const { mutateAsync: registerControl, isPending } = useRegisterControl();
	const openPlan = plan && isOpen(plan.status) ? plan : undefined;
	const openOrders = (openPlan?.orders ?? []).filter((order) =>
		isOpen(order.status)
	);
	const pendingCount = openOrders
		.flatMap((order) => order.applications)
		.filter(
			(application) => application.status === ApplicationStatus.SCHEDULED
		).length;
	const form = useForm<ControlFormValues>({
		resolver: zodResolver(controlFormSchema),
		defaultValues: {
			reason: followUp.reason,
			weightKg: '',
			temperatureC: '',
			observations: '',
			treatmentResponse: '',
			decision: 'CONTINUE',
			stopReason: '',
			replacedOrderIds: openOrders
				.filter((order) => order.status === TreatmentStatus.ACTIVE)
				.map((order) => order.id),
			outcome: '',
			outcomeNotes: '',
			treatments: [{ medications: [] }],
			requiresFollowUp: false,
			followUpDate: '',
			followUpReason: '',
		},
	});
	const {
		register,
		control,
		handleSubmit,
		formState: { errors, isSubmitting: isFormSubmitting },
	} = form;
	const requiresFollowUp = useWatch({ control, name: 'requiresFollowUp' });
	const canSave = !!plan;
	const busy = isPending || isFormSubmitting || !canSave;
	const backHref = plan
		? `/dashboard/patients/${patientId}/treatments/${plan.id}`
		: `/dashboard/patients/${patientId}?tab=resumen`;

	async function save(values: ControlFormValues) {
		if (isSubmitting.current) return;
		isSubmitting.current = true;
		setSubmitError('');
		try {
			await registerControl({
				petId: patientId,
				followUpId: followUp.id,
				values,
			});
		} catch (error) {
			setSubmitError(
				error instanceof Error
					? error.message
					: 'No se pudo registrar el control'
			);
			return;
		} finally {
			isSubmitting.current = false;
		}
		toast.success('Control registrado');
		router.push(backHref);
	}

	async function onSubmit(values: ControlFormValues) {
		if (!canSave) return;
		if (openPlan && values.decision === 'FINISH' && pendingCount > 0) {
			pendingValues.current = values;
			setConfirmOpen(true);
			return;
		}
		await save(values);
	}

	return (
		<FormProvider {...form}>
			<form
				noValidate
				onSubmit={handleSubmit(onSubmit)}
				className="flex max-w-3xl flex-col gap-6"
			>
				{!canSave && (
					<Alert>
						<CircleAlert />
						<AlertDescription>
							Este seguimiento aún no se puede registrar: el guardado se activa
							al integrar con la API.
						</AlertDescription>
					</Alert>
				)}
				<section className="flex flex-col gap-4" aria-labelledby="control-eval">
					<h3 id="control-eval" className="font-heading text-sm font-medium">
						Evolución del paciente
					</h3>
					<ClinicalTextarea
						id="control-reason"
						label="Motivo del seguimiento"
						required
						rows={2}
						maxLength={500}
						className="min-h-16"
						error={errors.reason}
						{...register('reason')}
					/>
					<ControlRadioField
						name="evolution"
						id="control-evolution"
						legend="Evolución"
						options={FOLLOW_UP_EVOLUTION_OPTIONS}
					/>
					<div className="grid gap-4 sm:grid-cols-2">
						<ControlMeasurementInput
							name="weightKg"
							id="control-weight"
							label="Peso (opcional)"
							unit="kg"
							step="0.01"
						/>
						<ControlMeasurementInput
							name="temperatureC"
							id="control-temperature"
							label="Temperatura (opcional)"
							unit="°C"
							step="0.1"
						/>
					</div>
					<ClinicalTextarea
						id="control-observations"
						label="Observaciones clínicas"
						rows={4}
						error={errors.observations}
						{...register('observations')}
					/>
					{openPlan && (
						<ClinicalTextarea
							id="control-treatment-response"
							label="Respuesta al tratamiento"
							rows={3}
							error={errors.treatmentResponse}
							{...register('treatmentResponse')}
						/>
					)}
				</section>

				<section
					className="flex flex-col gap-4"
					aria-labelledby="control-treatment"
				>
					<h3
						id="control-treatment"
						className="font-heading text-sm font-medium"
					>
						Tratamiento
					</h3>
					{openPlan ? (
						<ControlTreatmentDecision
							plan={openPlan}
							pendingCount={pendingCount}
						/>
					) : (
						<p className="text-sm text-muted-foreground">
							{plan
								? 'El tratamiento relacionado ya está cerrado: no hay decisión que tomar sobre él.'
								: 'Este seguimiento no tiene un tratamiento asociado, por lo que no hay decisión que tomar sobre él.'}
						</p>
					)}
				</section>

				<section className="flex flex-col gap-4" aria-labelledby="control-next">
					<h3 id="control-next" className="font-heading text-sm font-medium">
						Siguiente control
					</h3>
					<Field orientation="horizontal">
						<Controller
							name="requiresFollowUp"
							control={control}
							render={({ field }) => (
								<Switch
									id="control-requires-follow-up"
									checked={field.value}
									onCheckedChange={field.onChange}
								/>
							)}
						/>
						<FieldLabel htmlFor="control-requires-follow-up">
							¿Requiere nuevo seguimiento?
						</FieldLabel>
					</Field>
					{requiresFollowUp && (
						<div className="grid gap-4 sm:grid-cols-[14rem_1fr]">
							<Field data-invalid={!!errors.followUpDate}>
								<FieldLabel htmlFor="control-follow-up-date">
									Fecha recomendada
								</FieldLabel>
								<Controller
									name="followUpDate"
									control={control}
									render={({ field }) => (
										<DatePicker
											id="control-follow-up-date"
											value={field.value}
											onChange={field.onChange}
											onBlur={field.onBlur}
										/>
									)}
								/>
								<FieldError
									errors={
										errors.followUpDate ? [errors.followUpDate] : undefined
									}
								/>
							</Field>
							<ClinicalTextarea
								id="control-follow-up-reason"
								label="Motivo del nuevo seguimiento"
								rows={2}
								maxLength={300}
								className="min-h-16"
								error={errors.followUpReason}
								{...register('followUpReason')}
							/>
						</div>
					)}
				</section>

				{submitError && (
					<Alert variant="destructive" role="alert">
						<CircleAlert />
						<AlertTitle>No se registró el control</AlertTitle>
						<AlertDescription>{submitError}</AlertDescription>
						<Button
							type="submit"
							size="sm"
							variant="outline"
							disabled={busy}
							className="col-span-full mt-2 w-fit"
						>
							Reintentar
						</Button>
					</Alert>
				)}

				<div className="flex flex-wrap gap-2">
					<Button type="submit" disabled={busy}>
						Registrar control
					</Button>
					<Button
						variant="outline"
						nativeButton={false}
						render={<Link href={backHref} />}
					>
						Cancelar
					</Button>
				</div>
			</form>
			<AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>¿Finalizar el tratamiento?</AlertDialogTitle>
						<AlertDialogDescription>
							{pendingCount === 1
								? 'Se cancelará 1 aplicación programada.'
								: `Se cancelarán ${pendingCount} aplicaciones programadas.`}{' '}
							El tratamiento pasará al historial.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Volver</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								if (pendingValues.current) void save(pendingValues.current);
							}}
						>
							Registrar y finalizar
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</FormProvider>
	);
}
