import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export interface ClinicalDataItem {
	label: string;
	value?: ReactNode;
}

export function ClinicalDataList({
	items,
	className,
}: {
	items: ClinicalDataItem[];
	className?: string;
}) {
	return (
		<dl
			className={cn(
				'grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3',
				className
			)}
		>
			{items.map(({ label, value }) => (
				<div key={label} className="flex flex-col gap-0.5">
					<dt className="text-xs text-muted-foreground">{label}</dt>
					<dd className="text-sm font-medium">
						{value || (
							<>
								<span aria-hidden="true">—</span>
								<span className="sr-only">No registrado</span>
							</>
						)}
					</dd>
				</div>
			))}
		</dl>
	);
}
