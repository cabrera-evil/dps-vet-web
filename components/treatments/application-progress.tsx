import { Progress } from '@/components/ui/progress';

interface ApplicationProgressProps {
	done: number;
	total: number;
}

export function ApplicationProgress({ done, total }: ApplicationProgressProps) {
	if (total === 0) return null;
	const label = `${done} de ${total} ${total === 1 ? 'aplicación' : 'aplicaciones'}`;

	return (
		<div className="flex flex-col gap-1">
			<p className="text-xs font-medium tabular-nums">{label}</p>
			<Progress
				value={Math.round((done / total) * 100)}
				aria-label={label}
				className="w-full max-w-48"
			/>
		</div>
	);
}
