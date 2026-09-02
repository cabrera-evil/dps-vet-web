import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

type SpinnerProps = {
	size?: number;
	className?: string;
};

export default function Spinner({ size = 24, className }: SpinnerProps) {
	return (
		<Loader2
			className={cn('animate-spin text-muted-foreground', className)}
			size={size}
			strokeWidth={2}
		/>
	);
}
