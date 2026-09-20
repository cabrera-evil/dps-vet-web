import {
	DashboardStaffOnDuty as DashboardStaffOnDutyMember,
	dashboardStaffOnDuty,
} from '@/components/dashboard/mocks/dashboard.mock';
import { Badge } from '@/components/ui/badge';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';

const STATUS_LABEL: Record<DashboardStaffOnDutyMember['status'], string> = {
	'on-duty': 'En turno',
	break: 'En descanso',
	'off-duty': 'Fuera de turno',
};

const STATUS_VARIANT: Record<
	DashboardStaffOnDutyMember['status'],
	'default' | 'secondary' | 'outline'
> = {
	'on-duty': 'default',
	break: 'secondary',
	'off-duty': 'outline',
};

export function DashboardStaffOnDuty() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Personal de turno hoy</CardTitle>
				<CardDescription>Equipo clínico disponible</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-3">
				{dashboardStaffOnDuty.map((staff) => (
					<div
						key={staff.id}
						className="flex items-center justify-between gap-3"
					>
						<div className="flex items-center gap-2.5">
							<div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
								{staff.initials}
							</div>
							<div>
								<p className="text-sm leading-tight font-medium">
									{staff.name}
								</p>
								<p className="text-xs text-muted-foreground">{staff.role}</p>
							</div>
						</div>
						<Badge variant={STATUS_VARIANT[staff.status]}>
							{STATUS_LABEL[staff.status]}
						</Badge>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
