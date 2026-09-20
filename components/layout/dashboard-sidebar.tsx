'use client';

import { dashboardNavItems } from '@/components/layout/dashboard-nav-items';
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
} from '@/components/ui/sidebar';
import { LogOut, Stethoscope } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function DashboardSidebar() {
	const pathname = usePathname();
	const { data: session } = useSession();

	return (
		<Sidebar>
			<SidebarHeader>
				<div className="flex items-center gap-2 px-2 py-1.5">
					<Stethoscope className="size-5 text-primary" />
					<span className="font-heading text-sm font-semibold">
						Veterinaria San Roque
					</span>
				</div>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Módulos</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{dashboardNavItems.map((item) => {
								const isActive =
									item.href === '/dashboard'
										? pathname === item.href
										: pathname.startsWith(item.href);
								return (
									<SidebarMenuItem key={item.href}>
										<SidebarMenuButton
											isActive={isActive}
											render={<Link href={item.href} />}
										>
											<item.icon />
											<span>{item.title}</span>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<div className="truncate px-2 py-1 text-xs text-muted-foreground">
							{session?.user?.email ?? 'Sesión activa'}
						</div>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarMenuButton onClick={() => signOut()}>
							<LogOut />
							<span>Cerrar sesión</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
