'use client';

import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from '@/components/ui/field';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import type { SelectOption } from '@/constants/clinical';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';

const CLEAR_VALUE = '__clear__';

interface ClinicalSelectFieldProps<T extends FieldValues> {
	control: Control<T>;
	name: FieldPath<T>;
	label: string;
	options: SelectOption[];
	id?: string;
	placeholder?: string;
	clearLabel?: string;
	description?: string;
	disabled?: boolean;
	className?: string;
}

export function ClinicalSelectField<T extends FieldValues>({
	control,
	name,
	label,
	options,
	id = name,
	placeholder = 'Selecciona una opción',
	clearLabel,
	description,
	disabled,
	className,
}: ClinicalSelectFieldProps<T>) {
	const allOptions = clearLabel
		? [{ value: CLEAR_VALUE, label: clearLabel }, ...options]
		: options;
	const items = Object.fromEntries(
		allOptions.map((option) => [option.value, option.label])
	);

	return (
		<Controller
			name={name}
			control={control}
			render={({ field, fieldState }) => (
				<Field data-invalid={fieldState.invalid} className={className}>
					<FieldLabel htmlFor={id}>{label}</FieldLabel>
					<Select
						items={items}
						value={(field.value as string) ?? ''}
						onValueChange={(value) =>
							field.onChange(value === CLEAR_VALUE ? '' : value)
						}
						disabled={disabled}
					>
						<SelectTrigger
							id={id}
							className="w-full"
							aria-invalid={fieldState.invalid}
							onBlur={field.onBlur}
						>
							<SelectValue placeholder={placeholder} />
						</SelectTrigger>
						<SelectContent>
							{allOptions.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{description && <FieldDescription>{description}</FieldDescription>}
					<FieldError
						errors={fieldState.error ? [fieldState.error] : undefined}
					/>
				</Field>
			)}
		/>
	);
}
