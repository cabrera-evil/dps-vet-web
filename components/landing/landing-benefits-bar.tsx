import { clinicBenefits } from '@/components/landing/mocks/trust-highlights.mock';

export function LandingBenefitsBar() {
	return (
		<section className="border-b bg-card py-6">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
					{clinicBenefits.map((benefit) => (
						<div key={benefit.id} className="flex items-start gap-3.5">
							<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
								<benefit.icon className="size-5" />
							</div>
							<div>
								<h2 className="text-sm font-semibold">{benefit.title}</h2>
								<p className="mt-0.5 text-xs text-muted-foreground">
									{benefit.description}
								</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
