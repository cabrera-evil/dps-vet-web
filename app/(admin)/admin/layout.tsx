import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { AdminTopbar } from '@/components/layout/admin-topbar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import type { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
	return (
		<SidebarProvider>
			<AdminSidebar />
			<SidebarInset>
				<AdminTopbar />
				<main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
					{children}
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
