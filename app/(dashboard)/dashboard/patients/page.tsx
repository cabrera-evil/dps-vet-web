'use client';

import {
	dashboardNavItems,
	getNavTitle,
} from '@/components/layout/dashboard-nav-items';
import { PatientsTable } from '@/components/patients/patients-table';
import { PetFormDialog } from '@/components/patients/pet-form-dialog';
import { usePermissions } from '@/hooks/use-permissions';

const patientsNavItem = dashboardNavItems.find(
	(item) => item.href === '/dashboard/patients'
)!;

export default function DashboardPatientsPage() {
	const { hasPermission } = usePermissions();
	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="font-heading text-lg font-semibold">
						{getNavTitle(patientsNavItem, hasPermission)}
					</h2>
					<p className="text-sm text-muted-foreground">
						Historial clínico de los pacientes registrados.
					</p>
				</div>
				<PetFormDialog mode="create" />
			</div>
			<PatientsTable />
		</div>
	);
}
