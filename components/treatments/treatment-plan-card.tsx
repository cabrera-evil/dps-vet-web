'use client';

import { ClinicalSelectField } from '@/components/clinical/clinical-select-field';
import { ClinicalTextarea } from '@/components/clinical/clinical-textarea';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import type { SelectOption } from '@/constants/clinical';
import {
	AdministrationContext,
	AdministrationRoute,
	DoseUnit,
	DurationUnit,
} from '@/constants/enum';
import type { ConsultationFormValues } from '@/schemas/consultation.schema';
import type {
	MedicationOrderFormValues,
	TreatmentFormValues,
} from '@/schemas/treatment.schema';
import { format } from 'date-fns';
import { Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { MedicationOrderFields } from './medication-order-fields';
import { OwnerVisibilityNote } from './owner-visibility-note';

const NEW_MEDICATION: MedicationOrderFormValues = {
	medicationId: '',
	medicationName: '',
	dose: '',
	doseUnit: DoseUnit.MG,
	route: AdministrationRoute.ORAL,
	frequency: '',
	customFrequencyHours: '',
	durationValue: '',
	durationUnit: DurationUnit.DAYS,
	startDate: '',
	startTime: '',
	context: AdministrationContext.HOME,
	firstDoseInConsultation: false,
	instructions: '',
};

const NEW_TREATMENT: Omit<TreatmentFormValues, 'medications'> = {
	diagnosis: '',
	ownerInstructions: '',
	internalNotes: '',
};

interface Schedule {
	date: string;
	time: string;
}

const resolveStart = ({ date, time }: Schedule): Schedule => {
	const now = new Date();
	return {
		date: date || format(now, 'yyyy-MM-dd'),
		time: time || format(now, 'HH:mm'),
	};
};

/** New medication starting at the consultation date and time (or now). */
export const buildNewMedication = (consultation: Schedule) => {
	const { date, time } = resolveStart(consultation);
	return { ...NEW_MEDICATION, startDate: date, startTime: time };
};

export const buildNewTreatment = (
	consultation: Schedule
): TreatmentFormValues => ({
	...NEW_TREATMENT,
	medications: [buildNewMedication(consultation)],
});

interface TreatmentPlanCardProps {
	index: number;
	medicationOptions: SelectOption[];
	medicationsLoading: boolean;
	medicationsFailed: boolean;
	onRetryMedications: () => void;
	onRemove: () => void;
}

export function TreatmentPlanCard({
	index,
	medicationOptions,
	medicationsLoading,
	medicationsFailed,
	onRetryMedications,
	onRemove,
}: TreatmentPlanCardProps) {
	const {
		register,
		control,
		getValues,
		formState: { errors },
	} = useFormContext<ConsultationFormValues>();
	const { fields, append, remove } = useFieldArray({
		control,
		name: `treatments.${index}.medications`,
	});
	const diagnoses = useWatch({ control, name: 'diagnoses' });
	const diagnosis = useWatch({
		control,
		name: `treatments.${index}.diagnosis`,
	});
	const fieldErrors = errors.treatments?.[index];
	const prefix = `treatments.${index}` as const;
	const idPrefix = `treatment-${index}`;

	const names = diagnoses.map(({ name }) => name.trim()).filter(Boolean);
	if (diagnosis && !names.includes(diagnosis)) names.push(diagnosis);
	const diagnosisOptions = [...new Set(names)].map((name) => ({
		value: name,
		label: name,
	}));

	return (
		<div className="flex flex-col gap-4 rounded-xl p-4 ring-1 ring-foreground/10">
			<div className="flex items-center justify-between gap-2">
				<h4 className="text-sm font-medium">Tratamiento {index + 1}</h4>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={onRemove}
					aria-label={`Eliminar tratamiento ${index + 1}`}
				>
					<Trash2 />
					Eliminar tratamiento
				</Button>
			</div>
			{diagnosisOptions.length > 0 ? (
				<ClinicalSelectField
					control={control}
					name={`${prefix}.diagnosis`}
					id={`${idPrefix}-diagnosis`}
					label="Diagnóstico relacionado"
					options={diagnosisOptions}
					placeholder="Selecciona el diagnóstico"
				/>
			) : (
				<Field data-invalid={!!fieldErrors?.diagnosis}>
					<FieldLabel htmlFor={`${idPrefix}-diagnosis`}>
						Diagnóstico relacionado
					</FieldLabel>
					<Input
						id={`${idPrefix}-diagnosis`}
						aria-invalid={!!fieldErrors?.diagnosis}
						{...register(`${prefix}.diagnosis`)}
					/>
					<FieldError
						errors={
							fieldErrors?.diagnosis ? [fieldErrors.diagnosis] : undefined
						}
					/>
				</Field>
			)}
			{fields.map((field, medicationIndex) => (
				<MedicationOrderFields
					key={field.id}
					treatmentIndex={index}
					index={medicationIndex}
					medicationOptions={medicationOptions}
					medicationsLoading={medicationsLoading}
					medicationsFailed={medicationsFailed}
					onRetryMedications={onRetryMedications}
					canRemove={fields.length > 1}
					onRemove={() => remove(medicationIndex)}
				/>
			))}
			<div>
				<Button
					type="button"
					variant="outline"
					onClick={() =>
						append(
							buildNewMedication({
								date: getValues('date'),
								time: getValues('time'),
							})
						)
					}
				>
					<Plus />
					Agregar medicamento
				</Button>
			</div>
			<div className="flex flex-col gap-1.5">
				<ClinicalTextarea
					id={`${idPrefix}-owner-instructions`}
					label="Indicaciones al propietario (opcional)"
					help="Cuidados generales del tratamiento."
					rows={2}
					error={fieldErrors?.ownerInstructions}
					{...register(`${prefix}.ownerInstructions`)}
				/>
				<OwnerVisibilityNote variant="owner" />
			</div>
			<div className="flex flex-col gap-1.5">
				<ClinicalTextarea
					id={`${idPrefix}-internal-notes`}
					label="Notas internas (opcional)"
					rows={2}
					error={fieldErrors?.internalNotes}
					{...register(`${prefix}.internalNotes`)}
				/>
				<OwnerVisibilityNote variant="internal" />
			</div>
		</div>
	);
}
