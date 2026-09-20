import { bookingSteps } from '@/components/landing/mocks/booking-steps.mock';
import { Button } from '@/components/ui/button';
import { Clock, MessageCircle, PhoneCall } from 'lucide-react';

export function LandingBooking() {
	return (
		<section className="bg-background py-16 lg:py-20" id="como-agendar">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mx-auto mb-14 max-w-2xl text-center">
					<div className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium tracking-wider text-primary uppercase">
						<Clock className="size-3.5" />
						Proceso de Reserva Digital
					</div>
					<h2 className="text-2xl font-semibold tracking-tight">
						Agenda tu visita clínica en 3 minutos
					</h2>
					<p className="mt-1 text-sm text-muted-foreground">
						Disponibilidad en tiempo real sin llamadas interminables ni esperas
						innecesarias en sala.
					</p>
				</div>

				<div className="grid grid-cols-1 gap-8 md:grid-cols-3">
					{bookingSteps.map((step) => (
						<div
							key={step.id}
							className="flex flex-col items-start rounded-xl border bg-card p-6 shadow-sm"
						>
							<div className="mb-4 flex w-full items-center justify-between">
								<span className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
									{step.step}
								</span>
								<step.icon className="size-6 text-muted-foreground" />
							</div>
							<h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
							<p className="text-sm text-muted-foreground">
								{step.description}
							</p>
						</div>
					))}
				</div>

				<div
					className="mt-12 rounded-2xl border bg-card p-6 shadow-md sm:p-8"
					id="agendar"
				>
					<div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
						<div className="lg:col-span-8">
							<h3 className="text-lg font-semibold">
								¿Necesitas programar una cita ahora mismo?
							</h3>
							<p className="mt-1 text-sm text-muted-foreground">
								Elige si prefieres agendar mediante nuestro asistente directo de
								WhatsApp o rellenar el formulario de consulta médica.
							</p>
						</div>
						<div className="flex flex-col gap-2.5 sm:flex-row lg:col-span-4 lg:flex-col">
							<Button
								className="h-auto justify-center py-2.5"
								nativeButton={false}
								render={
									<a
										href="https://wa.me/50378901234?text=Hola%20Veterinaria%20San%20Roque,%20deseo%20agendar%20una%20cita%20para%20mi%20mascota"
										target="_blank"
									/>
								}
							>
								<MessageCircle />
								Agendar por WhatsApp (+503)
							</Button>
							<Button
								className="h-auto justify-center py-2"
								nativeButton={false}
								render={<a href="tel:+50322578900" />}
								variant="secondary"
							>
								<PhoneCall className="text-destructive" />
								Recepción Telefónica: 2257-8900
							</Button>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
