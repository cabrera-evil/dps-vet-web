'use client';

import { ClinicalComboboxField } from '@/components/clinical/clinical-combobox-field';
import { ClinicalSelectField } from '@/components/clinical/clinical-select-field';
import { ClinicalTextarea } from '@/components/clinical/clinical-textarea';
import { DatePicker } from '@/components/custom/date-picker';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import type { SelectOption } from '@/constants/clinical';
import {
	AdministrationContext,
	type AdministrationRoute,
} from '@/constants/enum';
import {
	ADMINISTRATION_ROUTE_OPTIONS,
	CUSTOM_FREQUENCY,
	DOSE_UNIT_OPTIONS,
	DURATION_UNIT_OPTIONS,
	FREQUENCY_OPTIONS,
	PRN_FREQUENCY,
} from '@/constants/treatment';
import type { ConsultationFormValues } from '@/schemas/consultation.schema';
import { isInjectable } from '@/utils/treatment';
import { Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { AdministrationContextField } from './administration-context-field';
import { OwnerVisibilityNote } from './owner-visibility-note';
import { SchedulePreview } from './schedule-preview';

interface MedicationOrderFieldsProps {
	treatmentIndex: number;
	index: number;
	medicationOptions: SelectOption[];
	medicationsLoading: boolean;
	medicationsFailed: boolean;
	onRetryMedications: () => void;
	canRemove: boolean;
	onRemove: () => void;
	hideFirstDose?: boolean;
}

export function MedicationOrderFields({
	treatmentIndex,
	index,
	medicationOptions,
	medicationsLoading,
	medicationsFailed,
	onRetryMedications,
	canRemove,
	onRemove,
	hideFirstDose,
}: MedicationOrderFieldsProps) {
	const {
		register,
		control,
		setValue,
		formState: { errors },
	} = useFormContext<ConsultationFormValues>();
	const prefix = `treatments.${treatmentIndex}.medications.${index}` as const;
	const idPrefix = `treatment-${treatmentIndex}-medication-${index}`;
	const fieldErrors = errors.treatments?.[treatmentIndex]?.medications?.[index];
	const medicationId = useWatch({ control, name: `${prefix}.medicationId` });
	const route = useWatch({ control, name: `${prefix}.route` });
	const frequency = useWatch({ control, name: `${prefix}.frequency` });
	const injectable = isInjectable(route);
	const frequencyOptions = injectable
		? FREQUENCY_OPTIONS.filter((option) => option.value !== PRN_FREQUENCY)
		: FREQUENCY_OPTIONS;

	useEffect(() => {
		const option = medicationOptions.find(
			({ value }) => value === medicationId
		);
		if (option) setValue(`${prefix}.medicationName`, option.label);
	}, [medicationId, medicationOptions, prefix, setValue]);

	function handleRouteChange(value: string) {
		if (!isInjectable(value as AdministrationRoute)) return;
		setValue(`${prefix}.context`, AdministrationContext.CLINIC, {
			shouldValidate: !!fieldErrors?.context,
		});
		if (frequency === PRN_FREQUENCY)
			setValue(`${prefix}.frequency`, '', {
				shouldValidate: !!fieldErrors?.frequency,
			});
	}

	function handleFrequencyChange(value: string) {
		if (value !== CUSTOM_FREQUENCY)
			setValue(`${prefix}.customFrequencyHours`, '', { shouldValidate: false });
	}

	return (
		<div className="flex flex-col gap-4 rounded-lg bg-muted/30 p-4 ring-1 ring-foreground/10">
			<div className="flex items-center justify-between gap-2">
				<h5 className="text-sm font-medium">Medicamento {index + 1}</h5>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					disabled={!canRemove}
					onClick={onRemove}
					aria-label={`Eliminar medicamento ${index + 1} del tratamiento ${treatmentIndex + 1}`}
				>
					<Trash2 />
					Eliminar medicamento
				</Button>
			</div>
			<ClinicalComboboxField
				control={control}
				name={`${prefix}.medicationId`}
				id={`${idPrefix}-medication`}
				label="Medicamento"
				options={medicationOptions}
				placeholder={
					medicationsLoading ? 'Cargando medicamentos…' : 'Busca un medicamento'
				}
			/>
			{medicationsFailed && (
				<div
					role="alert"
					className="flex flex-wrap items-center gap-2 text-sm text-destructive"
				>
					No se pudo cargar el catálogo de medicamentos.
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={onRetryMedications}
					>
						Reintentar
					</Button>
				</div>
			)}
			<div className="grid gap-4 sm:grid-cols-3">
				<Field data-invalid={!!fieldErrors?.dose}>
					<FieldLabel htmlFor={`${idPrefix}-dose`}>Dosis</FieldLabel>
					<Input
						id={`${idPrefix}-dose`}
						type="number"
						inputMode="decimal"
						min="0"
						step="any"
						aria-invalid={!!fieldErrors?.dose}
						{...register(`${prefix}.dose`)}
					/>
					<FieldError
						errors={fieldErrors?.dose ? [fieldErrors.dose] : undefined}
					/>
				</Field>
				<ClinicalSelectField
					control={control}
					name={`${prefix}.doseUnit`}
					id={`${idPrefix}-dose-unit`}
					label="Unidad"
					options={DOSE_UNIT_OPTIONS}
				/>
				<ClinicalSelectField
					control={control}
					name={`${prefix}.route`}
					id={`${idPrefix}-route`}
					label="Vía"
					options={ADMINISTRATION_ROUTE_OPTIONS}
					onValueChange={handleRouteChange}
				/>
			</div>
			<div className="grid gap-4 sm:grid-cols-2">
				<ClinicalSelectField
					control={control}
					name={`${prefix}.frequency`}
					id={`${idPrefix}-frequency`}
					label="Frecuencia"
					options={frequencyOptions}
					placeholder="Selecciona la frecuencia"
					onValueChange={handleFrequencyChange}
				/>
				{frequency === CUSTOM_FREQUENCY && (
					<Field data-invalid={!!fieldErrors?.customFrequencyHours}>
						<FieldLabel htmlFor={`${idPrefix}-custom-frequency`}>
							Cada N horas
						</FieldLabel>
						<Input
							id={`${idPrefix}-custom-frequency`}
							type="number"
							inputMode="numeric"
							min="1"
							step="1"
							aria-invalid={!!fieldErrors?.customFrequencyHours}
							{...register(`${prefix}.customFrequencyHours`)}
						/>
						<FieldError
							errors={
								fieldErrors?.customFrequencyHours
									? [fieldErrors.customFrequencyHours]
									: undefined
							}
						/>
					</Field>
				)}
			</div>
			<div className="grid gap-4 sm:grid-cols-2">
				<Field data-invalid={!!fieldErrors?.durationValue}>
					<FieldLabel htmlFor={`${idPrefix}-duration`}>Duración</FieldLabel>
					<Input
						id={`${idPrefix}-duration`}
						type="number"
						inputMode="numeric"
						min="1"
						step="1"
						aria-invalid={!!fieldErrors?.durationValue}
						{...register(`${prefix}.durationValue`)}
					/>
					<FieldError
						errors={
							fieldErrors?.durationValue
								? [fieldErrors.durationValue]
								: undefined
						}
					/>
				</Field>
				<ClinicalSelectField
					control={control}
					name={`${prefix}.durationUnit`}
					id={`${idPrefix}-duration-unit`}
					label="Unidad de duración"
					options={DURATION_UNIT_OPTIONS}
				/>
				<Field data-invalid={!!fieldErrors?.startDate}>
					<FieldLabel htmlFor={`${idPrefix}-start-date`}>
						Fecha de inicio
					</FieldLabel>
					<Controller
						name={`${prefix}.startDate`}
						control={control}
						render={({ field }) => (
							<DatePicker
								id={`${idPrefix}-start-date`}
								value={field.value}
								onChange={field.onChange}
								onBlur={field.onBlur}
							/>
						)}
					/>
					<FieldError
						errors={
							fieldErrors?.startDate ? [fieldErrors.startDate] : undefined
						}
					/>
				</Field>
				<Field data-invalid={!!fieldErrors?.startTime}>
					<FieldLabel htmlFor={`${idPrefix}-start-time`}>
						Hora de inicio
					</FieldLabel>
					<Input
						id={`${idPrefix}-start-time`}
						type="time"
						aria-invalid={!!fieldErrors?.startTime}
						{...register(`${prefix}.startTime`)}
					/>
					<FieldError
						errors={
							fieldErrors?.startTime ? [fieldErrors.startTime] : undefined
						}
					/>
				</Field>
			</div>
			<AdministrationContextField
				treatmentIndex={treatmentIndex}
				index={index}
				hideFirstDose={hideFirstDose}
			/>
			<div className="flex flex-col gap-1.5">
				<ClinicalTextarea
					id={`${idPrefix}-instructions`}
					label="Indicaciones del medicamento"
					required
					help="Cómo administrarlo, con o sin alimento y qué vigilar."
					rows={2}
					error={fieldErrors?.instructions}
					{...register(`${prefix}.instructions`)}
				/>
				<OwnerVisibilityNote variant="owner" />
			</div>
			<SchedulePreview treatmentIndex={treatmentIndex} index={index} />
		</div>
	);
}
