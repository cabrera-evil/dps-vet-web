import { UsersTable } from '@/components/settings/users-table';

export default function DashboardSettingsPage() {
	return (
		<div className="flex flex-col gap-4">
			<div>
				<h2 className="font-heading text-lg font-semibold">
					Configuración y Usuarios
				</h2>
				<p className="text-sm text-muted-foreground">
					Gestión de usuarios del sistema y asignación de roles.
				</p>
			</div>
			<UsersTable />
		</div>
	);
}
