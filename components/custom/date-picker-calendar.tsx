'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import {
	addMonths,
	addYears,
	format,
	setMonth,
	setYear,
	startOfMonth,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const YEARS_PER_PAGE = 12;

type CalendarView = 'days' | 'months' | 'years';

interface DatePickerCalendarProps {
	selected?: Date;
	onSelect: (date: Date | undefined) => void;
}

interface PickerHeaderProps {
	previousLabel: string;
	onPrevious: () => void;
	nextLabel: string;
	onNext: () => void;
	children: React.ReactNode;
}

interface PickerGridProps {
	values: readonly number[];
	activeValue: number;
	formatValue: (value: number) => string;
	onSelect: (value: number) => void;
}

function getYearPageStart(year: number) {
	return Math.floor(year / YEARS_PER_PAGE) * YEARS_PER_PAGE;
}

function PickerHeader({
	previousLabel,
	onPrevious,
	nextLabel,
	onNext,
	children,
}: PickerHeaderProps) {
	return (
		<div className="flex items-center justify-between px-2 pt-2">
			<Button
				type="button"
				variant="ghost"
				size="icon-sm"
				onClick={onPrevious}
				aria-label={previousLabel}
			>
				<ChevronLeft />
			</Button>
			{children}
			<Button
				type="button"
				variant="ghost"
				size="icon-sm"
				onClick={onNext}
				aria-label={nextLabel}
			>
				<ChevronRight />
			</Button>
		</div>
	);
}

function PickerGrid({
	values,
	activeValue,
	formatValue,
	onSelect,
}: PickerGridProps) {
	return (
		<div className="grid flex-1 auto-rows-fr grid-cols-3 gap-1 p-3">
			{values.map((value) => (
				<Button
					key={value}
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => onSelect(value)}
					aria-pressed={activeValue === value}
					className={cn(
						'h-full justify-center capitalize',
						activeValue === value && 'bg-muted'
					)}
				>
					{formatValue(value)}
				</Button>
			))}
		</div>
	);
}

export function DatePickerCalendar({
	selected,
	onSelect,
}: DatePickerCalendarProps) {
	const initialMonth = startOfMonth(selected ?? new Date());
	const [view, setView] = useState<CalendarView>('days');
	const [displayMonth, setDisplayMonth] = useState(initialMonth);
	const [yearPageStart, setYearPageStart] = useState(() =>
		getYearPageStart(initialMonth.getFullYear())
	);

	if (view === 'years') {
		const years = Array.from(
			{ length: YEARS_PER_PAGE },
			(_, index) => yearPageStart + index
		);

		return (
			<div className="flex h-60.5 w-54 flex-col">
				<PickerHeader
					previousLabel="Mostrar años anteriores"
					onPrevious={() => setYearPageStart((year) => year - YEARS_PER_PAGE)}
					nextLabel="Mostrar años siguientes"
					onNext={() => setYearPageStart((year) => year + YEARS_PER_PAGE)}
				>
					<span className="text-sm font-medium">
						{yearPageStart}–{yearPageStart + YEARS_PER_PAGE - 1}
					</span>
				</PickerHeader>
				<PickerGrid
					values={years}
					activeValue={displayMonth.getFullYear()}
					formatValue={String}
					onSelect={(year) => {
						setDisplayMonth((month) => startOfMonth(setYear(month, year)));
						setView('months');
					}}
				/>
			</div>
		);
	}

	if (view === 'months') {
		const months = Array.from({ length: 12 }, (_, month) => month);

		return (
			<div className="flex h-60.5 w-54 flex-col">
				<PickerHeader
					previousLabel="Mostrar año anterior"
					onPrevious={() => setDisplayMonth((month) => addYears(month, -1))}
					nextLabel="Mostrar año siguiente"
					onNext={() => setDisplayMonth((month) => addYears(month, 1))}
				>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => setView('years')}
					>
						{format(displayMonth, 'yyyy')}
					</Button>
				</PickerHeader>
				<PickerGrid
					values={months}
					activeValue={displayMonth.getMonth()}
					formatValue={(month) =>
						format(setMonth(displayMonth, month), 'MMM', { locale: es })
					}
					onSelect={(month) => {
						setDisplayMonth((date) => setMonth(date, month));
						setView('days');
					}}
				/>
			</div>
		);
	}

	return (
		<div className="flex h-60.5 w-54 flex-col">
			<PickerHeader
				previousLabel="Mostrar mes anterior"
				onPrevious={() => setDisplayMonth((month) => addMonths(month, -1))}
				nextLabel="Mostrar mes siguiente"
				onNext={() => setDisplayMonth((month) => addMonths(month, 1))}
			>
				<div className="flex items-center">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => setView('months')}
					>
						{format(displayMonth, 'MMMM', { locale: es })}
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => setView('years')}
					>
						{format(displayMonth, 'yyyy')}
					</Button>
				</div>
			</PickerHeader>
			<Calendar
				mode="single"
				month={displayMonth}
				onMonthChange={setDisplayMonth}
				selected={selected}
				locale={es}
				className="w-full pt-0"
				classNames={{
					nav: 'hidden',
					month_caption: 'hidden',
				}}
				onSelect={onSelect}
			/>
		</div>
	);
}
