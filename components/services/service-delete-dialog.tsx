'use client';

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { queryClient } from '@/constants/environment';
import { Permission } from '@/constants/permission';
import { useDelete } from '@/hooks/use-rest';
import { Service } from '@/types/service.type';
import { hasPermission } from '@/utils/permission';
import { Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

function invalidateServices() {
	return queryClient.invalidateQueries({ queryKey: ['/services'] });
}

/** Gated on `SERVICES_WRITE` — the API also enforces this; hiding the trigger
 * is a UX nicety, not the authorization boundary. */
export function ServiceDeleteDialog({ service }: { service: Service }) {
	const { data: session } = useSession();
	const { mutateAsync: deleteService, isPending } = useDelete();

	const canWrite = hasPermission(session?.user?.permissions, [
		Permission.SERVICES_WRITE,
	]);
	if (!canWrite) return null;

	async function handleConfirm() {
		try {
			await deleteService({ path: `/services/${service.id}` });
		} catch {
			return;
		}
		await invalidateServices();
		toast.success('Servicio eliminado');
	}

	return (
		<AlertDialog>
			<AlertDialogTrigger
				render={
					<Button size="icon" variant="outline" aria-label="Eliminar servicio">
						<Trash2 />
					</Button>
				}
			/>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Eliminar servicio</AlertDialogTitle>
					<AlertDialogDescription>
						¿Seguro que deseas eliminar &quot;{service.name}&quot;? Esta acción
						no se puede deshacer.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancelar</AlertDialogCancel>
					<AlertDialogAction disabled={isPending} onClick={handleConfirm}>
						Eliminar
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
