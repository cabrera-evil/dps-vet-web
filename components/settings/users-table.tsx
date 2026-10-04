'use client';

import { TableSkeletonRows } from '@/components/table/table-skeleton-rows';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
	NativeSelect,
	NativeSelectOption,
} from '@/components/ui/native-select';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { queryClient } from '@/constants/environment';
import { Permission } from '@/constants/permission';
import { RoleName } from '@/constants/roles';
import { useGet, usePatch } from '@/hooks/use-rest';
import { SystemUser } from '@/types/user.type';
import { hasPermission } from '@/utils/permission';
import { Search } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

const ROLE_LABELS: Record<RoleName, string> = {
	[RoleName.ADMINISTRADOR]: 'Administrador',
	[RoleName.EMPLEADO]: 'Empleado',
	[RoleName.CLIENTE]: 'Cliente',
};

const ROLES = Object.values(RoleName);

function roleLabel(role: string) {
	return ROLE_LABELS[role as RoleName] ?? role;
}

export function UsersTable() {
	const { data: session } = useSession();
	const [query, setQuery] = useState('');
	const [roleFilter, setRoleFilter] = useState<string | null>(null);
	const [updatingId, setUpdatingId] = useState<string | null>(null);
	const { data: users, isLoading } = useGet<SystemUser[]>({
		path: '/users',
		params: { pageSize: 100 },
	});
	const { mutateAsync: updateRole } = usePatch();

	const canUpdate = hasPermission(session?.user?.permissions, [
		Permission.USERS_UPDATE,
	]);

	const filtered = useMemo(() => {
		const normalized = query.trim().toLowerCase();
		return (users ?? []).filter((user) => {
			if (roleFilter && user.role !== roleFilter) return false;
			if (!normalized) return true;
			return [user.name, user.email, user.phone]
				.join(' ')
				.toLowerCase()
				.includes(normalized);
		});
	}, [users, query, roleFilter]);

	async function handleRoleChange(user: SystemUser, role: string) {
		setUpdatingId(user.id);
		try {
			await updateRole({ path: `/users/${user.id}`, payload: { role } });
		} catch {
			return;
		} finally {
			setUpdatingId(null);
		}
		await queryClient.invalidateQueries({ queryKey: ['/users'] });
		toast.success('Rol actualizado');
	}

	return (
		<Card>
			<CardContent className="flex flex-col gap-4">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="relative w-full max-w-sm">
						<Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							placeholder="Buscar por nombre, correo o teléfono..."
							aria-label="Buscar usuarios"
							className="pl-9"
						/>
					</div>
					<div
						className="flex flex-wrap items-center gap-2"
						role="group"
						aria-label="Filtrar por rol"
					>
						<Button
							size="sm"
							variant={roleFilter === null ? 'default' : 'outline'}
							aria-pressed={roleFilter === null}
							onClick={() => setRoleFilter(null)}
						>
							Todos
						</Button>
						{ROLES.map((role) => (
							<Button
								key={role}
								size="sm"
								variant={roleFilter === role ? 'default' : 'outline'}
								aria-pressed={roleFilter === role}
								onClick={() => setRoleFilter(role)}
							>
								{roleLabel(role)}
							</Button>
						))}
					</div>
				</div>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Usuario</TableHead>
							<TableHead>Contacto</TableHead>
							<TableHead>Rol del sistema</TableHead>
							<TableHead>Registrado</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableSkeletonRows columnCount={4} />
						) : (
							<>
								{filtered.map((user) => (
									<TableRow key={user.id}>
										<TableCell>
											<div className="flex items-center gap-2">
												<Avatar className="size-8">
													<AvatarFallback>
														{user.name.slice(0, 2).toUpperCase()}
													</AvatarFallback>
												</Avatar>
												<span className="font-medium">{user.name}</span>
											</div>
										</TableCell>
										<TableCell>
											<div className="flex flex-col text-sm">
												<span>{user.email}</span>
												<span className="text-muted-foreground">
													{user.phone}
												</span>
											</div>
										</TableCell>
										<TableCell>
											{canUpdate ? (
												<NativeSelect
													size="sm"
													aria-label={`Rol de ${user.name}`}
													value={user.role}
													disabled={updatingId === user.id}
													onChange={(event) =>
														handleRoleChange(user, event.target.value)
													}
												>
													{ROLES.map((role) => (
														<NativeSelectOption key={role} value={role}>
															{roleLabel(role)}
														</NativeSelectOption>
													))}
												</NativeSelect>
											) : (
												<Badge variant="outline">{roleLabel(user.role)}</Badge>
											)}
										</TableCell>
										<TableCell>
											{new Date(user.createdAt).toLocaleDateString('es-SV', {
												dateStyle: 'medium',
											})}
										</TableCell>
									</TableRow>
								))}
								{filtered.length === 0 && (
									<TableRow>
										<TableCell
											colSpan={4}
											className="text-center text-sm text-muted-foreground"
										>
											No se encontraron usuarios.
										</TableCell>
									</TableRow>
								)}
							</>
						)}
					</TableBody>
				</Table>
				{!isLoading && (
					<p className="text-sm text-muted-foreground">
						Mostrando {filtered.length} de {users?.length ?? 0} usuarios
						registrados
					</p>
				)}
			</CardContent>
		</Card>
	);
}
