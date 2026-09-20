import { contactCards } from '@/components/landing/mocks/contact-info.mock';
import { ExternalLink, MapPin, Navigation, Phone } from 'lucide-react';
import Image from 'next/image';

export function LandingContact() {
	return (
		<section className="bg-background py-16 lg:py-20" id="contacto">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mb-12 max-w-2xl">
					<div className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium tracking-wider text-primary uppercase">
						<MapPin className="size-3.5" />
						Instalaciones Clínicas
					</div>
					<h2 className="text-2xl font-semibold tracking-tight">
						Fácil acceso en la Zona Rosa de San Salvador
					</h2>
					<p className="mt-1 text-sm text-muted-foreground">
						Contamos con parqueo privado vigilado, rampa de acceso para camillas
						de emergencia y área de descarga directa para pacientes con
						movilidad comprometida.
					</p>
				</div>

				<div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
					<div className="space-y-4 lg:col-span-5">
						{contactCards.map((card) => (
							<div
								key={card.id}
								className="flex items-start gap-4 rounded-xl border bg-card p-5 shadow-sm"
							>
								<span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
									<card.icon className="size-5" />
								</span>
								<div>
									<div className="text-sm font-semibold">{card.title}</div>
									<div className="mt-1 space-y-1 text-xs text-muted-foreground">
										{card.lines.map((line) => (
											<p key={line}>{line}</p>
										))}
									</div>
									{card.links && (
										<div className="mt-2 flex flex-wrap items-center gap-2">
											{card.links.map((link, index) => (
												<span
													key={link.href}
													className="flex items-center gap-2"
												>
													{index > 0 && <span className="text-border">·</span>}
													<a
														className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
														href={link.href}
														target="_blank"
													>
														{link.label}
														<ExternalLink className="size-3" />
													</a>
												</span>
											))}
										</div>
									)}
								</div>
							</div>
						))}
					</div>

					<div className="relative flex min-h-[340px] flex-col justify-end overflow-hidden rounded-2xl border bg-muted shadow-sm lg:col-span-7">
						<Image
							alt="Mapa estilizado de la Colonia San Benito, San Salvador, con la ubicación de Veterinaria San Roque"
							className="absolute inset-0 size-full object-cover"
							fill
							sizes="(min-width: 1024px) 55vw, 100vw"
							src="https://lh3.googleusercontent.com/aida-public/AB6AXuBo0NVzR-5-hvMfyxohxJSvbymg6XWz5XqG7b62zU0zScIi_oBl732D22pRJjlgqbB_dQephy2EZO6zMA29p_rCqOF1obkFIRDHN5z7scx8Gd7l1atT131InrEDLLQXpIJH9Eh2xUEta_CuyXTZ0_CSWyh89H5KXenr94pwPQC9H05rV0Vlz_vwDVlcnrcgXPkVoFzHlAmOLDdIK3IFKJWUMawwaNPFMIjKXHOk4LBEaPhN_ef7roFt"
						/>
						<div className="relative m-4 max-w-md rounded-xl border bg-card/95 p-4 shadow-md backdrop-blur-md">
							<div className="mb-1 flex items-center gap-2">
								<span className="size-2.5 rounded-full bg-primary" />
								<span className="text-sm font-semibold">
									Veterinaria San Roque Central
								</span>
							</div>
							<p className="mb-3 text-xs text-muted-foreground">
								Zona San Benito, frente a Plaza San Benito. Estacionamiento
								privado gratuito con seguridad 24 horas.
							</p>
							<div className="flex items-center gap-2">
								<a
									className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
									href="https://maps.google.com/?q=San+Benito+San+Salvador"
									target="_blank"
								>
									<Navigation className="size-3.5" />
									Iniciar Ruta GPS
								</a>
								<a
									className="inline-flex items-center gap-1 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium"
									href="tel:+50322578900"
								>
									<Phone className="size-3.5" />
									Llamar antes de llegar
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
