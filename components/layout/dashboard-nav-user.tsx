'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from '@/components/ui/sidebar';
import { getInitials } from '@/utils/initials';
import { ChevronsUpDown, LogOut } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';

function UserIdentity({
	name,
	email,
	image,
}: {
	name: string;
	email?: string | null;
	image?: string | null;
}) {
	return (
		<div className="flex min-w-0 items-center gap-2 text-left text-sm">
			<Avatar className="rounded-lg">
				{image && <AvatarImage src={image} alt="" />}
				<AvatarFallback className="rounded-lg">
					{getInitials(name)}
				</AvatarFallback>
			</Avatar>
			<div className="grid min-w-0 flex-1 leading-tight">
				<span className="truncate font-medium">{name}</span>
				{email && <span className="truncate text-xs">{email}</span>}
			</div>
		</div>
	);
}

export function DashboardNavUser() {
	const { data: session } = useSession();
	const { isMobile } = useSidebar();

	const user = session?.user;
	if (!user) return null;
	const name = user.name ?? user.email ?? 'Usuario';

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<SidebarMenuButton
								size="lg"
								aria-label="Menú de usuario"
								className="data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground"
							/>
						}
					>
						<UserIdentity name={name} email={user.email} image={user.image} />
						<ChevronsUpDown aria-hidden className="ml-auto size-4" />
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-56 min-w-56 rounded-lg"
						side={isMobile ? 'bottom' : 'right'}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuGroup>
							<DropdownMenuLabel className="p-1.5 font-normal text-foreground">
								<UserIdentity
									name={name}
									email={user.email}
									image={user.image}
								/>
							</DropdownMenuLabel>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => void signOut()}>
							<LogOut aria-hidden />
							Cerrar sesión
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
