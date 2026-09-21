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
import { ServiceFormValues, serviceFormSchema } from '@/schemas/service.schema';
import { Service } from '@/types/service.type';
import { hasPermission } from '@/utils/permission';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { ReactElement, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

function invalidateServices() {
	return queryClient.invalidateQueries({ queryKey: ['/services'] });
}

type ServiceFormDialogProps =
	| { mode: 'create'; trigger?: ReactElement; service?: never }
	| { mode: 'edit'; service: Service; trigger?: ReactElement };

/** Gated on `SERVICES_WRITE` — only staff/admin roles get this permission, unlike
 * pet/appointment writes which every client holds for their own records. */
export function ServiceFormDialog(props: ServiceFormDialogProps) {
	const { mode, trigger } = props;
	const { data: session } = useSession();
	const [open, setOpen] = useState(false);
	const { mutateAsync: createService, isPending: isCreating } = usePost();
	const { mutateAsync: updateService, isPending: isUpdating } = usePatch();
	const {
		register,
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<ServiceFormValues>({
		resolver: zodResolver(serviceFormSchema),
	});

	const canWrite = hasPermission(session?.user?.permissions, [
		Permission.SERVICES_WRITE,
	]);
	if (!canWrite) return null;

	function handleOpenChange(nextOpen: boolean) {
		if (nextOpen) {
			reset(
				mode === 'edit'
					? {
							name: props.service.name,
							description: props.service.description,
							category: props.service.category,
							durationMinutes: props.service.durationMinutes,
							price: props.service.price,
							active: props.service.active,
						}
					: {
							name: '',
							description: '',
							category: '',
							durationMinutes: 30,
							price: 0,
							active: true,
						}
			);
		}
		setOpen(nextOpen);
	}

	async function onSubmit(values: ServiceFormValues) {
		try {
			if (mode === 'edit') {
				await updateService({
					path: `/services/${props.service.id}`,
					payload: values,
				});
			} else {
				await createService({ path: '/services', payload: values });
			}
		} catch {
			return;
		}

		await invalidateServices();
		toast.success(mode === 'edit' ? 'Servicio actualizado' : 'Servicio creado');
		setOpen(false);
	}

	const isPending = isCreating || isUpdating;

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger
				render={
					trigger ??
					(mode === 'edit' ? (
						<Button size="icon" variant="outline" aria-label="Editar servicio">
							<Pencil />
						</Button>
					) : (
						<Button>
							<Plus />
							Nuevo servicio
						</Button>
					))
				}
			/>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{mode === 'edit' ? 'Editar servicio' : 'Nuevo servicio'}
					</DialogTitle>
					<DialogDescription>
						{mode === 'edit'
							? 'Actualiza los datos del servicio.'
							: 'Agrega un nuevo servicio al catálogo de la clínica.'}
					</DialogDescription>
				</DialogHeader>
				<form
					id="service-form"
					className="flex flex-col gap-4"
					onSubmit={handleSubmit(onSubmit)}
				>
					<Field data-invalid={!!errors.name}>
						<FieldLabel htmlFor="name">Nombre</FieldLabel>
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
						<Field data-invalid={!!errors.category}>
							<FieldLabel htmlFor="category">Categoría</FieldLabel>
							<Input id="category" {...register('category')} />
							<FieldError
								errors={errors.category ? [errors.category] : undefined}
							/>
						</Field>
						<Field data-invalid={!!errors.durationMinutes}>
							<FieldLabel htmlFor="durationMinutes">Duración (min)</FieldLabel>
							<Input
								id="durationMinutes"
								type="number"
								min={1}
								{...register('durationMinutes')}
							/>
							<FieldError
								errors={
									errors.durationMinutes ? [errors.durationMinutes] : undefined
								}
							/>
						</Field>
					</div>
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
					<Field orientation="horizontal">
						<FieldLabel htmlFor="active">Servicio activo</FieldLabel>
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
					<Button type="submit" form="service-form" disabled={isPending}>
						{mode === 'edit' ? 'Guardar cambios' : 'Crear servicio'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
