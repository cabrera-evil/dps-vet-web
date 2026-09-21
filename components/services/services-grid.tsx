'use client';

import { ServiceDeleteDialog } from '@/components/services/service-delete-dialog';
import { ServiceFormDialog } from '@/components/services/service-form-dialog';
import { Badge } from '@/components/ui/badge';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useGet } from '@/hooks/use-rest';
import { Service } from '@/types/service.type';
import { Clock } from 'lucide-react';

function ServiceCardSkeleton() {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between gap-2">
					<Skeleton className="h-5 w-32" />
					<Skeleton className="h-5 w-16 rounded-full" />
				</div>
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-2/3" />
			</CardHeader>
			<CardContent className="flex items-center justify-between">
				<Skeleton className="h-4 w-16" />
				<Skeleton className="h-6 w-20" />
			</CardContent>
		</Card>
	);
}

export function ServicesGrid() {
	const { data: services, isLoading } = useGet<Service[]>({
		path: '/services',
		params: { pageSize: 100 },
	});

	if (isLoading) {
		return (
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
				{Array.from({ length: 6 }).map((_, index) => (
					<ServiceCardSkeleton key={index} />
				))}
			</div>
		);
	}

	if (!services?.length) {
		return (
			<p className="text-center text-sm text-muted-foreground">
				No se encontraron servicios.
			</p>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
			{services.map((service) => (
				<Card key={service.id}>
					<CardHeader>
						<div className="flex items-center justify-between gap-2">
							<CardTitle>{service.name}</CardTitle>
							<Badge variant={service.active ? 'default' : 'secondary'}>
								{service.active ? 'Activo' : 'Inactivo'}
							</Badge>
						</div>
						<CardDescription>{service.description}</CardDescription>
					</CardHeader>
					<CardContent className="flex items-center justify-between">
						<div className="flex items-center gap-1.5 text-sm text-muted-foreground">
							<Clock className="size-4" />
							{service.durationMinutes} min
						</div>
						<span className="text-lg font-semibold tabular-nums">
							${service.price.toFixed(2)} USD
						</span>
					</CardContent>
					<CardFooter className="justify-end gap-2">
						<ServiceFormDialog mode="edit" service={service} />
						<ServiceDeleteDialog service={service} />
					</CardFooter>
				</Card>
			))}
		</div>
	);
}
