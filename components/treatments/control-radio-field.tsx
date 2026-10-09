'use client';

import {
	Field,
	FieldError,
	FieldLabel,
	FieldLegend,
	FieldSet,
} from '@/components/ui/field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { SelectOption } from '@/constants/clinical';
import type { ControlFormValues } from '@/schemas/treatment.schema';
import { Controller, useFormContext } from 'react-hook-form';

interface ControlRadioFieldProps {
	name: 'evolution' | 'decision';
	id: string;
	legend: string;
	options: SelectOption[];
	onValueChange?: (value: string) => void;
}

export function ControlRadioField({
	name,
	id,
	legend,
	options,
	onValueChange,
}: ControlRadioFieldProps) {
	const { control } = useFormContext<ControlFormValues>();

	return (
		<Controller
			name={name}
			control={control}
			render={({ field, fieldState }) => (
				<FieldSet data-invalid={fieldState.invalid}>
					<FieldLegend variant="label">{legend}</FieldLegend>
					<RadioGroup
						value={field.value ?? ''}
						className="flex flex-wrap gap-x-6 gap-y-2"
						aria-invalid={fieldState.invalid}
						onValueChange={(value) => {
							field.onChange(value);
							onValueChange?.(String(value));
						}}
					>
						{options.map((option) => (
							<Field key={option.value} orientation="horizontal">
								<RadioGroupItem
									id={`${id}-${option.value}`}
									value={option.value}
									aria-invalid={fieldState.invalid}
								/>
								<FieldLabel htmlFor={`${id}-${option.value}`}>
									{option.label}
								</FieldLabel>
							</Field>
						))}
					</RadioGroup>
					<FieldError
						errors={fieldState.error ? [fieldState.error] : undefined}
					/>
				</FieldSet>
			)}
		/>
	);
}
