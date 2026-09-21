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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { queryClient } from '@/constants/environment';
import { useGet, usePost } from '@/hooks/use-rest';
import {
	AppointmentFormValues,
	appointmentFormSchema,
} from '@/schemas/appointment.schema';
import { AppointmentPet, AppointmentService } from '@/types/appointment.type';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { ReactElement, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

export function AppointmentFormDialog({ trigger }: { trigger?: ReactElement }) {
	const [open, setOpen] = useState(false);
	const { data: pets, isLoading: isLoadingPets } = useGet<AppointmentPet[]>({
		path: '/pets',
		params: { pageSize: 100 },
	});
	const { data: services, isLoading: isLoadingServices } = useGet<
		AppointmentService[]
	>({
		path: '/services',
		params: { pageSize: 100, active: 'true' },
	});
	const { mutateAsync: createAppointment, isPending } = usePost();
	const {
		register,
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<AppointmentFormValues>({
		resolver: zodResolver(appointmentFormSchema),
		defaultValues: { petId: '', serviceId: '', date: '', time: '' },
	});

	async function onSubmit(values: AppointmentFormValues) {
		const start = new Date(`${values.date}T${values.time}`);
		if (Number.isNaN(start.getTime())) return;

		try {
			await createAppointment({
				path: '/appointments',
				payload: {
					petId: values.petId,
					serviceId: values.serviceId,
					start: start.toISOString(),
				},
			});
		} catch {
			return;
		}

		await queryClient.invalidateQueries({ queryKey: ['/appointments'] });
		toast.success('Cita solicitada', {
			description: 'Te avisaremos cuando sea confirmada.',
		});
		reset();
		setOpen(false);
	}

	const hasNoPets = !isLoadingPets && !pets?.length;

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger
				render={
					trigger ?? (
						<Button>
							<Plus />
							Nueva cita
						</Button>
					)
				}
			/>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Nueva cita</DialogTitle>
					<DialogDescription>
						Agenda una cita para una de tus mascotas.
					</DialogDescription>
				</DialogHeader>
				{hasNoPets ? (
					<p className="text-sm text-muted-foreground">
						No tienes mascotas registradas. Agrega una mascota antes de
						solicitar una cita.
					</p>
				) : (
					<form
						id="appointment-form"
						className="flex flex-col gap-4"
						onSubmit={handleSubmit(onSubmit)}
					>
						<Field data-invalid={!!errors.petId}>
							<FieldLabel htmlFor="petId">Mascota</FieldLabel>
							<Controller
								name="petId"
								control={control}
								render={({ field }) => (
									<Select
										value={field.value}
										onValueChange={field.onChange}
										disabled={isLoadingPets}
									>
										<SelectTrigger id="petId" className="w-full">
											<SelectValue placeholder="Selecciona una mascota" />
										</SelectTrigger>
										<SelectContent>
											{pets?.map((pet) => (
												<SelectItem key={pet.id} value={pet.id}>
													{pet.name} ({pet.species})
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							/>
							<FieldError errors={errors.petId ? [errors.petId] : undefined} />
						</Field>
						<Field data-invalid={!!errors.serviceId}>
							<FieldLabel htmlFor="serviceId">Servicio</FieldLabel>
							<Controller
								name="serviceId"
								control={control}
								render={({ field }) => (
									<Select
										value={field.value}
										onValueChange={field.onChange}
										disabled={isLoadingServices}
									>
										<SelectTrigger id="serviceId" className="w-full">
											<SelectValue placeholder="Selecciona un servicio" />
										</SelectTrigger>
										<SelectContent>
											{services?.map((service) => (
												<SelectItem key={service.id} value={service.id}>
													{service.name} ({service.durationMinutes} min)
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							/>
							<FieldError
								errors={errors.serviceId ? [errors.serviceId] : undefined}
							/>
						</Field>
						<div className="grid grid-cols-2 gap-4">
							<Field data-invalid={!!errors.date}>
								<FieldLabel htmlFor="date">Fecha</FieldLabel>
								<Input id="date" type="date" {...register('date')} />
								<FieldError errors={errors.date ? [errors.date] : undefined} />
							</Field>
							<Field data-invalid={!!errors.time}>
								<FieldLabel htmlFor="time">Hora</FieldLabel>
								<Input id="time" type="time" {...register('time')} />
								<FieldError errors={errors.time ? [errors.time] : undefined} />
							</Field>
						</div>
					</form>
				)}
				<DialogFooter>
					<Button
						type="submit"
						form="appointment-form"
						disabled={isPending || hasNoPets}
					>
						Solicitar cita
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
