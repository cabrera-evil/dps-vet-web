'use client';

import { ClinicalSelectField } from '@/components/clinical/clinical-select-field';
import { DatePicker } from '@/components/custom/date-picker';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
} from '@/components/ui/input-group';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { PET_SEX_OPTIONS } from '@/constants/clinical';
import { queryClient } from '@/constants/environment';
import { Permission } from '@/constants/permission';
import { useBreeds } from '@/hooks/use-breeds';
import { invalidatePatientRecord } from '@/hooks/use-patient-record';
import { usePatch, usePost } from '@/hooks/use-rest';
import { PetFormValues, petFormSchema } from '@/schemas/pet.schema';
import { Pet } from '@/types/pet.type';
import { hasPermission } from '@/utils/permission';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { ReactElement, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { PetSpeciesBreedFields } from './pet-species-breed-fields';

const DEFAULT_VALUES: PetFormValues = {
	name: '',
	species: '',
	breed: '',
	sex: '',
	sterilized: false,
	birthDate: '',
	weightKg: '',
	color: '',
	markings: '',
	microchip: '',
	notes: '',
};

type PetFormDialogProps =
	| { mode: 'create'; trigger?: ReactElement; pet?: never }
	| { mode: 'edit'; pet: Pet; trigger?: ReactElement };

export function PetFormDialog(props: PetFormDialogProps) {
	const { mode, trigger } = props;
	const [open, setOpen] = useState(false);
	const { data: session } = useSession();
	// Weight is clinical data: only staff can record the one taken at the front desk.
	const canRecordWeight =
		mode === 'create' &&
		hasPermission(session?.user?.permissions, [
			Permission.MEDICAL_RECORDS_MANAGE_ALL,
		]);
	const { mutateAsync: createPet, isPending: isCreating } = usePost();
	const { mutateAsync: updatePet, isPending: isUpdating } = usePatch();
	const form = useForm<PetFormValues>({
		resolver: zodResolver(petFormSchema),
		defaultValues: DEFAULT_VALUES,
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

	function handleOpenChange(nextOpen: boolean) {
		if (nextOpen) {
			reset(
				mode === 'edit'
					? {
							name: props.pet.name,
							species: props.pet.species,
							breed: props.pet.breed ?? '',
							sex: props.pet.sex ?? '',
							sterilized: props.pet.sterilized ?? false,
							birthDate: props.pet.birthDate.slice(0, 10),
							weightKg: '',
							color: props.pet.color ?? '',
							markings: props.pet.markings ?? '',
							microchip: props.pet.microchip ?? '',
							notes: props.pet.notes ?? '',
						}
					: DEFAULT_VALUES
			);
		}
		setOpen(nextOpen);
	}

	async function onSubmit({ weightKg, ...values }: PetFormValues) {
		if (requiresBreed && !values.breed) {
			setError('breed', { message: 'Selecciona la raza' });
			return;
		}

		try {
			if (mode === 'edit') {
				await updatePet({ path: `/pets/${props.pet.id}`, payload: values });
			} else {
				await createPet({
					path: '/pets',
					payload: {
						...values,
						weightKg:
							canRecordWeight && weightKg ? Number(weightKg) : undefined,
					},
				});
			}
		} catch {
			return;
		}

		await Promise.all([
			queryClient.invalidateQueries({ queryKey: ['/pets'] }),
			mode === 'edit' ? invalidatePatientRecord(props.pet.id) : undefined,
		]);
		toast.success(
			mode === 'edit' ? 'Mascota actualizada' : 'Mascota registrada'
		);
		setOpen(false);
	}

	const isPending = isCreating || isUpdating;

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger
				render={
					trigger ??
					(mode === 'edit' ? (
						<Button size="icon" variant="outline" aria-label="Editar mascota">
							<Pencil />
						</Button>
					) : (
						<Button>
							<Plus />
							Nueva mascota
						</Button>
					))
				}
			/>
			<DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>
						{mode === 'edit' ? 'Editar mascota' : 'Nueva mascota'}
					</DialogTitle>
					<DialogDescription>
						{mode === 'edit'
							? 'Actualiza los datos de tu mascota.'
							: 'Registra una mascota para poder agendar citas para ella.'}
					</DialogDescription>
				</DialogHeader>
				<FormProvider {...form}>
					<form
						id="pet-form"
						className="flex flex-col gap-4"
						onSubmit={handleSubmit(onSubmit)}
					>
						<Field data-invalid={!!errors.name}>
							<FieldLabel htmlFor="name">Nombre</FieldLabel>
							<Input id="name" {...register('name')} />
							<FieldError errors={errors.name ? [errors.name] : undefined} />
						</Field>
						<PetSpeciesBreedFields />
						<div className="grid grid-cols-2 gap-4">
							<ClinicalSelectField
								control={control}
								name="sex"
								id="pet-sex"
								label="Sexo (opcional)"
								options={PET_SEX_OPTIONS}
								placeholder="Sin especificar"
								clearLabel="Sin especificar"
							/>
							<Field data-invalid={!!errors.birthDate}>
								<FieldLabel htmlFor="birthDate">Fecha de nacimiento</FieldLabel>
								<Controller
									name="birthDate"
									control={control}
									render={({ field }) => (
										<DatePicker
											id="birthDate"
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
						</div>
						<Field orientation="horizontal">
							<Controller
								name="sterilized"
								control={control}
								render={({ field }) => (
									<Switch
										id="pet-sterilized"
										checked={field.value}
										onCheckedChange={field.onChange}
									/>
								)}
							/>
							<FieldLabel htmlFor="pet-sterilized">
								Esterilizado / castrado
							</FieldLabel>
						</Field>
						{canRecordWeight && (
							<Field data-invalid={!!errors.weightKg}>
								<FieldLabel htmlFor="pet-weight">Peso (opcional)</FieldLabel>
								<InputGroup>
									<InputGroupInput
										id="pet-weight"
										type="number"
										inputMode="decimal"
										min={0}
										step="0.01"
										aria-invalid={!!errors.weightKg}
										{...register('weightKg')}
									/>
									<InputGroupAddon align="inline-end">
										<InputGroupText>kg</InputGroupText>
									</InputGroupAddon>
								</InputGroup>
								<FieldDescription>
									Si ya se pesó antes de la consulta. Queda como primer registro
									del historial de peso.
								</FieldDescription>
								<FieldError
									errors={errors.weightKg ? [errors.weightKg] : undefined}
								/>
							</Field>
						)}
						<div className="grid grid-cols-2 gap-4">
							<Field data-invalid={!!errors.color}>
								<FieldLabel htmlFor="pet-color">Color (opcional)</FieldLabel>
								<Input id="pet-color" {...register('color')} />
								<FieldError
									errors={errors.color ? [errors.color] : undefined}
								/>
							</Field>
							<Field data-invalid={!!errors.microchip}>
								<FieldLabel htmlFor="pet-microchip">
									Microchip (opcional)
								</FieldLabel>
								<Input id="pet-microchip" {...register('microchip')} />
								<FieldError
									errors={errors.microchip ? [errors.microchip] : undefined}
								/>
							</Field>
						</div>
						<Field data-invalid={!!errors.markings}>
							<FieldLabel htmlFor="pet-markings">
								Señas particulares (opcional)
							</FieldLabel>
							<Textarea id="pet-markings" rows={2} {...register('markings')} />
							<FieldError
								errors={errors.markings ? [errors.markings] : undefined}
							/>
						</Field>
						<Field data-invalid={!!errors.notes}>
							<FieldLabel htmlFor="notes">Notas (opcional)</FieldLabel>
							<Textarea id="notes" {...register('notes')} />
							<FieldError errors={errors.notes ? [errors.notes] : undefined} />
						</Field>
					</form>
				</FormProvider>
				<DialogFooter>
					<Button type="submit" form="pet-form" disabled={isPending}>
						{mode === 'edit' ? 'Guardar cambios' : 'Registrar mascota'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
