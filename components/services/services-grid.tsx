import { servicesMock } from '@/components/services/mocks/services.mock';
import { Badge } from '@/components/ui/badge';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Clock } from 'lucide-react';

export function ServicesGrid() {
	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
			{servicesMock.map((service) => (
				<Card key={service.id}>
					<CardHeader>
						<div className="flex items-center justify-between gap-2">
							<CardTitle>{service.name}</CardTitle>
							<Badge variant={service.active ? 'default' : 'secondary'}>
								{service.active ? 'Activo' : 'Inactivo'}
							</Badge>
						</div>
						<CardDescription>{service.description}</CardDescription>
					</CardHeader>
					<CardContent className="flex items-center justify-between">
						<div className="flex items-center gap-1.5 text-sm text-muted-foreground">
							<Clock className="size-4" />
							{service.durationMinutes} min
						</div>
						<span className="text-lg font-semibold tabular-nums">
							${service.price.toFixed(2)} USD
						</span>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
