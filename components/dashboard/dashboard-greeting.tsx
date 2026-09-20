'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

function getGreeting() {
	const hour = new Date().getHours();
	if (hour < 12) return 'Buenos días';
	if (hour < 19) return 'Buenas tardes';
	return 'Buenas noches';
}

export function DashboardGreeting() {
	const { data: session } = useSession();
	const name = session?.user?.name ?? session?.user?.email ?? 'equipo clínico';

	return (
		<div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
			<div>
				<h2 className="font-heading text-lg font-semibold">
					{getGreeting()}, {name}
				</h2>
				<p className="text-sm text-muted-foreground capitalize">
					{new Date().toLocaleDateString('es-SV', {
						weekday: 'long',
						day: 'numeric',
						month: 'long',
					})}
				</p>
			</div>
			<Button nativeButton={false} render={<Link href="/admin/appointments" />}>
				<Plus />
				Nueva cita
			</Button>
		</div>
	);
}
