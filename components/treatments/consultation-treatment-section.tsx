'use client';

import { ConsultationSection } from '@/components/consultations/consultation-section';
import { Button } from '@/components/ui/button';
import type { SelectOption } from '@/constants/clinical';
import { useGet } from '@/hooks/use-rest';
import type { ConsultationFormValues } from '@/schemas/consultation.schema';
import type { Medication } from '@/types/medication.type';
import { Plus } from 'lucide-react';
import { useMemo } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { TreatmentPlanCard, buildNewTreatment } from './treatment-plan-card';

export function ConsultationTreatmentSection() {
	const { control, getValues } = useFormContext<ConsultationFormValues>();
	const { fields, append, remove } = useFieldArray({
		control,
		name: 'treatments',
	});
	const {
		data: medications,
		isLoading,
		isError,
		refetch,
	} = useGet<Medication[]>({
		path: '/medications',
		params: { active: true, pageSize: 100 },
	});
	const medicationOptions = useMemo<SelectOption[]>(
		() =>
			(medications ?? []).map((medication) => ({
				value: medication.id,
				label: medication.name,
			})),
		[medications]
	);

	return (
		<ConsultationSection
			id="tratamiento"
			title="Tratamiento"
			description="Lo que se indica para después de la consulta: medicamentos, dosis y cuándo se aplican."
		>
			{fields.map((field, index) => (
				<TreatmentPlanCard
					key={field.id}
					index={index}
					medicationOptions={medicationOptions}
					medicationsLoading={isLoading}
					medicationsFailed={isError}
					onRetryMedications={() => void refetch()}
					onRemove={() => remove(index)}
				/>
			))}
			<div className="flex flex-col items-start gap-2">
				<Button
					type="button"
					variant="outline"
					onClick={() =>
						append(
							buildNewTreatment({
								date: getValues('date'),
								time: getValues('time'),
							})
						)
					}
				>
					<Plus />
					Agregar tratamiento
				</Button>
				<p className="text-sm text-muted-foreground">
					Una consulta puede no tener tratamiento.
				</p>
				<p className="text-sm text-muted-foreground">
					Los tratamientos se registran al finalizar la consulta; no se guardan
					en el borrador.
				</p>
			</div>
		</ConsultationSection>
	);
}
