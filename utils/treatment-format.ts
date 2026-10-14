import {
	ADMINISTRATION_CONTEXT_LABEL,
	ADMINISTRATION_ROUTE_SHORT_LABEL,
	DOSE_UNIT_LABEL,
	DURATION_UNIT_LABEL,
} from '@/constants/treatment';
import type { MedicationOrder } from '@/types/treatment.type';
import { formatDate, formatTime } from '@/utils/date';
import { isToday, isTomorrow, parseISO } from 'date-fns';

export const formatDose = (order: Pick<MedicationOrder, 'dose' | 'doseUnit'>) =>
	`${order.dose} ${DOSE_UNIT_LABEL[order.doseUnit]}`;

export const formatFrequency = (frequencyHours?: number) =>
	frequencyHours ? `Cada ${frequencyHours} h` : 'Según necesidad';

export const formatDuration = (
	order: Pick<MedicationOrder, 'durationValue' | 'durationUnit'>
) => `${order.durationValue} ${DURATION_UNIT_LABEL[order.durationUnit]}`;

/** One scannable line: "500 mg · IM · Cada 24 h · 5 días · En clínica". */
export function formatOrderLine(order: MedicationOrder): string {
	return [
		formatDose(order),
		ADMINISTRATION_ROUTE_SHORT_LABEL[order.route],
		formatFrequency(order.frequencyHours),
		formatDuration(order),
		ADMINISTRATION_CONTEXT_LABEL[order.context],
	].join(' · ');
}

/** "Hoy · 10:00 a. m.", "Mañana · …" or "10 oct 2026 · …". */
export function formatScheduledAt(value: string): string {
	const date = parseISO(value);
	const day = isToday(date)
		? 'Hoy'
		: isTomorrow(date)
			? 'Mañana'
			: formatDate(value);
	return `${day} · ${formatTime(value)}`;
}
