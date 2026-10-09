'use client';

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
import { ChevronsUpDown, PencilLine } from 'lucide-react';
import { useState } from 'react';

interface DiagnosisComboboxProps {
	id: string;
	value: string;
	onChange: (value: string) => void;
	catalog: string[];
	invalid?: boolean;
}

/** Catalog search that also accepts a manually typed diagnosis. */
export function DiagnosisCombobox({
	id,
	value,
	onChange,
	catalog,
	invalid,
}: DiagnosisComboboxProps) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState('');
	const typed = search.trim();
	const hasExactMatch = catalog.some(
		(item) => item.toLowerCase() === typed.toLowerCase()
	);

	function select(next: string) {
		onChange(next);
		setSearch('');
		setOpen(false);
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger
				render={
					<Button
						id={id}
						type="button"
						variant="outline"
						role="combobox"
						aria-expanded={open}
						aria-invalid={invalid}
						className={cn(
							'w-full justify-between font-normal',
							!value && 'text-muted-foreground'
						)}
					>
						<span className="truncate">
							{value || 'Busca o escribe un diagnóstico'}
						</span>
						<ChevronsUpDown className="text-muted-foreground" />
					</Button>
				}
			/>
			<PopoverContent align="start" className="w-(--anchor-width) p-0">
				<Command>
					<CommandInput
						value={search}
						onValueChange={setSearch}
						placeholder="Buscar en el catálogo..."
					/>
					<CommandList>
						<CommandEmpty>Sin coincidencias en el catálogo.</CommandEmpty>
						<CommandGroup>
							{typed && !hasExactMatch && (
								<CommandItem
									forceMount
									value={`manual-${typed}`}
									onSelect={() => select(typed)}
								>
									<PencilLine />
									Usar «{typed}» como diagnóstico manual
								</CommandItem>
							)}
							{catalog.map((item) => (
								<CommandItem
									key={item}
									value={item}
									data-checked={item === value}
									onSelect={() => select(item)}
								>
									{item}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
