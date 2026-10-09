'use client';

import { ClinicalSelectField } from '@/components/clinical/clinical-select-field';
import { ClinicalTextarea } from '@/components/clinical/clinical-textarea';
import { DatePicker } from '@/components/custom/date-picker';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { AdministrationRoute } from '@/constants/enum';
import {
	ADMINISTRATION_ROUTE_LABEL,
	ADMINISTRATION_ROUTE_OPTIONS,
	ADVERSE_REACTION_SEVERITY_OPTIONS,
	ALREADY_REGISTERED_MESSAGE,
	APPLICATION_SITE_OPTIONS,
	DOSE_UNIT_OPTIONS,
} from '@/constants/treatment';
import { useRegisterApplication } from '@/hooks/use-treatments';
import {
	applicationFormSchema,
	type ApplicationFormValues,
} from '@/schemas/treatment.schema';
import type {
	MedicationApplication,
	MedicationOrder,
} from '@/types/treatment.type';
import { formatDose, formatScheduledAt } from '@/utils/treatment-format';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Syringe } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { ReactElement, useId, useRef, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

const FALLBACK_USER_NAME = 'Usuario actual';

interface RegisterApplicationDialogProps {
	petId: string;
	petName: string;
	treatmentId: string;
	order: MedicationOrder;
	application: MedicationApplication;
	trigger?: ReactElement;
}

function buildDefaultValues(order: MedicationOrder): ApplicationFormValues {
	const now = new Date();
	return {
		date: format(now, 'yyyy-MM-dd'),
		time: format(now, 'HH:mm'),
		dose: String(order.dose),
		prescribedDose: String(order.dose),
		prescribedDoseUnit: order.doseUnit,
		prescribedRoute: order.route,
		doseUnit: order.doseUnit,
		route: order.route,
		site: '',
		adjustmentReason: '',
		notes: '',
		hasAdverseReaction: false,
		reactionDescription: '',
		reactionSeverity: '',
		reactionAction: '',
	};
}

export function RegisterApplicationDialog({
	petId,
	petName,
	treatmentId,
	order,
	application,
	trigger,
}: RegisterApplicationDialogProps) {
	const id = useId();
	const [open, setOpen] = useState(false);
	const [submitError, setSubmitError] = useState('');
	const isSubmitting = useRef(false);
	const { data: session } = useSession();
	const administeredByName = session?.user?.name ?? FALLBACK_USER_NAME;
	const { mutateAsync: registerApplication, isPending } =
		useRegisterApplication();
	const {
		register,
		control,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting: isFormSubmitting },
	} = useForm<ApplicationFormValues>({
		resolver: zodResolver(applicationFormSchema),
		defaultValues: buildDefaultValues(order),
	});
	const [
		dose,
		prescribedDose,
		doseUnit,
		prescribedDoseUnit,
		route,
		prescribedRoute,
		hasAdverseReaction,
	] = useWatch({
		control,
		name: [
			'dose',
			'prescribedDose',
			'doseUnit',
			'prescribedDoseUnit',
			'route',
			'prescribedRoute',
			'hasAdverseReaction',
		],
	});
	const differsFromOrder =
		(!!dose.trim() && Number(dose) !== Number(prescribedDose)) ||
		doseUnit !== prescribedDoseUnit ||
		route !== prescribedRoute;
	const needsSite =
		route === AdministrationRoute.IM || route === AdministrationRoute.SC;
	const isAlreadyRegistered = submitError === ALREADY_REGISTERED_MESSAGE;

	function handleOpenChange(nextOpen: boolean) {
		if (isSubmitting.current) return;
		if (nextOpen) {
			reset(buildDefaultValues(order));
			setSubmitError('');
		}
		setOpen(nextOpen);
	}

	async function onSubmit(values: ApplicationFormValues) {
		if (isSubmitting.current) return;
		isSubmitting.current = true;
		setSubmitError('');
		try {
			await registerApplication({
				petId,
				treatmentId,
				orderId: order.id,
				applicationId: application.id,
				values,
				administeredByName,
			});
		} catch (error) {
			setSubmitError(
				error instanceof Error
					? error.message
					: 'No se pudo registrar la aplicación'
			);
			return;
		} finally {
			isSubmitting.current = false;
		}
		toast.success('Aplicación registrada');
		setOpen(false);
	}

	const formId = `${id}-application-form`;

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger
				render={
					trigger ?? (
						<Button size="sm">
							<Syringe />
							Registrar aplicación
						</Button>
					)
				}
			/>
			<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Registrar aplicación</DialogTitle>
					<DialogDescription>
						{petName} · {order.medicationName} · Aplicación{' '}
						{application.sequence} de {application.total} · Programada:{' '}
						{formatScheduledAt(application.scheduledAt)} · {formatDose(order)} ·{' '}
						{ADMINISTRATION_ROUTE_LABEL[order.route]}
					</DialogDescription>
				</DialogHeader>
				<form
					id={formId}
					className="flex flex-col gap-4"
					onSubmit={handleSubmit(onSubmit)}
				>
					<div className="grid grid-cols-2 gap-4">
						<Field data-invalid={!!errors.date}>
							<FieldLabel htmlFor={`${id}-date`}>Fecha</FieldLabel>
							<Controller
								name="date"
								control={control}
								render={({ field }) => (
									<DatePicker
										id={`${id}-date`}
										value={field.value}
										onChange={field.onChange}
										onBlur={field.onBlur}
									/>
								)}
							/>
							<FieldError errors={errors.date ? [errors.date] : undefined} />
						</Field>
						<Field data-invalid={!!errors.time}>
							<FieldLabel htmlFor={`${id}-time`}>Hora real</FieldLabel>
							<Input
								id={`${id}-time`}
								type="time"
								aria-invalid={!!errors.time}
								{...register('time')}
							/>
							<FieldError errors={errors.time ? [errors.time] : undefined} />
						</Field>
						<Field data-invalid={!!errors.dose}>
							<FieldLabel htmlFor={`${id}-dose`}>Dosis aplicada</FieldLabel>
							<Input
								id={`${id}-dose`}
								type="number"
								inputMode="decimal"
								step="any"
								min="0"
								aria-invalid={!!errors.dose}
								{...register('dose')}
							/>
							<FieldError errors={errors.dose ? [errors.dose] : undefined} />
						</Field>
						<ClinicalSelectField
							control={control}
							name="doseUnit"
							id={`${id}-dose-unit`}
							label="Unidad"
							options={DOSE_UNIT_OPTIONS}
						/>
					</div>
					{differsFromOrder && (
						<ClinicalTextarea
							id={`${id}-adjustment`}
							label="Motivo del ajuste"
							help={`Indicado: ${formatDose(order)} · ${ADMINISTRATION_ROUTE_LABEL[order.route]}.`}
							required
							maxLength={300}
							className="min-h-16"
							error={errors.adjustmentReason}
							{...register('adjustmentReason')}
						/>
					)}
					<div className="grid grid-cols-2 gap-4">
						<ClinicalSelectField
							control={control}
							name="route"
							id={`${id}-route`}
							label="Vía"
							options={ADMINISTRATION_ROUTE_OPTIONS}
						/>
						<ClinicalSelectField
							control={control}
							name="site"
							id={`${id}-site`}
							label={needsSite ? 'Sitio de aplicación *' : 'Sitio (opcional)'}
							options={APPLICATION_SITE_OPTIONS}
							placeholder="Selecciona el sitio"
							clearLabel={needsSite ? undefined : 'Sin sitio'}
						/>
					</div>
					<Field>
						<FieldLabel htmlFor={`${id}-administered-by`}>
							Administrado por
						</FieldLabel>
						<Input
							id={`${id}-administered-by`}
							value={administeredByName}
							readOnly
						/>
					</Field>
					<ClinicalTextarea
						id={`${id}-notes`}
						label="Observaciones (opcional)"
						maxLength={1000}
						className="min-h-16"
						error={errors.notes}
						{...register('notes')}
					/>
					<Field orientation="horizontal">
						<Controller
							name="hasAdverseReaction"
							control={control}
							render={({ field }) => (
								<Switch
									id={`${id}-reaction`}
									checked={field.value}
									onCheckedChange={field.onChange}
								/>
							)}
						/>
						<FieldLabel htmlFor={`${id}-reaction`}>
							¿Presentó reacción adversa?
						</FieldLabel>
					</Field>
					{hasAdverseReaction && (
						<>
							<ClinicalTextarea
								id={`${id}-reaction-description`}
								label="Descripción de la reacción"
								required
								maxLength={500}
								className="min-h-16"
								error={errors.reactionDescription}
								{...register('reactionDescription')}
							/>
							<ClinicalSelectField
								control={control}
								name="reactionSeverity"
								id={`${id}-reaction-severity`}
								label="Severidad *"
								options={ADVERSE_REACTION_SEVERITY_OPTIONS}
								placeholder="Selecciona la severidad"
							/>
							<ClinicalTextarea
								id={`${id}-reaction-action`}
								label="Acción tomada (opcional)"
								maxLength={500}
								className="min-h-16"
								error={errors.reactionAction}
								{...register('reactionAction')}
							/>
						</>
					)}
					{submitError && (
						<Alert variant="destructive">
							<AlertDescription>{submitError}</AlertDescription>
							{!isAlreadyRegistered && (
								<Button
									type="submit"
									form={formId}
									size="sm"
									variant="outline"
									disabled={isPending || isFormSubmitting}
									className="col-span-full mt-2 w-fit"
								>
									Reintentar
								</Button>
							)}
						</Alert>
					)}
				</form>
				<DialogFooter>
					{isAlreadyRegistered ? (
						<Button type="button" onClick={() => setOpen(false)}>
							Cerrar
						</Button>
					) : (
						<Button
							type="submit"
							form={formId}
							disabled={isPending || isFormSubmitting}
						>
							Registrar aplicación
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
