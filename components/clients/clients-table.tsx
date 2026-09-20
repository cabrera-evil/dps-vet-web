'use client';

import { clientsMock } from '@/components/clients/mocks/clients.mock';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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

export function ClientsTable() {
	const [query, setQuery] = useState('');

	const clients = useMemo(() => {
		const normalized = query.trim().toLowerCase();
		if (!normalized) return clientsMock;
		return clientsMock.filter((client) =>
			[client.name, client.email, ...client.petNames]
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
						placeholder="Buscar tutor, correo o mascota..."
						className="pl-9"
					/>
				</div>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Tutor</TableHead>
							<TableHead>Contacto</TableHead>
							<TableHead>Mascotas</TableHead>
							<TableHead>Cliente desde</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{clients.map((client) => (
							<TableRow key={client.id}>
								<TableCell>
									<div className="flex items-center gap-2">
										<Avatar className="size-8">
											<AvatarFallback>
												{client.name.slice(0, 2).toUpperCase()}
											</AvatarFallback>
										</Avatar>
										<span className="font-medium">{client.name}</span>
									</div>
								</TableCell>
								<TableCell>
									<div className="flex flex-col text-sm">
										<span>{client.email}</span>
										<span className="text-muted-foreground">
											{client.phone}
										</span>
									</div>
								</TableCell>
								<TableCell>
									<div className="flex flex-wrap gap-1">
										{client.petNames.map((petName) => (
											<Badge key={petName} variant="outline">
												{petName}
											</Badge>
										))}
									</div>
								</TableCell>
								<TableCell>
									{new Date(client.createdAt).toLocaleDateString('es-SV', {
										dateStyle: 'medium',
									})}
								</TableCell>
							</TableRow>
						))}
						{clients.length === 0 && (
							<TableRow>
								<TableCell
									colSpan={4}
									className="text-center text-sm text-muted-foreground"
								>
									No se encontraron tutores.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
