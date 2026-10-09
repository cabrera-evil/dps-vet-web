import { Skeleton } from '@/components/ui/skeleton';

export function PatientRecordSkeleton() {
	return (
		<div
			className="flex flex-col gap-6"
			role="status"
			aria-label="Cargando expediente"
		>
			<Skeleton className="h-7 w-24" />
			<div className="flex items-start gap-4">
				<Skeleton className="size-14 rounded-full" />
				<div className="flex flex-1 flex-col gap-2">
					<Skeleton className="h-6 w-48" />
					<Skeleton className="h-4 w-64" />
					<Skeleton className="h-4 w-full max-w-xl" />
				</div>
			</div>
			<Skeleton className="h-8 w-full max-w-lg" />
			<div className="grid gap-4 lg:grid-cols-3">
				<Skeleton className="h-64 lg:col-span-2" />
				<Skeleton className="h-64" />
			</div>
		</div>
	);
}
