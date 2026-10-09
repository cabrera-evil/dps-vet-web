'use client';

import { ClinicalTextarea } from '@/components/clinical/clinical-textarea';
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useSkipApplication } from '@/hooks/use-treatments';
import {
	skipApplicationSchema,
	type SkipApplicationFormValues,
} from '@/schemas/treatment.schema';
import type {
	MedicationApplication,
	MedicationOrder,
} from '@/types/treatment.type';
import { formatScheduledAt } from '@/utils/treatment-format';
import { zodResolver } from '@hookform/resolvers/zod';
import { CircleSlash } from 'lucide-react';
import { ReactElement, useId, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface SkipApplicationDialogProps {
	petId: string;
	treatmentId: string;
	order: MedicationOrder;
	application: MedicationApplication;
	trigger?: ReactElement;
}

export function SkipApplicationDialog({
	petId,
	treatmentId,
	order,
	application,
	trigger,
}: SkipApplicationDialogProps) {
	const id = useId();
	const [open, setOpen] = useState(false);
	const [submitError, setSubmitError] = useState('');
	const isSubmitting = useRef(false);
	const { mutateAsync: skipApplication, isPending } = useSkipApplication();
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting: isFormSubmitting },
	} = useForm<SkipApplicationFormValues>({
		resolver: zodResolver(skipApplicationSchema),
		defaultValues: { reason: '' },
	});

	function handleOpenChange(nextOpen: boolean) {
		if (isSubmitting.current) return;
		if (nextOpen) {
			reset({ reason: '' });
			setSubmitError('');
		}
		setOpen(nextOpen);
	}

	async function onSubmit({ reason }: SkipApplicationFormValues) {
		if (isSubmitting.current) return;
		isSubmitting.current = true;
		setSubmitError('');
		try {
			await skipApplication({
				petId,
				treatmentId,
				orderId: order.id,
				applicationId: application.id,
				reason,
			});
		} catch (error) {
			setSubmitError(
				error instanceof Error
					? error.message
					: 'No se pudo omitir la aplicación'
			);
			return;
		} finally {
			isSubmitting.current = false;
		}
		toast.success('Aplicación omitida');
		setOpen(false);
	}

	return (
		<AlertDialog open={open} onOpenChange={handleOpenChange}>
			<AlertDialogTrigger
				render={
					trigger ?? (
						<Button size="sm" variant="outline">
							<CircleSlash />
							Omitir
						</Button>
					)
				}
			/>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Omitir aplicación</AlertDialogTitle>
					<AlertDialogDescription>
						{order.medicationName} · Aplicación {application.sequence} de{' '}
						{application.total} · Programada:{' '}
						{formatScheduledAt(application.scheduledAt)}. La aplicación quedará
						como omitida en el historial.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<form
					id={`${id}-skip-form`}
					className="flex flex-col gap-3"
					onSubmit={handleSubmit(onSubmit)}
				>
					<ClinicalTextarea
						id={`${id}-reason`}
						label="Motivo"
						required
						maxLength={300}
						error={errors.reason}
						{...register('reason')}
					/>
					{submitError && (
						<p role="alert" className="text-sm text-destructive">
							{submitError}
						</p>
					)}
				</form>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isPending || isFormSubmitting}>
						Cancelar
					</AlertDialogCancel>
					<Button
						type="submit"
						form={`${id}-skip-form`}
						variant="destructive"
						disabled={isPending || isFormSubmitting}
					>
						Omitir aplicación
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
