import { clinicPillars } from '@/components/landing/mocks/why-us.mock';
import { ShieldCheck } from 'lucide-react';

export function LandingWhyUs() {
	return (
		<section className="border-y bg-card py-16 lg:py-20" id="por-que-san-roque">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mb-12 max-w-3xl">
					<div className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium tracking-wider text-primary uppercase">
						<ShieldCheck className="size-3.5" />
						Estándar Hospitalario
					</div>
					<h2 className="text-2xl font-semibold tracking-tight">
						¿Por qué confiar la vida de tu mascota a San Roque?
					</h2>
					<p className="mt-2 text-sm text-muted-foreground">
						Combinamos rigor biomédico, infraestructura certificada y un trato
						profundamente empático para resolver casos complejos sin
						incertidumbre.
					</p>
				</div>
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
					{clinicPillars.map((pillar) => (
						<div
							key={pillar.id}
							className="flex flex-col rounded-xl border bg-background p-6"
						>
							<div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
								<pillar.icon className="size-6" />
							</div>
							<h3 className="mb-2 text-lg font-semibold">{pillar.title}</h3>
							<p className="text-sm text-muted-foreground">
								{pillar.description}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
