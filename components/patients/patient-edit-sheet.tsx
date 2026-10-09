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
import { PET_SEX_OPTIONS } from '@/constants/clinical';
import { queryClient } from '@/constants/environment';
import { useBreeds } from '@/hooks/use-breeds';
import { invalidatePatientRecord } from '@/hooks/use-patient-record';
import { usePatch } from '@/hooks/use-rest';
import {
	PatientGeneralDataFormValues,
	patientGeneralDataFormSchema,
} from '@/schemas/patient-record.schema';
import type { PatientIdentity } from '@/types/patient-record.type';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { PetSpeciesBreedFields } from './pet-species-breed-fields';

interface PatientEditSheetProps {
	patient: PatientIdentity;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

function toFormValues(patient: PatientIdentity): PatientGeneralDataFormValues {
	return {
		name: patient.name,
		species: patient.species,
		breed: patient.breed ?? '',
		sex: patient.sex ?? '',
		sterilized: patient.sterilized ?? false,
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
}: PatientEditSheetProps) {
	const { mutateAsync: updatePet, isPending } = usePatch();
	const form = useForm<PatientGeneralDataFormValues>({
		resolver: zodResolver(patientGeneralDataFormSchema),
		defaultValues: toFormValues(patient),
	});
	const {
		register,
		control,
		handleSubmit,
		reset,
		setError,
		formState: { errors },
	} = form;
	const species = useWatch({ control, name: 'species' });
	const { requiresBreed } = useBreeds(species);

	useEffect(() => {
		if (open) reset(toFormValues(patient));
	}, [open, patient, reset]);

	async function onSubmit(values: PatientGeneralDataFormValues) {
		if (requiresBreed && !values.breed) {
			setError('breed', { message: 'Selecciona la raza' });
			return;
		}
		try {
			await updatePet({ path: `/pets/${patient.id}`, payload: values });
		} catch {
			return;
		}
		await Promise.all([
			queryClient.invalidateQueries({ queryKey: ['/pets'] }),
			invalidatePatientRecord(patient.id),
		]);
		toast.success('Datos del paciente actualizados');
		onOpenChange(false);
	}

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
				<FormProvider {...form}>
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
						<PetSpeciesBreedFields />
						<ClinicalSelectField
							control={control}
							name="sex"
							id="patient-sex"
							label="Sexo"
							options={PET_SEX_OPTIONS}
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
				</FormProvider>
				<SheetFooter>
					<Button type="submit" form="patient-edit-form" disabled={isPending}>
						Guardar cambios
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
