'use client';

import { ClinicalSelectField } from '@/components/clinical/clinical-select-field';
import { DatePicker } from '@/components/custom/date-picker';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { CONSULTATION_KIND_OPTIONS } from '@/constants/clinical';
import type { ConsultationFormValues } from '@/schemas/consultation.schema';
import type { ConsultationOption } from '@/types/consultation.type';
import { Controller, useFormContext } from 'react-hook-form';
import { ConsultationSection } from './consultation-section';

interface ConsultationInfoSectionProps {
	staff: ConsultationOption[];
	appointments: ConsultationOption[];
}

export function ConsultationInfoSection({
	staff,
	appointments,
}: ConsultationInfoSectionProps) {
	const {
		register,
		control,
		formState: { errors },
	} = useFormContext<ConsultationFormValues>();

	const toOptions = (options: ConsultationOption[]) =>
		options.map((option) => ({ value: option.id, label: option.label }));

	return (
		<ConsultationSection
			id="informacion"
			title="Información"
			description="Cuándo y quién realiza la atención."
		>
			<div className="grid gap-4 sm:grid-cols-2">
				<Field data-invalid={!!errors.date}>
					<FieldLabel htmlFor="consultation-date">Fecha</FieldLabel>
					<Controller
						name="date"
						control={control}
						render={({ field }) => (
							<DatePicker
								id="consultation-date"
								value={field.value}
								onChange={field.onChange}
								onBlur={field.onBlur}
							/>
						)}
					/>
					<FieldError errors={errors.date ? [errors.date] : undefined} />
				</Field>
				<Field data-invalid={!!errors.time}>
					<FieldLabel htmlFor="consultation-time">Hora</FieldLabel>
					<Input
						id="consultation-time"
						type="time"
						aria-invalid={!!errors.time}
						{...register('time')}
					/>
					<FieldError errors={errors.time ? [errors.time] : undefined} />
				</Field>
				<ClinicalSelectField
					control={control}
					name="staffId"
					id="consultation-staff"
					label="Veterinario"
					options={toOptions(staff)}
					placeholder="Selecciona al veterinario"
				/>
				<ClinicalSelectField
					control={control}
					name="kind"
					id="consultation-kind"
					label="Tipo de consulta"
					options={CONSULTATION_KIND_OPTIONS}
					placeholder="Selecciona el tipo"
				/>
			</div>
			<ClinicalSelectField
				control={control}
				name="appointmentId"
				id="consultation-appointment"
				label="Cita relacionada (opcional)"
				options={toOptions(appointments)}
				placeholder="Sin cita asociada"
				clearLabel="Sin cita asociada"
			/>
		</ConsultationSection>
	);
}
