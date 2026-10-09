import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export function formatDate(value: string) {
	return format(parseISO(value), 'dd MMM yyyy', { locale: es });
}

export function formatTime(value: string) {
	return format(parseISO(value), 'h:mm a', { locale: es });
}

export function formatMonthYear(value: string) {
	return format(parseISO(value), 'MMMM yyyy', { locale: es });
}
