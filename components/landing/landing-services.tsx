'use client';

import {
	clinicalServices,
	serviceCategoryLabels,
	type ServiceCategory,
} from '@/components/landing/mocks/services.mock';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, Stethoscope } from 'lucide-react';
import { useState } from 'react';

const CATEGORIES: Array<ServiceCategory | 'todos'> = [
	'todos',
	'preventivo',
	'quirurgico',
	'diagnostico',
];

export function LandingServices() {
	const [category, setCategory] = useState<ServiceCategory | 'todos'>('todos');

	const services =
		category === 'todos'
			? clinicalServices
			: clinicalServices.filter((service) => service.category === category);

	return (
		<section className="bg-background py-16 lg:py-20" id="servicios">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
					<div>
						<div className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium tracking-wider text-primary uppercase">
							<Stethoscope className="size-3.5" />
							Portafolio Médico San Roque
						</div>
						<h2 className="text-2xl font-semibold tracking-tight">
							Servicios Clínicos Especializados
						</h2>
						<p className="mt-1 max-w-xl text-sm text-muted-foreground">
							Protocolos veterinarios estandarizados con tarifas transparentes
							en dólares estadounidenses (USD).
						</p>
					</div>

					<Tabs
						onValueChange={(value) =>
							setCategory(value as ServiceCategory | 'todos')
						}
						value={category}
					>
						<TabsList>
							{CATEGORIES.map((value) => (
								<TabsTrigger key={value} value={value}>
									{serviceCategoryLabels[value]}
								</TabsTrigger>
							))}
						</TabsList>
					</Tabs>
				</div>

				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{services.map((service) => (
						<div
							key={service.id}
							className="group relative flex flex-col justify-between overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all hover:border-primary/50"
						>
							{service.badge && (
								<div className="absolute top-0 right-0 rounded-bl bg-primary px-2.5 py-0.5 text-[9px] font-bold tracking-wide text-primary-foreground uppercase">
									{service.badge}
								</div>
							)}
							<div>
								<div className="mb-4 flex items-center justify-between">
									<span className="flex size-10 items-center justify-center rounded-lg bg-muted text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
										<service.icon className="size-5" />
									</span>
									<span className="rounded-md bg-primary/10 px-2.5 py-1 text-sm font-bold text-primary">
										{service.price}
									</span>
								</div>
								<span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
									{service.kicker}
								</span>
								<h3 className="mt-1 mb-2 text-lg font-semibold">
									{service.title}
								</h3>
								<p className="mb-4 text-sm text-muted-foreground">
									{service.description}
								</p>
								<ul className="mb-6 space-y-1.5 border-t pt-3 text-xs text-muted-foreground">
									{service.features.map((feature) => (
										<li key={feature} className="flex items-center gap-2">
											<ArrowRight className="size-3.5 text-primary" />
											{feature}
										</li>
									))}
								</ul>
							</div>
							<a
								className="flex w-full items-center justify-between rounded-lg bg-muted px-3.5 py-2 text-xs font-medium text-primary transition-colors hover:bg-muted/70"
								href="#agendar"
							>
								{service.cta}
								<ArrowRight className="size-3.5" />
							</a>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
