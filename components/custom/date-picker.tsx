'use client';

import { DatePickerCalendar } from '@/components/custom/date-picker-calendar';
import { Button } from '@/components/ui/button';
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

export function DatePicker({
	id,
	value,
	onChange,
	onBlur,
	disabled,
	placeholder = 'Selecciona una fecha',
}: DatePickerProps) {
	const [open, setOpen] = useState(false);
	const [calendarKey, setCalendarKey] = useState(0);
	const selected = value ? parseISO(value) : undefined;

	return (
		<Popover
			open={open}
			onOpenChange={(nextOpen) => {
				if (nextOpen) setCalendarKey((key) => key + 1);
				setOpen(nextOpen);
			}}
		>
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
			<PopoverContent className="w-auto gap-0 p-0">
				<DatePickerCalendar
					key={calendarKey}
					selected={selected}
					onSelect={(date) => {
						onChange(date ? format(date, 'yyyy-MM-dd') : '');
						setOpen(false);
					}}
				/>
			</PopoverContent>
		</Popover>
	);
}
