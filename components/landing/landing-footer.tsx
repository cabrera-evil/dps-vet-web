import { ExternalLink, Lock, ShieldCheck, Stethoscope } from 'lucide-react';
import Link from 'next/link';

const NAV_LINKS = [
	{ href: '#inicio', label: 'Inicio' },
	{ href: '#servicios', label: 'Servicios Clínicos' },
	{ href: '#por-que-san-roque', label: 'Por qué Elegirnos' },
	{ href: '#como-agendar', label: 'Cómo Agendar Cita' },
	{ href: '#nosotros', label: 'Equipo Médico' },
	{ href: '#contacto', label: 'Ubicación y Horarios' },
];

const SERVICE_LINKS = [
	'Consulta Preventiva',
	'Cirugía e Inhalatoria',
	'Laboratorio Sanguíneo',
	'Radiología Digital Directa',
	'Hospitalización Canina/Felina',
	'Farmacia Veterinaria',
];

const LEGAL_LINKS = [
	'Aviso de Privacidad y Datos',
	'Términos de Consentimiento Informado',
];

export function LandingFooter() {
	return (
		<footer className="border-t bg-card pt-12 pb-24 md:pb-12">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
					<div className="lg:col-span-2">
						<Link className="group mb-4 flex items-center gap-2.5" href="/">
							<div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
								<Stethoscope className="size-4" />
							</div>
							<div className="flex flex-col">
								<span className="text-lg leading-none font-bold tracking-tight text-primary">
									San Roque
								</span>
								<span className="text-[9px] tracking-wider text-muted-foreground uppercase">
									Clínica & Quirófano 24/7
								</span>
							</div>
						</Link>
						<p className="mb-4 max-w-sm text-xs leading-relaxed text-muted-foreground">
							Institución médico-veterinaria especializada en San Salvador.
							Atención ambulatoria, laboratorio de patología clínica, ecografía
							Doppler y cirugía de tejidos blandos y ortopedia.
						</p>
						<div className="space-y-1 text-xs text-muted-foreground">
							<p>
								<strong>Razón Social:</strong> Veterinaria San Roque S.A. de
								C.V.
							</p>
							<p>
								<strong>NIT:</strong> 0614-230912-102-4
							</p>
							<p>
								<strong>Registro Sanitario MAG:</strong> SV-VT-4829
							</p>
							<p>
								<strong>Emisor DTE:</strong> Autorizado Ministerio de Hacienda
								El Salvador
							</p>
						</div>
					</div>

					<div>
						<h4 className="mb-3 text-xs font-semibold tracking-wider uppercase">
							Navegación
						</h4>
						<ul className="space-y-2 text-xs text-muted-foreground">
							{NAV_LINKS.map((link) => (
								<li key={link.href}>
									<a
										className="transition-colors hover:text-primary"
										href={link.href}
									>
										{link.label}
									</a>
								</li>
							))}
						</ul>
					</div>

					<div>
						<h4 className="mb-3 text-xs font-semibold tracking-wider uppercase">
							Servicios Médicos
						</h4>
						<ul className="space-y-2 text-xs text-muted-foreground">
							{SERVICE_LINKS.map((label) => (
								<li key={label}>
									<a
										className="transition-colors hover:text-primary"
										href="#servicios"
									>
										{label}
									</a>
								</li>
							))}
						</ul>
					</div>

					<div>
						<h4 className="mb-3 text-xs font-semibold tracking-wider uppercase">
							Portal del Tutor
						</h4>
						<ul className="mb-5 space-y-2 text-xs text-muted-foreground">
							<li>
								<a
									className="flex items-center gap-1 transition-colors hover:text-primary"
									href="#portal"
								>
									Iniciar Sesión Expediente
									<ExternalLink className="size-2.5" />
								</a>
							</li>
							<li>
								<a
									className="transition-colors hover:text-primary"
									href="#contacto"
								>
									Solicitar Copia de Historial
								</a>
							</li>
							<li>
								<a
									className="transition-colors hover:text-primary"
									href="#contacto"
								>
									Facturación Electrónica DTE
								</a>
							</li>
						</ul>
						<h4 className="mb-2 text-xs font-semibold tracking-wider uppercase">
							Marco Regulatorio
						</h4>
						<ul className="space-y-1 text-[11px] text-muted-foreground">
							{LEGAL_LINKS.map((label) => (
								<li key={label}>
									<a className="hover:underline" href="#">
										{label}
									</a>
								</li>
							))}
						</ul>
					</div>
				</div>

				<div className="flex flex-col items-center justify-between gap-4 border-t pt-6 text-xs text-muted-foreground sm:flex-row">
					<p>
						© {new Date().getFullYear()} Veterinaria San Roque S.A. de C.V.
						Todos los derechos reservados. San Salvador, El Salvador.
					</p>
					<div className="flex items-center gap-4">
						<span className="flex items-center gap-1 text-primary">
							<Lock className="size-3.5" />
							Conexión Segura TLS 256-bit
						</span>
						<span>·</span>
						<span className="flex items-center gap-1">
							<ShieldCheck className="size-3.5" />
							San Benito, San Salvador
						</span>
					</div>
				</div>
			</div>
		</footer>
	);
}
