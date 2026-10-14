'use client';

import { ClinicalSelectField } from '@/components/clinical/clinical-select-field';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
	DIAGNOSIS_SEVERITY_OPTIONS,
	DIAGNOSIS_STATUS_OPTIONS,
	DIAGNOSIS_TYPE_OPTIONS,
} from '@/constants/clinical';
import type { ConsultationFormValues } from '@/schemas/consultation.schema';
import { Trash2 } from 'lucide-react';
import { Controller, useFormContext } from 'react-hook-form';
import { DiagnosisCombobox } from './diagnosis-combobox';

interface DiagnosisCardProps {
	index: number;
	catalog: string[];
	onRemove: () => void;
}

export function DiagnosisCard({
	index,
	catalog,
	onRemove,
}: DiagnosisCardProps) {
	const {
		register,
		control,
		formState: { errors },
	} = useFormContext<ConsultationFormValues>();
	const fieldErrors = errors.diagnoses?.[index];
	const prefix = `diagnoses.${index}` as const;

	return (
		<div className="flex flex-col gap-4 rounded-xl p-4 ring-1 ring-foreground/10">
			<div className="flex items-center justify-between gap-2">
				<h4 className="text-sm font-medium">Diagnóstico {index + 1}</h4>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={onRemove}
					aria-label={`Eliminar diagnóstico ${index + 1}`}
				>
					<Trash2 />
					Eliminar diagnóstico
				</Button>
			</div>
			<Field data-invalid={!!fieldErrors?.name}>
				<FieldLabel htmlFor={`${prefix}-name`}>Diagnóstico</FieldLabel>
				<Controller
					name={`${prefix}.name`}
					control={control}
					render={({ field }) => (
						<DiagnosisCombobox
							id={`${prefix}-name`}
							value={field.value}
							onChange={field.onChange}
							catalog={catalog}
							invalid={!!fieldErrors?.name}
						/>
					)}
				/>
				<FieldError
					errors={fieldErrors?.name ? [fieldErrors.name] : undefined}
				/>
			</Field>
			<div className="grid gap-4 sm:grid-cols-3">
				<ClinicalSelectField
					control={control}
					name={`${prefix}.type`}
					id={`${prefix}-type`}
					label="Tipo"
					options={DIAGNOSIS_TYPE_OPTIONS}
				/>
				<ClinicalSelectField
					control={control}
					name={`${prefix}.status`}
					id={`${prefix}-status`}
					label="Estado"
					options={DIAGNOSIS_STATUS_OPTIONS}
				/>
				<ClinicalSelectField
					control={control}
					name={`${prefix}.severity`}
					id={`${prefix}-severity`}
					label="Severidad (opcional)"
					options={DIAGNOSIS_SEVERITY_OPTIONS}
					placeholder="Sin especificar"
					clearLabel="Sin especificar"
				/>
			</div>
			<Field>
				<FieldLabel htmlFor={`${prefix}-notes`}>Notas (opcional)</FieldLabel>
				<Textarea
					id={`${prefix}-notes`}
					rows={2}
					placeholder="Justificación o interpretación del diagnóstico."
					{...register(`${prefix}.notes`)}
				/>
			</Field>
			<Field orientation="horizontal">
				<Controller
					name={`${prefix}.isActiveProblem`}
					control={control}
					render={({ field }) => (
						<Switch
							id={`${prefix}-active`}
							checked={field.value}
							onCheckedChange={field.onChange}
						/>
					)}
				/>
				<FieldLabel htmlFor={`${prefix}-active`}>
					Marcar como problema activo
				</FieldLabel>
			</Field>
		</div>
	);
}
