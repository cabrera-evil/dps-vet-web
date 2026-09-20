'use client';

import { patientsMock } from '@/components/patients/mocks/patients.mock';
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
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';

function getAgeLabel(birthDate: string) {
	const ageMs = Date.now() - new Date(birthDate).getTime();
	const years = Math.floor(ageMs / (1000 * 60 * 60 * 24 * 365.25));
	return years > 0 ? `${years} años` : 'Menor a 1 año';
}

export function PatientsTable() {
	const [query, setQuery] = useState('');

	const patients = useMemo(() => {
		const normalized = query.trim().toLowerCase();
		if (!normalized) return patientsMock;
		return patientsMock.filter((patient) =>
			[patient.name, patient.ownerName, patient.breed]
				.join(' ')
				.toLowerCase()
				.includes(normalized)
		);
	}, [query]);

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
							<TableHead>Tutor</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{patients.map((patient) => (
							<TableRow key={patient.id}>
								<TableCell>
									<div className="flex items-center gap-2">
										<Avatar className="size-8">
											<AvatarFallback>
												{patient.name.slice(0, 2).toUpperCase()}
											</AvatarFallback>
										</Avatar>
										<span className="font-medium">{patient.name}</span>
									</div>
								</TableCell>
								<TableCell>{patient.species}</TableCell>
								<TableCell>{patient.breed}</TableCell>
								<TableCell>{getAgeLabel(patient.birthDate)}</TableCell>
								<TableCell>{patient.ownerName}</TableCell>
							</TableRow>
						))}
						{patients.length === 0 && (
							<TableRow>
								<TableCell
									colSpan={5}
									className="text-center text-sm text-muted-foreground"
								>
									No se encontraron pacientes.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
