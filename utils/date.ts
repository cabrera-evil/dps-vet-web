import { CLINIC_TIME_ZONE } from '@/constants/defaults';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export function formatDate(value: string) {
	return format(parseISO(value), 'dd MMM yyyy', { locale: es });
}

/** Same output as `formatDate`, but the calendar day is the clinic's, whatever the runtime time zone. */
export function formatClinicDate(value: string) {
	const parts = new Intl.DateTimeFormat('en-CA', {
		timeZone: CLINIC_TIME_ZONE,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	}).formatToParts(new Date(value));
	const part = (type: string) =>
		Number(parts.find((item) => item.type === type)?.value);
	return format(
		new Date(part('year'), part('month') - 1, part('day')),
		'dd MMM yyyy',
		{ locale: es }
	);
}

export function formatTime(value: string) {
	return format(parseISO(value), 'h:mm a', { locale: es });
}

export function formatMonthYear(value: string) {
	return format(parseISO(value), 'MMMM yyyy', { locale: es });
}
