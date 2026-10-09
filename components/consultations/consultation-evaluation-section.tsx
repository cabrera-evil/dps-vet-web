'use client';

import { ClinicalSelectField } from '@/components/clinical/clinical-select-field';
import { ClinicalTextarea } from '@/components/clinical/clinical-textarea';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
} from '@/components/ui/input-group';
import {
	BODY_CONDITION_OPTIONS,
	CAPILLARY_REFILL_OPTIONS,
	HYDRATION_OPTIONS,
	MUCOUS_MEMBRANE_OPTIONS,
	PAIN_OPTIONS,
	UNUSUAL_RANGES,
} from '@/constants/clinical';
import type { ConsultationFormValues } from '@/schemas/consultation.schema';
import { TriangleAlert } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import { ConsultationSection } from './consultation-section';

type MeasurementName = keyof typeof UNUSUAL_RANGES;

interface MeasurementInputProps {
	name: MeasurementName;
	label: string;
	unit: string;
	step: string;
}

function MeasurementInput({ name, label, unit, step }: MeasurementInputProps) {
	const {
		register,
		control,
		formState: { errors },
	} = useFormContext<ConsultationFormValues>();
	const value = useWatch({ control, name });
	const range = UNUSUAL_RANGES[name];
	const parsed = Number(value);
	const isUnusual =
		!!value?.trim() &&
		Number.isFinite(parsed) &&
		parsed > 0 &&
		(parsed < range.min || parsed > range.max);
	const id = `measurement-${name}`;

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

export function ConsultationEvaluationSection() {
	const {
		register,
		control,
		formState: { errors },
	} = useFormContext<ConsultationFormValues>();
	const mucousMembranes = useWatch({ control, name: 'mucousMembranes' });

	return (
		<ConsultationSection
			id="evaluacion"
			title="Evaluación clínica"
			description="Registra solo lo que se midió. Ningún valor es obligatorio."
		>
			<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
				<MeasurementInput name="weightKg" label="Peso" unit="kg" step="0.01" />
				<MeasurementInput
					name="temperatureC"
					label="Temperatura"
					unit="°C"
					step="0.1"
				/>
				<MeasurementInput
					name="heartRateBpm"
					label="Frecuencia cardíaca"
					unit="lpm"
					step="1"
				/>
				<MeasurementInput
					name="respiratoryRateRpm"
					label="Frecuencia respiratoria"
					unit="rpm"
					step="1"
				/>
			</div>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<ClinicalSelectField
					control={control}
					name="bodyConditionScore"
					id="measurement-body-condition"
					label="Condición corporal (1–9)"
					options={BODY_CONDITION_OPTIONS}
					placeholder="Sin registrar"
					clearLabel="Sin registrar"
				/>
				<ClinicalSelectField
					control={control}
					name="hydration"
					id="measurement-hydration"
					label="Hidratación"
					options={HYDRATION_OPTIONS}
					placeholder="Sin registrar"
					clearLabel="Sin registrar"
				/>
				<ClinicalSelectField
					control={control}
					name="mucousMembranes"
					id="measurement-mucous"
					label="Mucosas"
					options={MUCOUS_MEMBRANE_OPTIONS}
					placeholder="Sin registrar"
					clearLabel="Sin registrar"
				/>
				<ClinicalSelectField
					control={control}
					name="capillaryRefill"
					id="measurement-capillary"
					label="Tiempo de llenado capilar"
					options={CAPILLARY_REFILL_OPTIONS}
					placeholder="Sin registrar"
					clearLabel="Sin registrar"
				/>
				<ClinicalSelectField
					control={control}
					name="pain"
					id="measurement-pain"
					label="Dolor"
					options={PAIN_OPTIONS}
					placeholder="Sin registrar"
					clearLabel="Sin registrar"
				/>
				{mucousMembranes === 'OTHER' && (
					<Field data-invalid={!!errors.mucousMembranesOther}>
						<FieldLabel htmlFor="measurement-mucous-other">
							Describe las mucosas
						</FieldLabel>
						<Input
							id="measurement-mucous-other"
							aria-invalid={!!errors.mucousMembranesOther}
							{...register('mucousMembranesOther')}
						/>
						<FieldError
							errors={
								errors.mucousMembranesOther
									? [errors.mucousMembranesOther]
									: undefined
							}
						/>
					</Field>
				)}
			</div>
			<ClinicalTextarea
				id="consultation-physical-exam"
				label="Examen físico"
				required
				help="Registre el estado general y los hallazgos relevantes del examen físico. Puede incluir piel y pelaje, ojos, oídos, cavidad oral, sistema respiratorio, cardiovascular, abdomen, sistema musculoesquelético y neurológico."
				rows={6}
				error={errors.physicalExam}
				{...register('physicalExam')}
			/>
		</ConsultationSection>
	);
}
