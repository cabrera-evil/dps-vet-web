import { Button } from '@/components/ui/button';
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from '@/components/ui/empty';
import type { ConsultationListItem as ConsultationListItemData } from '@/types/consultation.type';
import { ClipboardList, Plus } from 'lucide-react';
import Link from 'next/link';
import { ConsultationListItem } from './consultation-list-item';

interface ConsultationsTabProps {
	patientId: string;
	consultations: ConsultationListItemData[];
	canWrite: boolean;
}

export function ConsultationsTab({
	patientId,
	consultations,
	canWrite,
}: ConsultationsTabProps) {
	const newConsultationHref = `/dashboard/patients/${patientId}/consultations/new`;

	if (consultations.length === 0) {
		return (
			<Empty className="border">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<ClipboardList />
					</EmptyMedia>
					<EmptyTitle>
						No hay consultas registradas para este paciente.
					</EmptyTitle>
					<EmptyDescription>
						Las consultas finalizadas formarán la historia clínica cronológica.
					</EmptyDescription>
				</EmptyHeader>
				{canWrite && (
					<EmptyContent>
						<Button
							nativeButton={false}
							render={<Link href={newConsultationHref} />}
						>
							<Plus />
							Registrar primera consulta
						</Button>
					</EmptyContent>
				)}
			</Empty>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<p className="text-sm text-muted-foreground">
					Historial cronológico, de la más reciente a la más antigua.
				</p>
				{canWrite && (
					<Button
						nativeButton={false}
						render={<Link href={newConsultationHref} />}
					>
						<Plus />
						Registrar consulta
					</Button>
				)}
			</div>
			<ol className="ml-1.5 flex flex-col border-l">
				{consultations.map((consultation) => (
					<ConsultationListItem
						key={consultation.id}
						patientId={patientId}
						consultation={consultation}
					/>
				))}
			</ol>
		</div>
	);
}
