'use client';

import { AdministrationContext } from '@/constants/enum';
import { PRN_FREQUENCY } from '@/constants/treatment';
import type { ConsultationFormValues } from '@/schemas/consultation.schema';
import { formatDate } from '@/utils/date';
import {
	addInterval,
	countClinicApplications,
	getEndDate,
	resolveFrequencyHours,
} from '@/utils/treatment';
import { formatScheduledAt } from '@/utils/treatment-format';
import { CalendarClock } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';

const PREVIEW_LIMIT = 10;

interface SchedulePreviewProps {
	treatmentIndex: number;
	index: number;
}

function PreviewBody({
	values,
}: {
	values: ConsultationFormValues['treatments'][number]['medications'][number];
}) {
	const startsAt = new Date(`${values.startDate}T${values.startTime}`);
	const durationValue = Number(values.durationValue);
	const frequencyHours = resolveFrequencyHours(values);
	const isPrn = values.frequency === PRN_FREQUENCY;

	if (
		Number.isNaN(startsAt.getTime()) ||
		!Number.isInteger(durationValue) ||
		durationValue < 1 ||
		(!frequencyHours && !isPrn)
	)
		return (
			<p className="text-muted-foreground">
				Completa frecuencia, duración e inicio para ver la programación.
			</p>
		);

	const order = {
		frequencyHours,
		durationValue,
		durationUnit: values.durationUnit,
		context: values.context,
	};

	if (isPrn) return <p>Sin horario fijo</p>;

	if (values.context !== AdministrationContext.CLINIC)
		return (
			<p>Finaliza {formatDate(getEndDate(startsAt, order).toISOString())}</p>
		);

	const total = countClinicApplications(order);
	if (!frequencyHours || !total)
		return (
			<p className="text-muted-foreground">
				La duración es menor que el intervalo entre dosis.
			</p>
		);
	const dateAt = (position: number) =>
		addInterval(startsAt, position * frequencyHours);
	const shown = Array.from({ length: Math.min(total, PREVIEW_LIMIT) }, (_, i) =>
		dateAt(i)
	);
	const hidden = total - shown.length;

	return (
		<div className="flex flex-col gap-2">
			<p>El propietario debe traer a la mascota en estas fechas.</p>
			<ol className="flex flex-col gap-1">
				{shown.map((date, position) => (
					<li key={date.toISOString()} className="flex flex-wrap gap-x-2">
						<span className="tabular-nums">{position + 1}.</span>
						<span>{formatScheduledAt(date.toISOString())}</span>
						{position === 0 && values.firstDoseInConsultation && (
							<span className="font-medium">· Aplicada en esta consulta</span>
						)}
					</li>
				))}
			</ol>
			{hidden > 0 && (
				<p className="text-muted-foreground">
					y {hidden} más, hasta {formatDate(dateAt(total - 1).toISOString())}.
				</p>
			)}
		</div>
	);
}

export function SchedulePreview({
	treatmentIndex,
	index,
}: SchedulePreviewProps) {
	const { control } = useFormContext<ConsultationFormValues>();
	const values = useWatch({
		control,
		name: `treatments.${treatmentIndex}.medications.${index}`,
	});

	return (
		<div className="flex flex-col gap-2 rounded-lg bg-muted/50 p-3 text-sm">
			<h5 className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
				<CalendarClock className="size-3.5" aria-hidden="true" />
				Programación
			</h5>
			{values && <PreviewBody values={values} />}
		</div>
	);
}
