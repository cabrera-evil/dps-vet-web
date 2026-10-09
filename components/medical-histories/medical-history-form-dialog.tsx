'use client';

import { ClinicalSelectField } from '@/components/clinical/clinical-select-field';
import { ClinicalTextarea } from '@/components/clinical/clinical-textarea';
import { DatePicker } from '@/components/custom/date-picker';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
	MEDICAL_HISTORY_STATUS_OPTIONS,
	MEDICAL_HISTORY_TYPE_OPTIONS,
} from '@/constants/clinical';
import { MedicalHistoryStatus, MedicalHistoryType } from '@/constants/enum';
import {
	MedicalHistoryFormValues,
	medicalHistoryFormSchema,
} from '@/schemas/medical-history.schema';
import type { MedicalHistoryEntry } from '@/types/medical-history.type';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

const DEFAULT_VALUES: MedicalHistoryFormValues = {
	type: MedicalHistoryType.MEDICAL,
	name: '',
	approximateDate: '',
	status: MedicalHistoryStatus.ACTIVE,
	description: '',
	isAlert: false,
};

type MedicalHistoryFormDialogProps = {
	onSave: (values: MedicalHistoryFormValues, id?: string) => void;
} & (
	| { mode: 'create'; entry?: never }
	| { mode: 'edit'; entry: MedicalHistoryEntry }
);

export function MedicalHistoryFormDialog(props: MedicalHistoryFormDialogProps) {
	const { mode, onSave } = props;
	const [open, setOpen] = useState(false);
	const {
		register,
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<MedicalHistoryFormValues>({
		resolver: zodResolver(medicalHistoryFormSchema),
		defaultValues: DEFAULT_VALUES,
	});

	function handleOpenChange(nextOpen: boolean) {
		if (nextOpen) {
			reset(
				mode === 'edit'
					? {
							type: props.entry.type,
							name: props.entry.name,
							approximateDate: props.entry.approximateDate ?? '',
							status: props.entry.status,
							description: props.entry.description ?? '',
							isAlert: props.entry.isAlert,
						}
					: DEFAULT_VALUES
			);
		}
		setOpen(nextOpen);
	}

	function onSubmit(values: MedicalHistoryFormValues) {
		onSave(values, mode === 'edit' ? props.entry.id : undefined);
		toast.success(
			mode === 'edit' ? 'Antecedente actualizado' : 'Antecedente agregado'
		);
		setOpen(false);
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger
				render={
					mode === 'edit' ? (
						<Button
							size="icon-sm"
							variant="ghost"
							aria-label={`Editar antecedente ${props.entry.name}`}
						>
							<Pencil />
						</Button>
					) : (
						<Button>
							<Plus />
							Agregar antecedente
						</Button>
					)
				}
			/>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{mode === 'edit' ? 'Editar antecedente' : 'Agregar antecedente'}
					</DialogTitle>
					<DialogDescription>
						Los antecedentes pertenecen al paciente y se conservan entre
						consultas.
					</DialogDescription>
				</DialogHeader>
				<form
					id="medical-history-form"
					className="flex flex-col gap-4"
					onSubmit={handleSubmit(onSubmit)}
				>
					<div className="grid grid-cols-2 gap-4">
						<ClinicalSelectField
							control={control}
							name="type"
							label="Tipo"
							options={MEDICAL_HISTORY_TYPE_OPTIONS}
						/>
						<ClinicalSelectField
							control={control}
							name="status"
							label="Estado"
							options={MEDICAL_HISTORY_STATUS_OPTIONS}
						/>
					</div>
					<Field data-invalid={!!errors.name}>
						<FieldLabel htmlFor="history-name">Nombre o condición</FieldLabel>
						<Input
							id="history-name"
							aria-invalid={!!errors.name}
							{...register('name')}
						/>
						<FieldError errors={errors.name ? [errors.name] : undefined} />
					</Field>
					<Field data-invalid={!!errors.approximateDate}>
						<FieldLabel htmlFor="history-date">
							Fecha aproximada (opcional)
						</FieldLabel>
						<Controller
							name="approximateDate"
							control={control}
							render={({ field }) => (
								<DatePicker
									id="history-date"
									value={field.value}
									onChange={field.onChange}
									onBlur={field.onBlur}
									placeholder="Fecha desconocida"
								/>
							)}
						/>
						<FieldError
							errors={
								errors.approximateDate ? [errors.approximateDate] : undefined
							}
						/>
					</Field>
					<ClinicalTextarea
						id="history-description"
						label="Descripción (opcional)"
						help="Evolución, episodios o detalles relevantes para futuras consultas."
						error={errors.description}
						{...register('description')}
					/>
					<Field orientation="horizontal">
						<Controller
							name="isAlert"
							control={control}
							render={({ field }) => (
								<Checkbox
									id="history-alert"
									checked={field.value}
									onCheckedChange={field.onChange}
								/>
							)}
						/>
						<FieldLabel htmlFor="history-alert">
							Relevante: mostrar como alerta en el expediente
						</FieldLabel>
					</Field>
				</form>
				<DialogFooter>
					<Button type="submit" form="medical-history-form">
						{mode === 'edit' ? 'Guardar cambios' : 'Agregar antecedente'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
