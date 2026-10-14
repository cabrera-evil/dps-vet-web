import { DashboardGreeting } from '@/components/dashboard/dashboard-greeting';
import { DashboardLowStock } from '@/components/dashboard/dashboard-low-stock';
import { DashboardMyPets } from '@/components/dashboard/dashboard-my-pets';
import { DashboardStaffOnDuty } from '@/components/dashboard/dashboard-staff-on-duty';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { DashboardUpcomingAppointments } from '@/components/dashboard/dashboard-upcoming-appointments';
import { PermissionWrapper } from '@/components/wrappers/next-auth-wrapper';
import { Permission } from '@/constants/permission';

// Widgets render only once permissions are ready and granted (default deny);
// the wrapper's fallback/loading are empty, so nothing flashes meanwhile.
export default function DashboardPage() {
	return (
		<div className="flex flex-col gap-4">
			<DashboardGreeting />
			<PermissionWrapper permissions={[Permission.REPORTS_READ]}>
				<DashboardStats />
			</PermissionWrapper>
			<div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
				<div className="xl:col-span-2">
					<PermissionWrapper permissions={[Permission.APPOINTMENTS_READ]}>
						<DashboardUpcomingAppointments />
					</PermissionWrapper>
				</div>
				<div className="flex flex-col gap-4">
					<PermissionWrapper permissions={[Permission.REPORTS_READ]}>
						<DashboardLowStock />
					</PermissionWrapper>
					<PermissionWrapper permissions={[Permission.USERS_READ]}>
						<DashboardStaffOnDuty />
					</PermissionWrapper>
					<DashboardMyPets />
				</div>
			</div>
		</div>
	);
}
