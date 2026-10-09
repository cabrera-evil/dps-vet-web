'use client';

import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
} from '@/components/ui/input-group';
import { UNUSUAL_RANGES } from '@/constants/clinical';
import type { ControlFormValues } from '@/schemas/treatment.schema';
import { TriangleAlert } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';

interface ControlMeasurementInputProps {
	name: 'weightKg' | 'temperatureC';
	id: string;
	label: string;
	unit: string;
	step: string;
}

export function ControlMeasurementInput({
	name,
	id,
	label,
	unit,
	step,
}: ControlMeasurementInputProps) {
	const {
		register,
		control,
		formState: { errors },
	} = useFormContext<ControlFormValues>();
	const value = useWatch({ control, name });
	const range = UNUSUAL_RANGES[name];
	const parsed = Number(value);
	const isUnusual =
		!!value?.trim() &&
		Number.isFinite(parsed) &&
		parsed > 0 &&
		(parsed < range.min || parsed > range.max);

	return (
		<Field data-invalid={!!errors[name]}>
			<FieldLabel htmlFor={id}>{label}</FieldLabel>
			<InputGroup>
				<InputGroupInput
					id={id}
					type="number"
					inputMode="decimal"
					min={0}
					step={step}
					aria-invalid={!!errors[name]}
					aria-describedby={isUnusual ? `${id}-hint` : undefined}
					{...register(name)}
				/>
				<InputGroupAddon align="inline-end">
					<InputGroupText>{unit}</InputGroupText>
				</InputGroupAddon>
			</InputGroup>
			{isUnusual && (
				<p
					id={`${id}-hint`}
					role="status"
					className="flex items-center gap-1 text-xs font-medium"
				>
					<TriangleAlert className="size-3 shrink-0" />
					Valor inusual. Verifica la medición.
				</p>
			)}
			<FieldError errors={errors[name] ? [errors[name]] : undefined} />
		</Field>
	);
}
