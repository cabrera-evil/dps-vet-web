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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { queryClient } from '@/constants/environment';
import { Permission } from '@/constants/permission';
import { usePatch, usePost } from '@/hooks/use-rest';
import {
	MedicationFormValues,
	medicationFormSchema,
} from '@/schemas/medication.schema';
import { Medication } from '@/types/medication.type';
import { hasPermission } from '@/utils/permission';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

const DEFAULT_VALUES: MedicationFormValues = {
	name: '',
	description: '',
	stock: 0,
	price: 0,
	active: true,
};

type MedicationFormDialogProps =
	| { mode: 'create'; medication?: never }
	| { mode: 'edit'; medication: Medication };

export function MedicationFormDialog(props: MedicationFormDialogProps) {
	const { mode } = props;
	const { data: session } = useSession();
	const [open, setOpen] = useState(false);
	const { mutateAsync: createMedication, isPending: isCreating } = usePost();
	const { mutateAsync: updateMedication, isPending: isUpdating } = usePatch();
	const {
		register,
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<MedicationFormValues>({
		resolver: zodResolver(medicationFormSchema),
		defaultValues: DEFAULT_VALUES,
	});

	const canWrite = hasPermission(session?.user?.permissions, [
		Permission.MEDICATIONS_WRITE,
	]);
	if (!canWrite) return null;

	function handleOpenChange(nextOpen: boolean) {
		if (nextOpen) {
			reset(
				mode === 'edit'
					? {
							name: props.medication.name,
							description: props.medication.description,
							stock: props.medication.stock,
							price: props.medication.price,
							active: props.medication.active,
						}
					: DEFAULT_VALUES
			);
		}
		setOpen(nextOpen);
	}

	async function onSubmit(values: MedicationFormValues) {
		try {
			if (mode === 'edit') {
				await updateMedication({
					path: `/medications/${props.medication.id}`,
					payload: values,
				});
			} else {
				await createMedication({ path: '/medications', payload: values });
			}
		} catch {
			return;
		}

		await queryClient.invalidateQueries({ queryKey: ['/medications'] });
		toast.success(
			mode === 'edit' ? 'Medicamento actualizado' : 'Medicamento creado'
		);
		setOpen(false);
	}

	const isPending = isCreating || isUpdating;

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger
				render={
					mode === 'edit' ? (
						<Button
							size="icon"
							variant="outline"
							aria-label="Editar medicamento"
						>
							<Pencil />
						</Button>
					) : (
						<Button>
							<Plus />
							Nuevo medicamento
						</Button>
					)
				}
			/>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{mode === 'edit' ? 'Editar medicamento' : 'Nuevo medicamento'}
					</DialogTitle>
					<DialogDescription>
						{mode === 'edit'
							? 'Actualiza los datos del medicamento.'
							: 'Agrega un medicamento al inventario de la clínica.'}
					</DialogDescription>
				</DialogHeader>
				<form
					id="medication-form"
					className="flex flex-col gap-4"
					onSubmit={handleSubmit(onSubmit)}
				>
					<Field data-invalid={!!errors.name}>
						<FieldLabel htmlFor="name">Medicamento</FieldLabel>
						<Input id="name" {...register('name')} />
						<FieldError errors={errors.name ? [errors.name] : undefined} />
					</Field>
					<Field data-invalid={!!errors.description}>
						<FieldLabel htmlFor="description">Descripción</FieldLabel>
						<Textarea id="description" {...register('description')} />
						<FieldError
							errors={errors.description ? [errors.description] : undefined}
						/>
					</Field>
					<div className="grid grid-cols-2 gap-4">
						<Field data-invalid={!!errors.stock}>
							<FieldLabel htmlFor="stock">Stock</FieldLabel>
							<Input
								id="stock"
								type="number"
								min={0}
								step={1}
								{...register('stock')}
							/>
							<FieldError errors={errors.stock ? [errors.stock] : undefined} />
						</Field>
						<Field data-invalid={!!errors.price}>
							<FieldLabel htmlFor="price">Precio (USD)</FieldLabel>
							<Input
								id="price"
								type="number"
								min={0}
								step="0.01"
								{...register('price')}
							/>
							<FieldError errors={errors.price ? [errors.price] : undefined} />
						</Field>
					</div>
					<Field orientation="horizontal">
						<FieldLabel htmlFor="active">Medicamento activo</FieldLabel>
						<Controller
							name="active"
							control={control}
							render={({ field }) => (
								<Switch
									id="active"
									checked={field.value}
									onCheckedChange={field.onChange}
								/>
							)}
						/>
					</Field>
				</form>
				<DialogFooter>
					<Button type="submit" form="medication-form" disabled={isPending}>
						{mode === 'edit' ? 'Guardar cambios' : 'Crear medicamento'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
