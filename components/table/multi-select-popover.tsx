'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';

interface MultiSelectOption {
	label: string;
	value: number;
}

interface MultiSelectPopoverProps {
	options: MultiSelectOption[];
	value: number[];
	onChange: (value: number[]) => void;
	placeholder?: string;
}

export function MultiSelectPopover({
	options,
	value,
	onChange,
	placeholder = 'Select…',
}: MultiSelectPopoverProps) {
	const selected = new Set(value);

	return (
		<Popover>
			<PopoverTrigger
				render={
					<Button
						type="button"
						variant="outline"
						className="w-full justify-between font-normal"
					/>
				}
			>
				<span className="truncate text-left">
					{value.length > 0 ? `${value.length} selected` : placeholder}
				</span>
				<ChevronsUpDown className="text-muted-foreground" />
			</PopoverTrigger>
			<PopoverContent className="w-(--anchor-width) p-0" align="start">
				<Command>
					<CommandInput placeholder="Search…" />
					<CommandList>
						<CommandEmpty>No results found.</CommandEmpty>
						<CommandGroup>
							{options.map((option) => {
								const isSelected = selected.has(option.value);
								return (
									<CommandItem
										key={option.value}
										onSelect={() => {
											onChange(
												isSelected
													? value.filter((v) => v !== option.value)
													: [...value, option.value]
											);
										}}
									>
										<div
											className={cn(
												'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
												isSelected
													? 'bg-primary text-primary-foreground'
													: 'opacity-50 [&_svg]:invisible'
											)}
										>
											<Check />
										</div>
										{option.label}
									</CommandItem>
								);
							})}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
			{value.length > 0 && (
				<div className="flex flex-wrap gap-1 pt-1.5">
					{options
						.filter((o) => selected.has(o.value))
						.map((o) => (
							<Badge key={o.value} variant="secondary">
								{o.label}
							</Badge>
						))}
				</div>
			)}
		</Popover>
	);
}
