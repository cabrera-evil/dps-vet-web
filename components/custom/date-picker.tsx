'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';

interface DatePickerProps {
	id?: string;
	value?: string;
	onChange: (value: string) => void;
	onBlur?: () => void;
	disabled?: boolean;
	placeholder?: string;
}

/**
 * Project fork of `components/ui/calendar` for form date fields — that
 * component is only the calendar grid, with no trigger/input of its own, so
 * this wraps it in a `Popover` + `Button` instead of falling back to the
 * native `<input type="date">`. Stores/emits plain `yyyy-MM-dd` strings so it
 * drops into the existing string-typed Zod schemas unchanged.
 */
export function DatePicker({
	id,
	value,
	onChange,
	onBlur,
	disabled,
	placeholder = 'Selecciona una fecha',
}: DatePickerProps) {
	const [open, setOpen] = useState(false);
	const selected = value ? parseISO(value) : undefined;

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger
				render={
					<Button
						id={id}
						type="button"
						variant="outline"
						disabled={disabled}
						onBlur={onBlur}
						className={cn(
							'w-full justify-start font-normal',
							!selected && 'text-muted-foreground'
						)}
					>
						<CalendarIcon />
						{selected ? format(selected, 'dd/MM/yyyy') : placeholder}
					</Button>
				}
			/>
			<PopoverContent className="w-auto p-0">
				<Calendar
					mode="single"
					selected={selected}
					defaultMonth={selected}
					onSelect={(date) => {
						onChange(date ? format(date, 'yyyy-MM-dd') : '');
						setOpen(false);
					}}
				/>
			</PopoverContent>
		</Popover>
	);
}
