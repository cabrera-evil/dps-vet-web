'use client';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { usePermissions } from '@/hooks/use-permissions';
import type { ReactNode } from 'react';

/**
 * Holds the whole dashboard back until the caller's permissions are known, so
 * no page renders a "no permission" state (or flashes staff UI) while they load.
 * This component also keeps the permissions query observed for its lifetime.
 */
export function PermissionsBootstrap({ children }: { children: ReactNode }) {
	const { status } = usePermissions();
	if (status === 'ready') return children;
	return (
		<div className="bg-background flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
			{status === 'loading' ? (
				<>
					<Spinner className="size-6" />
					<p className="text-muted-foreground text-sm">Cargando…</p>
				</>
			) : (
				<>
					<p className="text-sm">No se pudo cargar tu sesión.</p>
					<Button onClick={() => window.location.reload()}>Reintentar</Button>
				</>
			)}
		</div>
	);
}
