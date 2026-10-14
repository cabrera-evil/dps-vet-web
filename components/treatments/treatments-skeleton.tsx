import { Skeleton } from '@/components/ui/skeleton';

export function TreatmentsSkeleton() {
	return (
		<div className="flex flex-col gap-4" aria-busy="true">
			<span className="sr-only">Cargando tratamientos…</span>
			<Skeleton className="h-8 w-48" />
			<Skeleton className="h-44 w-full rounded-xl" />
			<Skeleton className="h-44 w-full rounded-xl" />
		</div>
	);
}
