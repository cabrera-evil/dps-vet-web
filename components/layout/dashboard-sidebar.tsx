'use client';

import {
	dashboardNavItems,
	getNavTitle,
} from '@/components/layout/dashboard-nav-items';
import { DashboardNavUser } from '@/components/layout/dashboard-nav-user';
import { isNavActive } from '@/components/layout/nav-active';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from '@/components/ui/sidebar';
import { usePermissions } from '@/hooks/use-permissions';
import { Stethoscope } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function DashboardSidebar() {
	const pathname = usePathname();
	const { hasPermission } = usePermissions();

	// Default deny: permissions are empty until ready, so only unrestricted items show.
	const visibleNavItems = dashboardNavItems.filter((item) =>
		hasPermission(item.permissions ?? [], item.mode)
	);

	return (
		<Sidebar variant="inset" collapsible="icon">
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							size="lg"
							tooltip="Veterinaria San Roque"
							render={<Link href="/dashboard" />}
						>
							<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
								<Stethoscope aria-hidden className="size-4" />
							</div>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">
									Veterinaria San Roque
								</span>
								<span className="truncate text-xs">Panel clínico</span>
							</div>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Módulos</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{visibleNavItems.map((item) => {
								const title = getNavTitle(item, hasPermission);
								return (
									<SidebarMenuItem key={item.href}>
										<SidebarMenuButton
											tooltip={title}
											isActive={isNavActive(pathname, item.href)}
											render={<Link href={item.href} />}
										>
											<item.icon aria-hidden />
											<span>{title}</span>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<DashboardNavUser />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
