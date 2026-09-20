'use client';

import { dashboardNavItems } from '@/components/layout/dashboard-nav-items';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';

export function DashboardTopbar() {
	const pathname = usePathname();
	const current = dashboardNavItems.find((item) =>
		item.href === '/dashboard'
			? pathname === item.href
			: pathname.startsWith(item.href)
	);

	return (
		<header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
			<SidebarTrigger />
			<Separator orientation="vertical" className="mr-2 h-4" />
			<h1 className="font-heading text-sm font-semibold">
				{current?.title ?? 'Dashboard'}
			</h1>
		</header>
	);
}
