'use client';

import { PetDeleteDialog } from '@/components/patients/pet-delete-dialog';
import { PetFormDialog } from '@/components/patients/pet-form-dialog';
import { TableSkeletonRows } from '@/components/table/table-skeleton-rows';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { usePetDirectory } from '@/hooks/use-pet-directory';
import { useGet } from '@/hooks/use-rest';
import { Pet } from '@/types/pet.type';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';

function getAgeLabel(birthDate: string) {
	const ageMs = Date.now() - new Date(birthDate).getTime();
	const years = Math.floor(ageMs / (1000 * 60 * 60 * 24 * 365.25));
	return years > 0 ? `${years} años` : 'Menor a 1 año';
}

export function PatientsTable() {
	const [query, setQuery] = useState('');
	const { canManageAll, getOwnerName } = usePetDirectory();
	const { data: pets, isLoading } = useGet<Pet[]>({
		path: '/pets',
		params: { pageSize: 100 },
	});

	const filtered = useMemo(() => {
		const normalized = query.trim().toLowerCase();
		if (!normalized) return pets ?? [];
		return (pets ?? []).filter((pet) =>
			[pet.name, pet.breed, pet.species, getOwnerName(pet.ownerId)]
				.join(' ')
				.toLowerCase()
				.includes(normalized)
		);
	}, [pets, query, getOwnerName]);

	const columnCount = canManageAll ? 6 : 5;

	return (
		<Card>
			<CardContent className="flex flex-col gap-4">
				<div className="relative max-w-sm">
					<Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder="Buscar paciente, tutor o raza..."
						className="pl-9"
					/>
				</div>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Paciente</TableHead>
							<TableHead>Especie</TableHead>
							<TableHead>Raza</TableHead>
							<TableHead>Edad</TableHead>
							{canManageAll && <TableHead>Tutor</TableHead>}
							<TableHead className="text-right">Acciones</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableSkeletonRows columnCount={columnCount} />
						) : (
							<>
								{filtered.map((pet) => (
									<TableRow key={pet.id}>
										<TableCell>
											<div className="flex items-center gap-2">
												<Avatar className="size-8">
													<AvatarFallback>
														{pet.name.slice(0, 2).toUpperCase()}
													</AvatarFallback>
												</Avatar>
												<span className="font-medium">{pet.name}</span>
											</div>
										</TableCell>
										<TableCell>{pet.species}</TableCell>
										<TableCell>{pet.breed}</TableCell>
										<TableCell>{getAgeLabel(pet.birthDate)}</TableCell>
										{canManageAll && (
											<TableCell>{getOwnerName(pet.ownerId)}</TableCell>
										)}
										<TableCell className="text-right">
											<div className="flex justify-end gap-2">
												<PetFormDialog mode="edit" pet={pet} />
												<PetDeleteDialog pet={pet} />
											</div>
										</TableCell>
									</TableRow>
								))}
								{filtered.length === 0 && (
									<TableRow>
										<TableCell
											colSpan={columnCount}
											className="text-center text-sm text-muted-foreground"
										>
											No se encontraron pacientes.
										</TableCell>
									</TableRow>
								)}
							</>
						)}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
