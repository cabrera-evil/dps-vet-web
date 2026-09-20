import { Button } from '@/components/ui/button';
import {
	CalendarCheck,
	Heart,
	Lock,
	MessageCircle,
	Shield,
	ShieldCheck,
} from 'lucide-react';

const TRUST_ITEMS = [
	{ id: 'licensed', icon: ShieldCheck, label: 'Médicos Colegiados' },
	{ id: 'sterile', icon: Shield, label: 'Instalaciones Estériles' },
	{ id: 'secure', icon: Lock, label: 'Expediente Seguro' },
];

export function LandingFinalCta() {
	return (
		<section className="relative overflow-hidden border-t bg-foreground px-4 py-16 text-background sm:px-6 lg:px-8">
			<div
				aria-hidden
				className="pointer-events-none absolute -right-20 -bottom-20 size-96 rounded-full bg-primary/20 blur-3xl"
			/>
			<div className="relative mx-auto max-w-4xl text-center">
				<span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/20 px-3 py-1 text-xs font-medium tracking-wider text-primary uppercase">
					<Heart className="size-3.5" />
					Compromiso con su bienestar
				</span>
				<h2 className="mb-4 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
					La salud de tu mejor amigo está en las mejores manos profesionales
				</h2>
				<p className="mx-auto mb-8 max-w-2xl text-base text-background/70 text-balance sm:text-lg">
					No dejes para después la revisión de tu mascota. Evita complicaciones
					de salud agendando su chequeo preventivo o consultando de inmediato
					con nuestra sala de urgencias.
				</p>
				<div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
					<Button
						className="h-auto w-full justify-center px-7 py-3.5 text-sm sm:w-auto"
						nativeButton={false}
						render={<a href="#agendar" />}
					>
						<CalendarCheck />
						Agendar mi Cita Hoy
					</Button>
					<Button
						className="h-auto w-full justify-center border-background/20 bg-background/10 px-6 py-3.5 text-sm text-background hover:bg-background/20 sm:w-auto"
						nativeButton={false}
						render={
							<a
								href="https://wa.me/50378901234?text=Hola%20Veterinaria%20San%20Roque,%20necesito%20asistencia%20veterinaria"
								target="_blank"
							/>
						}
						variant="outline"
					>
						<MessageCircle className="text-primary" />
						Escribir por WhatsApp
					</Button>
				</div>
				<div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-background/70">
					{TRUST_ITEMS.map((item) => (
						<span key={item.id} className="flex items-center gap-1">
							<item.icon className="size-3.5 text-primary" />
							{item.label}
						</span>
					))}
				</div>
			</div>
		</section>
	);
}
