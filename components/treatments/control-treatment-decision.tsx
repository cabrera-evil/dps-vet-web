'use client';

import { ClinicalSelectField } from '@/components/clinical/clinical-select-field';
import { ClinicalTextarea } from '@/components/clinical/clinical-textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
	Field,
	FieldError,
	FieldLabel,
	FieldLegend,
	FieldSet,
} from '@/components/ui/field';
import type { SelectOption } from '@/constants/clinical';
import { TreatmentStatus } from '@/constants/enum';
import {
	CONTROL_DECISION_OPTIONS,
	TREATMENT_OUTCOME_OPTIONS,
} from '@/constants/treatment';
import { useGet } from '@/hooks/use-rest';
import type { ControlFormValues } from '@/schemas/treatment.schema';
import type { Medication } from '@/types/medication.type';
import type { TreatmentPlan } from '@/types/treatment.type';
import { formatOrderLine } from '@/utils/treatment-format';
import { CircleAlert, Plus } from 'lucide-react';
import { useMemo } from 'react';
import {
	Controller,
	useFieldArray,
	useFormContext,
	useWatch,
} from 'react-hook-form';
import { ControlRadioField } from './control-radio-field';
import { MedicationOrderFields } from './medication-order-fields';
import { buildNewMedication } from './treatment-plan-card';

interface ControlTreatmentDecisionProps {
	plan: TreatmentPlan;
	/** Position of the plan among the follow-up's open plans. */
	index: number;
	pendingCount: number;
}

export function ControlTreatmentDecision({
	plan,
	index: planIndex,
	pendingCount,
}: ControlTreatmentDecisionProps) {
	const {
		register,
		control,
		formState: { errors },
	} = useFormContext<ControlFormValues>();
	const prefix = `decisions.${planIndex}` as const;
	const idPrefix = `control-${planIndex}`;
	const decisionErrors = errors.decisions?.[planIndex];
	const decision = useWatch({ control, name: `${prefix}.decision` });
	const { fields, append, remove } = useFieldArray({
		control,
		name: `treatments.${planIndex}.medications`,
	});
	const {
		data: medications,
		isLoading,
		isError,
		refetch,
	} = useGet<Medication[]>(
		{ path: '/medications', params: { active: true, pageSize: 100 } },
		{ enabled: decision === 'MODIFY' }
	);
	const medicationOptions = useMemo<SelectOption[]>(
		() =>
			(medications ?? []).map((medication) => ({
				value: medication.id,
				label: medication.name,
			})),
		[medications]
	);
	const activeOrders = plan.orders.filter(
		(order) => order.status === TreatmentStatus.ACTIVE
	);

	function handleDecisionChange(value: string) {
		if (value === 'MODIFY' && !fields.length)
			append(buildNewMedication({ date: '', time: '' }));
	}

	return (
		<div className="flex flex-col gap-4">
			<ControlRadioField
				name={`${prefix}.decision`}
				id={`${idPrefix}-decision`}
				legend="Decisión sobre el tratamiento"
				options={CONTROL_DECISION_OPTIONS}
				onValueChange={handleDecisionChange}
			/>
			{decision === 'MODIFY' && (
				<div className="flex flex-col gap-4 rounded-xl p-4 ring-1 ring-foreground/10">
					<Controller
						name={`${prefix}.replacedOrderIds`}
						control={control}
						render={({ field }) => (
							<FieldSet>
								<FieldLegend variant="label">
									Medicamentos que se reemplazan
								</FieldLegend>
								<p className="text-sm text-muted-foreground">
									Pasan a Suspendido y se conservan en el detalle del
									tratamiento. Las aplicaciones programadas de los medicamentos
									reemplazados se cancelan.
								</p>
								{activeOrders.map((order) => (
									<Field key={order.id} orientation="horizontal">
										<Checkbox
											id={`${idPrefix}-replace-${order.id}`}
											checked={field.value.includes(order.id)}
											onCheckedChange={(checked) =>
												field.onChange(
													checked
														? [...field.value, order.id]
														: field.value.filter((id) => id !== order.id)
												)
											}
										/>
										<FieldLabel htmlFor={`${idPrefix}-replace-${order.id}`}>
											{order.medicationName} · {formatOrderLine(order)}
										</FieldLabel>
									</Field>
								))}
								<FieldError
									errors={
										decisionErrors?.replacedOrderIds
											? [{ message: decisionErrors.replacedOrderIds.message }]
											: undefined
									}
								/>
							</FieldSet>
						)}
					/>
					<ClinicalTextarea
						id={`${idPrefix}-stop-reason`}
						label="Motivo del cambio"
						required
						rows={2}
						maxLength={300}
						className="min-h-16"
						error={decisionErrors?.stopReason}
						{...register(`${prefix}.stopReason`)}
					/>
					<h4 className="text-sm font-medium">Nueva indicación</h4>
					{fields.map((field, index) => (
						<MedicationOrderFields
							key={field.id}
							treatmentIndex={planIndex}
							index={index}
							medicationOptions={medicationOptions}
							medicationsLoading={isLoading}
							medicationsFailed={isError}
							onRetryMedications={() => void refetch()}
							canRemove={fields.length > 1}
							onRemove={() => remove(index)}
							hideFirstDose
						/>
					))}
					{errors.treatments?.[planIndex]?.medications?.message && (
						<FieldError
							errors={[
								{ message: errors.treatments[planIndex].medications.message },
							]}
						/>
					)}
					<div>
						<Button
							type="button"
							variant="outline"
							onClick={() => append(buildNewMedication({ date: '', time: '' }))}
						>
							<Plus />
							Agregar medicamento
						</Button>
					</div>
				</div>
			)}
			{decision === 'FINISH' && (
				<div className="flex flex-col gap-4 rounded-xl p-4 ring-1 ring-foreground/10">
					<ClinicalSelectField
						control={control}
						name={`${prefix}.outcome`}
						id={`${idPrefix}-outcome`}
						label="Resultado"
						options={TREATMENT_OUTCOME_OPTIONS}
						placeholder="Selecciona el resultado"
					/>
					<ClinicalTextarea
						id={`${idPrefix}-outcome-notes`}
						label="Observaciones finales (opcional)"
						rows={2}
						maxLength={500}
						className="min-h-16"
						error={decisionErrors?.outcomeNotes}
						{...register(`${prefix}.outcomeNotes`)}
					/>
					{pendingCount > 0 && (
						<Alert>
							<CircleAlert />
							<AlertTitle>
								{pendingCount === 1
									? 'Se cancelará 1 aplicación programada'
									: `Se cancelarán ${pendingCount} aplicaciones programadas`}
							</AlertTitle>
							<AlertDescription>
								Se conservan en la línea de tiempo y el tratamiento pasa al
								historial.
							</AlertDescription>
						</Alert>
					)}
				</div>
			)}
		</div>
	);
}
