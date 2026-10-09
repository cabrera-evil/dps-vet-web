'use client';

import { PatientRecordNotice } from '@/components/patients/patient-record-notice';
import { Button } from '@/components/ui/button';
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from '@/components/ui/empty';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TreatmentStatus } from '@/constants/enum';
import { TREATMENT_VIEWS } from '@/constants/treatment';
import { useTreatmentPlans } from '@/hooks/use-treatments';
import { CircleAlert, ClipboardList, Pill } from 'lucide-react';
import Link from 'next/link';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { ActiveTreatmentCard } from './active-treatment-card';
import { TreatmentHistoryItem } from './treatment-history-item';
import { TreatmentsSkeleton } from './treatments-skeleton';

interface TreatmentsTabProps {
	petId: string;
	petName: string;
	canWrite: boolean;
}

const ACTIVE_STATUSES = [TreatmentStatus.ACTIVE, TreatmentStatus.PLANNED];

export function TreatmentsTab({
	petId,
	petName,
	canWrite,
}: TreatmentsTabProps) {
	const [view, setView] = useQueryState(
		'view',
		parseAsStringLiteral(TREATMENT_VIEWS).withDefault('activos')
	);
	const { data: plans, error, isLoading, refetch } = useTreatmentPlans(petId);

	if (isLoading) return <TreatmentsSkeleton />;

	if (error)
		return (
			<PatientRecordNotice
				icon={CircleAlert}
				title="No pudimos cargar los tratamientos"
				description="Ocurrió un problema al obtener los tratamientos del paciente. Intenta nuevamente."
				action={
					<Button variant="outline" onClick={() => refetch()}>
						Reintentar
					</Button>
				}
			/>
		);

	const all = plans ?? [];
	if (all.length === 0)
		return (
			<Empty className="border">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<Pill />
					</EmptyMedia>
					<EmptyTitle>
						No hay tratamientos registrados para este paciente.
					</EmptyTitle>
					<EmptyDescription>
						Los tratamientos se indican dentro de una consulta, para que siempre
						queden ligados a su diagnóstico.
					</EmptyDescription>
				</EmptyHeader>
				{canWrite && (
					<EmptyContent>
						<Button
							nativeButton={false}
							render={
								<Link href={`/dashboard/patients/${petId}/consultations/new`} />
							}
						>
							<ClipboardList />
							Registrar consulta
						</Button>
					</EmptyContent>
				)}
			</Empty>
		);

	const active = all.filter((plan) => ACTIVE_STATUSES.includes(plan.status));
	const history = all.filter((plan) => !ACTIVE_STATUSES.includes(plan.status));

	return (
		<div className="flex flex-col gap-4">
			<Tabs
				value={view}
				onValueChange={(value) => setView(value as typeof view)}
			>
				<TabsList variant="line">
					<TabsTrigger value="activos">Activos ({active.length})</TabsTrigger>
					<TabsTrigger value="historial">
						Historial ({history.length})
					</TabsTrigger>
				</TabsList>
			</Tabs>
			{view === 'activos' ? (
				active.length === 0 ? (
					<p className="text-sm text-muted-foreground">
						No hay tratamientos activos. Los anteriores están en el historial.
					</p>
				) : (
					active.map((plan) => (
						<ActiveTreatmentCard
							key={plan.id}
							petId={petId}
							petName={petName}
							plan={plan}
							canWrite={canWrite}
						/>
					))
				)
			) : history.length === 0 ? (
				<p className="text-sm text-muted-foreground">
					Aún no hay tratamientos finalizados.
				</p>
			) : (
				history.map((plan) => (
					<TreatmentHistoryItem key={plan.id} petId={petId} plan={plan} />
				))
			)}
		</div>
	);
}
