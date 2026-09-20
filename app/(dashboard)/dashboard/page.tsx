import { DashboardGreeting } from '@/components/dashboard/dashboard-greeting';
import { DashboardLowStock } from '@/components/dashboard/dashboard-low-stock';
import { DashboardStaffOnDuty } from '@/components/dashboard/dashboard-staff-on-duty';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { DashboardUpcomingAppointments } from '@/components/dashboard/dashboard-upcoming-appointments';

export default function DashboardPage() {
	return (
		<div className="flex flex-col gap-4">
			<DashboardGreeting />
			<DashboardStats />
			<div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
				<div className="xl:col-span-2">
					<DashboardUpcomingAppointments />
				</div>
				<div className="flex flex-col gap-4">
					<DashboardLowStock />
					<DashboardStaffOnDuty />
				</div>
			</div>
		</div>
	);
}
