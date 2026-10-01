'use client';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Laptop, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const THEME_OPTIONS = [
	{ value: 'light', label: 'Claro', icon: Sun },
	{ value: 'dark', label: 'Oscuro', icon: Moon },
	{ value: 'system', label: 'Sistema', icon: Laptop },
] as const;

interface ThemeToggleProps {
	className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button
						variant="ghost"
						size="icon"
						className={className}
						aria-label="Cambiar tema"
					/>
				}
			>
				{mounted && theme === 'dark' ? (
					<Moon />
				) : mounted && theme === 'light' ? (
					<Sun />
				) : (
					<Laptop />
				)}
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
					<DropdownMenuItem
						key={value}
						onClick={() => setTheme(value)}
						className={
							theme === value ? 'bg-accent text-accent-foreground' : ''
						}
					>
						<Icon />
						{label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
