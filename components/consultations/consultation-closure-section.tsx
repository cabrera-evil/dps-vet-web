'use client';

import { ClinicalSelectField } from '@/components/clinical/clinical-select-field';
import { ClinicalTextarea } from '@/components/clinical/clinical-textarea';
import { DatePicker } from '@/components/custom/date-picker';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Switch } from '@/components/ui/switch';
import { PROGNOSIS_OPTIONS } from '@/constants/clinical';
import type { ConsultationFormValues } from '@/schemas/consultation.schema';
import { Lock } from 'lucide-react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { ConsultationSection } from './consultation-section';

export function ConsultationClosureSection() {
	const {
		register,
		control,
		formState: { errors },
	} = useFormContext<ConsultationFormValues>();
	const requiresFollowUp = useWatch({ control, name: 'requiresFollowUp' });

	return (
		<ConsultationSection
			id="cierre"
			title="Indicaciones y cierre"
			description="Lo que se comunica al propietario y lo que sigue después."
		>
			<ClinicalTextarea
				id="consultation-instructions"
				label="Indicaciones clínicas"
				required
				help="Pueden ser visibles para el propietario: dieta, cuidados, reposo, restricciones y señales de alarma."
				rows={5}
				error={errors.instructions}
				{...register('instructions')}
			/>
			<div className="flex flex-col gap-1.5">
				<ClinicalTextarea
					id="consultation-internal-notes"
					label="Notas internas (opcional)"
					rows={3}
					error={errors.internalNotes}
					{...register('internalNotes')}
				/>
				<p className="flex items-center gap-1.5 text-xs text-muted-foreground">
					<Lock className="size-3" />
					Esta información solo será visible para el personal de la clínica.
				</p>
			</div>
			<ClinicalSelectField
				control={control}
				name="prognosis"
				id="consultation-prognosis"
				label="Pronóstico (opcional)"
				options={PROGNOSIS_OPTIONS}
				placeholder="Sin registrar"
				clearLabel="Sin registrar"
				className="sm:max-w-xs"
			/>
			<Field orientation="horizontal">
				<Controller
					name="requiresFollowUp"
					control={control}
					render={({ field }) => (
						<Switch
							id="requires-follow-up"
							checked={field.value}
							onCheckedChange={field.onChange}
						/>
					)}
				/>
				<FieldLabel htmlFor="requires-follow-up">
					Requiere seguimiento
				</FieldLabel>
			</Field>
			{requiresFollowUp && (
				<div className="grid gap-4 sm:grid-cols-[14rem_1fr]">
					<Field data-invalid={!!errors.followUpDate}>
						<FieldLabel htmlFor="follow-up-date">Fecha recomendada</FieldLabel>
						<Controller
							name="followUpDate"
							control={control}
							render={({ field }) => (
								<DatePicker
									id="follow-up-date"
									value={field.value}
									onChange={field.onChange}
									onBlur={field.onBlur}
								/>
							)}
						/>
						<FieldError
							errors={errors.followUpDate ? [errors.followUpDate] : undefined}
						/>
					</Field>
					<ClinicalTextarea
						id="follow-up-reason"
						label="Motivo del seguimiento"
						rows={2}
						className="min-h-16"
						error={errors.followUpReason}
						{...register('followUpReason')}
					/>
				</div>
			)}
		</ConsultationSection>
	);
}
