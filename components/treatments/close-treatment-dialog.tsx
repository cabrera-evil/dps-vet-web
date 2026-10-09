'use client';

import { ClinicalSelectField } from '@/components/clinical/clinical-select-field';
import { ClinicalTextarea } from '@/components/clinical/clinical-textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { ApplicationStatus, TreatmentOutcome } from '@/constants/enum';
import { TREATMENT_OUTCOME_OPTIONS } from '@/constants/treatment';
import { useCloseTreatment } from '@/hooks/use-treatments';
import {
	closeTreatmentSchema,
	type CloseTreatmentFormValues,
} from '@/schemas/treatment.schema';
import type {
	CloseTreatmentAction,
	TreatmentPlan,
} from '@/types/treatment.type';
import { zodResolver } from '@hookform/resolvers/zod';
import { CircleAlert } from 'lucide-react';
import { ReactElement, useId, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const COPY: Record<
	CloseTreatmentAction,
	{ title: string; submit: string; success: string; reasonLabel: string }
> = {
	COMPLETE: {
		title: 'Finalizar tratamiento',
		submit: 'Finalizar tratamiento',
		success: 'Tratamiento finalizado',
		reasonLabel: 'Observaciones finales (opcional)',
	},
	SUSPEND: {
		title: 'Suspender tratamiento',
		submit: 'Suspender tratamiento',
		success: 'Tratamiento suspendido',
		reasonLabel: 'Motivo de la suspensión',
	},
	CANCEL: {
		title: 'Cancelar tratamiento',
		submit: 'Cancelar tratamiento',
		success: 'Tratamiento cancelado',
		reasonLabel: 'Motivo de la cancelación',
	},
};

interface CloseTreatmentDialogProps {
	petId: string;
	plan: TreatmentPlan;
	action: CloseTreatmentAction;
	trigger: ReactElement;
}

/** Closing never deletes: the plan moves to the history with its outcome. */
export function CloseTreatmentDialog({
	petId,
	plan,
	action,
	trigger,
}: CloseTreatmentDialogProps) {
	const [open, setOpen] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const isSubmitting = useRef(false);
	const formId = useId();
	const copy = COPY[action];
	const needsReason = action !== 'COMPLETE';
	const { mutateAsync: closeTreatment, isPending } = useCloseTreatment();
	const form = useForm<CloseTreatmentFormValues>({
		resolver: zodResolver(closeTreatmentSchema),
		defaultValues: {
			outcome: action === 'COMPLETE' ? TreatmentOutcome.COMPLETED : '',
			reason: '',
		},
	});
	const {
		register,
		control,
		handleSubmit,
		reset,
		setError,
		formState: { errors, isSubmitting: isFormSubmitting },
	} = form;
	const pendingCount = plan.orders
		.flatMap((order) => order.applications)
		.filter(
			(application) => application.status === ApplicationStatus.SCHEDULED
		).length;
	const busy = isPending || isFormSubmitting;

	function handleOpenChange(nextOpen: boolean) {
		if (isSubmitting.current) return;
		if (nextOpen) {
			setSubmitError(null);
			reset({
				outcome: action === 'COMPLETE' ? TreatmentOutcome.COMPLETED : '',
				reason: '',
			});
		}
		setOpen(nextOpen);
	}

	async function onSubmit(values: CloseTreatmentFormValues) {
		if (isSubmitting.current) return;
		if (needsReason && !values.reason) {
			setError('reason', { message: 'Indica el motivo' });
			return;
		}
		isSubmitting.current = true;
		setSubmitError(null);
		try {
			await closeTreatment({
				petId,
				treatmentId: plan.id,
				action,
				outcome: values.outcome || undefined,
				reason: values.reason || undefined,
			});
			toast.success(copy.success);
			setOpen(false);
		} catch (error) {
			setSubmitError(
				error instanceof Error
					? error.message
					: 'No se pudo guardar el cambio. Lo que escribiste se conserva.'
			);
		} finally {
			isSubmitting.current = false;
		}
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger render={trigger} />
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{copy.title}</DialogTitle>
					<DialogDescription>
						{plan.diagnosis}. El tratamiento no se elimina: pasa al historial.
					</DialogDescription>
				</DialogHeader>
				{pendingCount > 0 && (
					<Alert>
						<CircleAlert />
						<AlertTitle>
							{pendingCount === 1
								? 'Queda 1 aplicación programada'
								: `Quedan ${pendingCount} aplicaciones programadas`}
						</AlertTitle>
						<AlertDescription>
							Se marcarán como canceladas y se conservarán en la línea de
							tiempo.
						</AlertDescription>
					</Alert>
				)}
				<form
					id={formId}
					noValidate
					onSubmit={handleSubmit(onSubmit)}
					className="flex flex-col gap-4"
				>
					{action === 'COMPLETE' && (
						<ClinicalSelectField
							control={control}
							name="outcome"
							id={`${formId}-outcome`}
							label="Resultado"
							options={TREATMENT_OUTCOME_OPTIONS}
						/>
					)}
					<ClinicalTextarea
						id={`${formId}-reason`}
						label={copy.reasonLabel}
						rows={3}
						required={needsReason}
						error={errors.reason}
						{...register('reason')}
					/>
					{submitError && (
						<Alert variant="destructive" role="alert">
							<CircleAlert />
							<AlertTitle>No se guardó el cambio</AlertTitle>
							<AlertDescription>{submitError}</AlertDescription>
						</Alert>
					)}
				</form>
				<DialogFooter>
					<Button
						type="submit"
						form={formId}
						variant={action === 'COMPLETE' ? 'default' : 'destructive'}
						disabled={busy}
					>
						{submitError ? 'Reintentar' : copy.submit}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
