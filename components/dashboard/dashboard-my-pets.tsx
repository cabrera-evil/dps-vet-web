'use client';

import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Permission } from '@/constants/permission';
import { usePermissions } from '@/hooks/use-permissions';
import { useGet } from '@/hooks/use-rest';
import { Pet } from '@/types/pet.type';
import { PawPrint } from 'lucide-react';
import Link from 'next/link';

/** Client home entry: summary of the caller's own pets, linking to the list. */
export function DashboardMyPets() {
	const { hasPermission } = usePermissions();
	// Client view only: readers of pets who cannot manage everyone's pets.
	const isClientView =
		hasPermission([Permission.PETS_READ]) &&
		!hasPermission([Permission.PETS_MANAGE_ALL]);
	const {
		data: pets,
		isLoading,
		isError,
	} = useGet<Pet[]>(
		{ path: '/pets', params: { pageSize: 100 } },
		{ enabled: isClientView }
	);

	if (!isClientView) return null;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Mis mascotas</CardTitle>
				<CardDescription>Tus mascotas registradas</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-3">
				{isLoading && <Skeleton className="h-8 w-full" />}
				{!isLoading && isError && (
					<p className="text-sm text-muted-foreground">No se pudo cargar.</p>
				)}
				{!isLoading && !isError && (
					<p className="flex items-center gap-2 text-sm">
						<PawPrint className="size-4 text-primary" aria-hidden />
						{pets?.length
							? `${pets.length} ${pets.length === 1 ? 'mascota' : 'mascotas'}: ${pets
									.slice(0, 3)
									.map((pet) => pet.name)
									.join(', ')}${pets.length > 3 ? '…' : ''}`
							: 'Aún no tienes mascotas registradas.'}
					</p>
				)}
				<Button
					variant="outline"
					nativeButton={false}
					render={<Link href="/dashboard/patients" />}
				>
					Ver mis mascotas
				</Button>
			</CardContent>
		</Card>
	);
}
