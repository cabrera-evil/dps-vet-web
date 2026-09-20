import { DashboardLowStock } from '@/components/dashboard/dashboard-low-stock';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { DashboardUpcomingAppointments } from '@/components/dashboard/dashboard-upcoming-appointments';

export default function AdminDashboardPage() {
	return (
		<div className="flex flex-col gap-4">
			<DashboardStats />
			<div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
				<div className="xl:col-span-2">
					<DashboardUpcomingAppointments />
				</div>
				<DashboardLowStock />
			</div>
		</div>
	);
}
