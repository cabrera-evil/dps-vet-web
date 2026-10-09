'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from '@/components/ui/field';
import { DiagnosisStatus, DiagnosisType } from '@/constants/enum';
import type { ConsultationFormValues } from '@/schemas/consultation.schema';
import { Plus } from 'lucide-react';
import {
	Controller,
	useFieldArray,
	useFormContext,
	useWatch,
} from 'react-hook-form';
import { ConsultationSection } from './consultation-section';
import { DiagnosisCard } from './diagnosis-card';

const NEW_DIAGNOSIS: ConsultationFormValues['diagnoses'][number] = {
	name: '',
	type: DiagnosisType.PRESUMPTIVE,
	status: DiagnosisStatus.UNDER_EVALUATION,
	severity: '',
	notes: '',
	isActiveProblem: false,
};

export function ConsultationDiagnosesSection({
	catalog,
}: {
	catalog: string[];
}) {
	const {
		control,
		formState: { errors },
	} = useFormContext<ConsultationFormValues>();
	const { fields, append, remove } = useFieldArray({
		control,
		name: 'diagnoses',
	});
	const noDefinedDiagnosis = useWatch({ control, name: 'noDefinedDiagnosis' });

	return (
		<ConsultationSection
			id="diagnostico"
			title="Diagnóstico"
			description="Puede haber uno, varios o ninguno mientras la consulta sigue en evaluación."
		>
			{fields.map((field, index) => (
				<DiagnosisCard
					key={field.id}
					index={index}
					catalog={catalog}
					onRemove={() => remove(index)}
				/>
			))}
			<div>
				<Button
					type="button"
					variant="outline"
					disabled={noDefinedDiagnosis}
					onClick={() => append(NEW_DIAGNOSIS)}
				>
					<Plus />
					Agregar diagnóstico
				</Button>
			</div>
			<Field
				orientation="horizontal"
				data-invalid={!!errors.noDefinedDiagnosis}
			>
				<Controller
					name="noDefinedDiagnosis"
					control={control}
					render={({ field }) => (
						<Checkbox
							id="no-defined-diagnosis"
							checked={field.value}
							disabled={fields.length > 0}
							onCheckedChange={field.onChange}
						/>
					)}
				/>
				<div className="flex flex-col gap-0.5">
					<FieldLabel htmlFor="no-defined-diagnosis">
						Sin diagnóstico definido / En evaluación
					</FieldLabel>
					<FieldDescription>
						No es necesario inventar un diagnóstico para cerrar la atención.
					</FieldDescription>
				</div>
			</Field>
			<FieldError
				errors={
					errors.noDefinedDiagnosis ? [errors.noDefinedDiagnosis] : undefined
				}
			/>
		</ConsultationSection>
	);
}
