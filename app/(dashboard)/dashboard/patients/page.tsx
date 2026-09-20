import { PatientsTable } from '@/components/patients/patients-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

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
				<Button>
					<Plus />
					Nuevo paciente
				</Button>
			</div>
			<PatientsTable />
		</div>
	);
}
