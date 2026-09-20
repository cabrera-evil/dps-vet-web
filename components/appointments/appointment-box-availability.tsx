import {
	TreatmentBox,
	treatmentBoxesMock,
} from '@/components/appointments/mocks/treatment-boxes.mock';
import { Badge } from '@/components/ui/badge';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

const STATUS_LABEL: Record<TreatmentBox['status'], string> = {
	available: 'Disponible',
	occupied: 'Ocupado',
	cleaning: 'Limpieza',
};

const STATUS_VARIANT: Record<
	TreatmentBox['status'],
	'default' | 'secondary' | 'outline'
> = {
	available: 'secondary',
	occupied: 'default',
	cleaning: 'outline',
};

const STATUS_DOT: Record<TreatmentBox['status'], string> = {
	available: 'bg-emerald-500',
	occupied: 'bg-primary',
	cleaning: 'bg-amber-500',
};

export function AppointmentBoxAvailability() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Disponibilidad en tiempo real</CardTitle>
				<CardDescription>Ocupación de boxes clínicos</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-3">
				{treatmentBoxesMock.map((box) => (
					<div key={box.id} className="flex items-center justify-between gap-3">
						<div className="flex items-center gap-2.5">
							<span
								className={cn('size-2 rounded-full', STATUS_DOT[box.status])}
							/>
							<div>
								<p className="text-sm leading-tight font-medium">{box.name}</p>
								<p className="text-xs text-muted-foreground">{box.detail}</p>
							</div>
						</div>
						<Badge variant={STATUS_VARIANT[box.status]}>
							{STATUS_LABEL[box.status]}
						</Badge>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
