import { PatientsTable } from '@/components/patients/patients-table';
import { PetFormDialog } from '@/components/patients/pet-form-dialog';

export default function DashboardPatientsPage() {
	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="font-heading text-lg font-semibold">Pacientes</h2>
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
