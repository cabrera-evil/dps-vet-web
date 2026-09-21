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
import { useDelete } from '@/hooks/use-rest';
import { Pet } from '@/types/pet.type';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function PetDeleteDialog({ pet }: { pet: Pet }) {
	const { mutateAsync: deletePet, isPending } = useDelete();

	async function handleConfirm() {
		try {
			await deletePet({ path: `/pets/${pet.id}` });
		} catch {
			return;
		}
		await queryClient.invalidateQueries({ queryKey: ['/pets'] });
		toast.success('Mascota eliminada');
	}

	return (
		<AlertDialog>
			<AlertDialogTrigger
				render={
					<Button size="icon" variant="outline" aria-label="Eliminar mascota">
						<Trash2 />
					</Button>
				}
			/>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Eliminar mascota</AlertDialogTitle>
					<AlertDialogDescription>
						¿Seguro que deseas eliminar a {pet.name}? Esta acción no se puede
						deshacer.
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
