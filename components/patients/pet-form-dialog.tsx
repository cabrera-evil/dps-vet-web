'use client';

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
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { queryClient } from '@/constants/environment';
import { useGet, usePatch, usePost } from '@/hooks/use-rest';
import { PetFormValues, petFormSchema } from '@/schemas/pet.schema';
import { CatalogEntry } from '@/types/catalog.type';
import { Pet } from '@/types/pet.type';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus } from 'lucide-react';
import { ReactElement, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

function invalidatePets() {
	return queryClient.invalidateQueries({ queryKey: ['/pets'] });
}

type PetFormDialogProps =
	| { mode: 'create'; trigger?: ReactElement; pet?: never }
	| { mode: 'edit'; pet: Pet; trigger?: ReactElement };

export function PetFormDialog(props: PetFormDialogProps) {
	const { mode, trigger } = props;
	const [open, setOpen] = useState(false);
	const { data: species, isLoading: isLoadingSpecies } = useGet<CatalogEntry[]>(
		{ path: '/species', params: { pageSize: 100 } }
	);
	const { data: breeds, isLoading: isLoadingBreeds } = useGet<CatalogEntry[]>({
		path: '/breeds',
		params: { pageSize: 100 },
	});
	const { mutateAsync: createPet, isPending: isCreating } = usePost();
	const { mutateAsync: updatePet, isPending: isUpdating } = usePatch();
	const {
		register,
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<PetFormValues>({
		resolver: zodResolver(petFormSchema),
		defaultValues: {
			name: '',
			species: '',
			breed: '',
			birthDate: '',
			notes: '',
		},
	});

	const speciesItems = Object.fromEntries(
		(species ?? []).map((entry) => [entry.name, entry.name])
	);
	const breedItems = Object.fromEntries(
		(breeds ?? []).map((entry) => [entry.name, entry.name])
	);

	function handleOpenChange(nextOpen: boolean) {
		if (nextOpen) {
			reset(
				mode === 'edit'
					? {
							name: props.pet.name,
							species: props.pet.species,
							breed: props.pet.breed,
							birthDate: props.pet.birthDate.slice(0, 10),
							notes: props.pet.notes ?? '',
						}
					: { name: '', species: '', breed: '', birthDate: '', notes: '' }
			);
		}
		setOpen(nextOpen);
	}

	async function onSubmit(values: PetFormValues) {
		try {
			if (mode === 'edit') {
				await updatePet({ path: `/pets/${props.pet.id}`, payload: values });
			} else {
				await createPet({ path: '/pets', payload: values });
			}
		} catch {
			return;
		}

		await invalidatePets();
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
			<DialogContent>
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
					<div className="grid grid-cols-2 gap-4">
						<Field data-invalid={!!errors.species}>
							<FieldLabel htmlFor="species">Especie</FieldLabel>
							<Controller
								name="species"
								control={control}
								render={({ field }) => (
									<Select
										items={speciesItems}
										value={field.value}
										onValueChange={field.onChange}
										disabled={isLoadingSpecies}
									>
										<SelectTrigger id="species" className="w-full">
											<SelectValue placeholder="Selecciona la especie" />
										</SelectTrigger>
										<SelectContent>
											{species?.map((entry) => (
												<SelectItem key={entry.id} value={entry.name}>
													{entry.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							/>
							<FieldError
								errors={errors.species ? [errors.species] : undefined}
							/>
						</Field>
						<Field data-invalid={!!errors.breed}>
							<FieldLabel htmlFor="breed">Raza</FieldLabel>
							<Controller
								name="breed"
								control={control}
								render={({ field }) => (
									<Select
										items={breedItems}
										value={field.value}
										onValueChange={field.onChange}
										disabled={isLoadingBreeds}
									>
										<SelectTrigger id="breed" className="w-full">
											<SelectValue placeholder="Selecciona la raza" />
										</SelectTrigger>
										<SelectContent>
											{breeds?.map((entry) => (
												<SelectItem key={entry.id} value={entry.name}>
													{entry.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							/>
							<FieldError errors={errors.breed ? [errors.breed] : undefined} />
						</Field>
					</div>
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
					<Field data-invalid={!!errors.notes}>
						<FieldLabel htmlFor="notes">Notas (opcional)</FieldLabel>
						<Textarea id="notes" {...register('notes')} />
						<FieldError errors={errors.notes ? [errors.notes] : undefined} />
					</Field>
				</form>
				<DialogFooter>
					<Button type="submit" form="pet-form" disabled={isPending}>
						{mode === 'edit' ? 'Guardar cambios' : 'Registrar mascota'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
