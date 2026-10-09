'use client';

import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
	FieldLegend,
	FieldSet,
} from '@/components/ui/field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { AdministrationContext } from '@/constants/enum';
import { ADMINISTRATION_CONTEXT_OPTIONS } from '@/constants/treatment';
import type { ConsultationFormValues } from '@/schemas/consultation.schema';
import { isInjectable } from '@/utils/treatment';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

interface AdministrationContextFieldProps {
	treatmentIndex: number;
	index: number;
	hideFirstDose?: boolean;
}

export function AdministrationContextField({
	treatmentIndex,
	index,
	hideFirstDose = false,
}: AdministrationContextFieldProps) {
	const { control, setValue } = useFormContext<ConsultationFormValues>();
	const prefix = `treatments.${treatmentIndex}.medications.${index}` as const;
	const idPrefix = `treatment-${treatmentIndex}-medication-${index}`;
	const route = useWatch({ control, name: `${prefix}.route` });
	const context = useWatch({ control, name: `${prefix}.context` });
	const injectable = isInjectable(route);

	return (
		<div className="flex flex-col gap-4">
			<Controller
				name={`${prefix}.context`}
				control={control}
				render={({ field, fieldState }) => (
					<FieldSet data-invalid={fieldState.invalid}>
						<FieldLegend variant="label">Dónde se administra</FieldLegend>
						<RadioGroup
							value={field.value}
							disabled={injectable}
							className="flex flex-wrap gap-x-6 gap-y-2"
							aria-invalid={fieldState.invalid}
							onValueChange={(value) => {
								field.onChange(value);
								if (value !== AdministrationContext.CLINIC)
									setValue(`${prefix}.firstDoseInConsultation`, false);
							}}
						>
							{ADMINISTRATION_CONTEXT_OPTIONS.map((option) => (
								<Field key={option.value} orientation="horizontal">
									<RadioGroupItem
										id={`${idPrefix}-context-${option.value}`}
										value={option.value}
										aria-invalid={fieldState.invalid}
									/>
									<FieldLabel htmlFor={`${idPrefix}-context-${option.value}`}>
										{option.label}
									</FieldLabel>
								</Field>
							))}
						</RadioGroup>
						{injectable && (
							<FieldDescription>
								Las inyecciones se aplican en la clínica.
							</FieldDescription>
						)}
						<FieldError
							errors={fieldState.error ? [fieldState.error] : undefined}
						/>
					</FieldSet>
				)}
			/>
			{injectable && (
				<p className="text-sm text-muted-foreground">
					Indica frecuencia y duración para programar las fechas en que el
					propietario debe volver a la clínica.
				</p>
			)}
			{context === AdministrationContext.CLINIC && !hideFirstDose && (
				<Field orientation="horizontal">
					<Controller
						name={`${prefix}.firstDoseInConsultation`}
						control={control}
						render={({ field }) => (
							<Switch
								id={`${idPrefix}-first-dose`}
								checked={field.value}
								onCheckedChange={field.onChange}
							/>
						)}
					/>
					<FieldLabel htmlFor={`${idPrefix}-first-dose`}>
						La primera dosis se aplica en esta consulta
					</FieldLabel>
				</Field>
			)}
		</div>
	);
}
