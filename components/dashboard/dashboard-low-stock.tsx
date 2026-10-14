'use client';

import { Badge } from '@/components/ui/badge';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLowStock } from '@/hooks/use-low-stock';
import { Pill } from 'lucide-react';

const SKELETON_ROWS = 3;

export function DashboardLowStock() {
	const { items, isLoading, isError } = useLowStock();

	return (
		<Card>
			<CardHeader>
				<CardTitle>Farmacia crítica</CardTitle>
				<CardDescription>Medicamentos por reabastecer</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-3">
				{isLoading &&
					Array.from({ length: SKELETON_ROWS }).map((_, index) => (
						<Skeleton key={index} className="h-8 w-full" />
					))}
				{!isLoading && isError && (
					<p className="text-sm text-muted-foreground">No se pudo cargar.</p>
				)}
				{!isLoading && !isError && items.length === 0 && (
					<p className="text-sm text-muted-foreground">
						No hay medicamentos por reabastecer.
					</p>
				)}
				{items.map((medication) => (
					<div
						key={medication.id}
						className="flex items-center justify-between gap-3"
					>
						<div className="flex items-center gap-2.5">
							<div className="flex size-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
								<Pill className="size-4" />
							</div>
							<span className="text-sm">{medication.name}</span>
						</div>
						<Badge variant="destructive">{medication.stock} u.</Badge>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
