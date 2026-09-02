import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';

interface ChartSkeletonProps {
	className?: string;
}
export const ChartSkeleton = ({ className }: ChartSkeletonProps) => {
	return (
		<div
			className={cn(
				'h-[250px] w-full flex items-end justify-between px-4 pb-8 pt-4',
				className
			)}
		>
			{Array.from({ length: 12 }).map((_, index) => (
				<div key={index} className="flex flex-col items-center gap-2 w-full">
					<Skeleton
						className="w-14"
						style={{
							height: Math.random() * 100 + 50,
						}}
					/>
					<Skeleton className="w-6 h-3" />
				</div>
			))}
		</div>
	);
};
