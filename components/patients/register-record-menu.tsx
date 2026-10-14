import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Plus, Stethoscope } from 'lucide-react';
import Link from 'next/link';

/** Entry point for clinical records; new record types are added here per phase. */
export function RegisterRecordMenu({ patientId }: { patientId: string }) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button>
						<Plus />
						Registrar
						<ChevronDown />
					</Button>
				}
			/>
			<DropdownMenuContent align="end" className="min-w-48">
				<DropdownMenuItem
					render={
						<Link href={`/dashboard/patients/${patientId}/consultations/new`} />
					}
				>
					<Stethoscope />
					Consulta clínica
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
