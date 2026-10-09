'use client';

import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
} from '@/components/ui/combobox';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import type { SelectOption } from '@/constants/clinical';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';

interface ClinicalComboboxFieldProps<T extends FieldValues> {
	control: Control<T>;
	name: FieldPath<T>;
	label: string;
	options: SelectOption[];
	id?: string;
	placeholder?: string;
	emptyLabel?: string;
	disabled?: boolean;
	className?: string;
}

/** Searchable single select: typing filters the options by label (accent and case insensitive). */
export function ClinicalComboboxField<T extends FieldValues>({
	control,
	name,
	label,
	options,
	id = name,
	placeholder = 'Busca una opción',
	emptyLabel = 'Sin resultados',
	disabled,
	className,
}: ClinicalComboboxFieldProps<T>) {
	return (
		<Controller
			name={name}
			control={control}
			render={({ field, fieldState }) => (
				<Field data-invalid={fieldState.invalid} className={className}>
					<FieldLabel htmlFor={id}>{label}</FieldLabel>
					<Combobox
						items={options}
						value={
							options.find((option) => option.value === field.value) ?? null
						}
						onValueChange={(option) => field.onChange(option?.value ?? '')}
						disabled={disabled}
					>
						<ComboboxInput
							id={id}
							placeholder={placeholder}
							showClear
							aria-invalid={fieldState.invalid}
							onBlur={field.onBlur}
						/>
						<ComboboxContent>
							<ComboboxEmpty>{emptyLabel}</ComboboxEmpty>
							<ComboboxList>
								{(option: SelectOption) => (
									<ComboboxItem key={option.value} value={option}>
										{option.label}
									</ComboboxItem>
								)}
							</ComboboxList>
						</ComboboxContent>
					</Combobox>
					<FieldError
						errors={fieldState.error ? [fieldState.error] : undefined}
					/>
				</Field>
			)}
		/>
	);
}
