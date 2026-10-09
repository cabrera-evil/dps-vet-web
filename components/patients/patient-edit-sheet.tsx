'use client';

import { ClinicalSelectField } from '@/components/clinical/clinical-select-field';
import { DatePicker } from '@/components/custom/date-picker';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { PET_SEX_LABEL } from '@/constants/clinical';
import { useGet } from '@/hooks/use-rest';
import {
	PatientGeneralDataFormValues,
	patientGeneralDataFormSchema,
} from '@/schemas/patient-record.schema';
import type { CatalogEntry } from '@/types/catalog.type';
import type { PatientIdentity } from '@/types/patient-record.type';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface PatientEditSheetProps {
	patient: PatientIdentity;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (values: PatientGeneralDataFormValues) => void;
}

const SEX_OPTIONS = Object.entries(PET_SEX_LABEL).map(([value, label]) => ({
	value,
	label,
}));

function toFormValues(patient: PatientIdentity): PatientGeneralDataFormValues {
	return {
		name: patient.name,
		species: patient.species,
		breed: patient.breed,
		sex: patient.sex,
		sterilized: patient.sterilized,
		birthDate: patient.birthDate,
		color: patient.color ?? '',
		markings: patient.markings ?? '',
		microchip: patient.microchip ?? '',
	};
}

export function PatientEditSheet({
	patient,
	open,
	onOpenChange,
	onSave,
}: PatientEditSheetProps) {
	const { data: species } = useGet<CatalogEntry[]>({
		path: '/species',
		params: { pageSize: 100 },
	});
	const { data: breeds } = useGet<CatalogEntry[]>({
		path: '/breeds',
		params: { pageSize: 100 },
	});
	const {
		register,
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<PatientGeneralDataFormValues>({
		resolver: zodResolver(patientGeneralDataFormSchema),
		defaultValues: toFormValues(patient),
	});

	useEffect(() => {
		if (open) reset(toFormValues(patient));
	}, [open, patient, reset]);

	function onSubmit(values: PatientGeneralDataFormValues) {
		onSave(values);
		toast.success('Datos del paciente actualizados');
		onOpenChange(false);
	}

	const toOptions = (entries?: CatalogEntry[]) =>
		(entries ?? []).map((entry) => ({ value: entry.name, label: entry.name }));

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="w-full overflow-y-auto sm:max-w-md">
				<SheetHeader>
					<SheetTitle>Editar datos generales</SheetTitle>
					<SheetDescription>
						Información de identificación de {patient.name}. No incluye datos
						clínicos.
					</SheetDescription>
				</SheetHeader>
				<form
					id="patient-edit-form"
					className="flex flex-col gap-4 px-4"
					onSubmit={handleSubmit(onSubmit)}
				>
					<Field data-invalid={!!errors.name}>
						<FieldLabel htmlFor="patient-name">Nombre</FieldLabel>
						<Input
							id="patient-name"
							aria-invalid={!!errors.name}
							{...register('name')}
						/>
						<FieldError errors={errors.name ? [errors.name] : undefined} />
					</Field>
					<div className="grid grid-cols-2 gap-4">
						<ClinicalSelectField
							control={control}
							name="species"
							id="patient-species"
							label="Especie"
							options={toOptions(species)}
						/>
						<ClinicalSelectField
							control={control}
							name="breed"
							id="patient-breed"
							label="Raza"
							options={toOptions(breeds)}
						/>
					</div>
					<ClinicalSelectField
						control={control}
						name="sex"
						id="patient-sex"
						label="Sexo"
						options={SEX_OPTIONS}
					/>
					<Field orientation="horizontal">
						<Controller
							name="sterilized"
							control={control}
							render={({ field }) => (
								<Switch
									id="patient-sterilized"
									checked={field.value}
									onCheckedChange={field.onChange}
								/>
							)}
						/>
						<FieldLabel htmlFor="patient-sterilized">
							Esterilizado / castrado
						</FieldLabel>
					</Field>
					<Field data-invalid={!!errors.birthDate}>
						<FieldLabel htmlFor="patient-birth-date">
							Fecha de nacimiento
						</FieldLabel>
						<Controller
							name="birthDate"
							control={control}
							render={({ field }) => (
								<DatePicker
									id="patient-birth-date"
									value={field.value}
									onChange={field.onChange}
									onBlur={field.onBlur}
								/>
							)}
						/>
						<FieldError
							errors={errors.birthDate ? [errors.birthDate] : undefined}
						/>
					</Field>
					<Field data-invalid={!!errors.color}>
						<FieldLabel htmlFor="patient-color">Color (opcional)</FieldLabel>
						<Input id="patient-color" {...register('color')} />
						<FieldError errors={errors.color ? [errors.color] : undefined} />
					</Field>
					<Field data-invalid={!!errors.markings}>
						<FieldLabel htmlFor="patient-markings">
							Señas particulares (opcional)
						</FieldLabel>
						<Textarea
							id="patient-markings"
							rows={2}
							{...register('markings')}
						/>
						<FieldError
							errors={errors.markings ? [errors.markings] : undefined}
						/>
					</Field>
					<Field data-invalid={!!errors.microchip}>
						<FieldLabel htmlFor="patient-microchip">
							Microchip / identificación (opcional)
						</FieldLabel>
						<Input id="patient-microchip" {...register('microchip')} />
						<FieldError
							errors={errors.microchip ? [errors.microchip] : undefined}
						/>
					</Field>
				</form>
				<SheetFooter>
					<Button type="submit" form="patient-edit-form">
						Guardar cambios
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
