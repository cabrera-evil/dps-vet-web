'use client';

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
import { Textarea } from '@/components/ui/textarea';
import { queryClient } from '@/constants/environment';
import { usePatch, usePost } from '@/hooks/use-rest';
import { PetFormValues, petFormSchema } from '@/schemas/pet.schema';
import { Pet } from '@/types/pet.type';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus } from 'lucide-react';
import { ReactElement, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

function invalidatePets() {
	return queryClient.invalidateQueries({ queryKey: ['/api/pets'] });
}

type PetFormDialogProps =
	| { mode: 'create'; trigger?: ReactElement; pet?: never }
	| { mode: 'edit'; pet: Pet; trigger?: ReactElement };

export function PetFormDialog(props: PetFormDialogProps) {
	const { mode, trigger } = props;
	const [open, setOpen] = useState(false);
	const { mutateAsync: createPet, isPending: isCreating } = usePost();
	const { mutateAsync: updatePet, isPending: isUpdating } = usePatch();
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<PetFormValues>({
		resolver: zodResolver(petFormSchema),
	});

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
				await updatePet({ path: `/api/pets/${props.pet.id}`, payload: values });
			} else {
				await createPet({ path: '/api/pets', payload: values });
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
							<Input id="species" {...register('species')} />
							<FieldError
								errors={errors.species ? [errors.species] : undefined}
							/>
						</Field>
						<Field data-invalid={!!errors.breed}>
							<FieldLabel htmlFor="breed">Raza</FieldLabel>
							<Input id="breed" {...register('breed')} />
							<FieldError errors={errors.breed ? [errors.breed] : undefined} />
						</Field>
					</div>
					<Field data-invalid={!!errors.birthDate}>
						<FieldLabel htmlFor="birthDate">Fecha de nacimiento</FieldLabel>
						<Input id="birthDate" type="date" {...register('birthDate')} />
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
