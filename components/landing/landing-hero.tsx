import { heroProofPoints } from '@/components/landing/mocks/trust-highlights.mock';
import { Button } from '@/components/ui/button';
import { CalendarCheck, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

export function LandingHero() {
	return (
		<section
			className="relative overflow-hidden border-b bg-background pt-8 pb-16 lg:py-20"
			id="inicio"
		>
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--color-primary)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-primary)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-5 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"
			/>
			<div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
					<div className="flex flex-col items-start lg:col-span-7">
						<div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-muted px-3 py-1 text-xs text-muted-foreground">
							<span className="inline-block size-2 rounded-full bg-primary" />
							<span className="tracking-wide">
								Medicina Veterinaria Basada en Evidencia · San Salvador
							</span>
						</div>
						<h1 className="mb-4 text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">
							Salud, bienestar y cuidado clínico de vanguardia para tu mascota
						</h1>
						<p className="mb-6 max-w-2xl text-base text-muted-foreground text-balance sm:text-lg">
							Atención médica veterinaria integral con quirófano especializado,
							laboratorio clínico automatizado y expediente digital 24/7 en San
							Salvador.
						</p>

						<div className="mb-8 grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
							{heroProofPoints.map((point) => (
								<div
									key={point.id}
									className="flex items-center gap-2.5 rounded-lg border bg-card p-2.5 shadow-sm"
								>
									<point.icon className="size-5 text-primary" />
									<div className="leading-tight">
										<div className="text-sm font-semibold">{point.title}</div>
										<div className="text-[11px] text-muted-foreground">
											{point.description}
										</div>
									</div>
								</div>
							))}
						</div>

						<div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
							<Button
								className="h-auto justify-center px-6 py-3.5 text-sm"
								nativeButton={false}
								render={<a href="#agendar" />}
							>
								<CalendarCheck />
								Agendar Cita Online
							</Button>
							<Button
								className="h-auto justify-center px-5 py-3.5 text-sm"
								nativeButton={false}
								render={<a href="tel:+50322578900" />}
								variant="outline"
							>
								<span className="relative flex size-2.5">
									<span className="absolute inline-flex size-full animate-ping rounded-full bg-destructive opacity-75" />
									<span className="relative inline-flex size-2.5 rounded-full bg-destructive" />
								</span>
								Llamar Urgencias: +503 2257-8900
							</Button>
						</div>
						<p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
							<CheckCircle2 className="size-4 text-primary" />
							Sin cargos adicionales por gestión web. Confirmación instantánea
							por WhatsApp.
						</p>
					</div>

					<div className="relative lg:col-span-5">
						<div className="relative h-[420px] overflow-hidden rounded-2xl border bg-card shadow-lg">
							<Image
								alt="Veterinaria examinando a un golden retriever en una mesa de exploración clínica moderna"
								className="object-cover"
								fill
								priority
								sizes="(min-width: 1024px) 40vw, 100vw"
								src="https://lh3.googleusercontent.com/aida-public/AB6AXuDK6TeyhyJ6O9UJy1hetdGgBx_X4v5LwUjO0yeB0V3CjcIw2KtTsIEy8nFl75eq66xRLfEPhY5ZMoWhI9puqWSlBCWDL2pTKyAza30NvSOhsElkoTbTaX2kmktAoht4bW75JA13Fyky2jPTcymcvTuD-wYgGVfNq2NPt3BByoFiwMcrggc1GhnH3Ct1Z0-nMtdYspmpmmLOYF6YemhU7cw11tflv6o5I4oFJoX3OP7agSPHw7pv7B3h"
							/>
							<div className="pointer-events-none absolute top-4 right-4 left-4 flex items-center justify-between">
								<span className="inline-flex items-center gap-1.5 rounded-md bg-foreground/90 px-3 py-1 text-xs font-medium text-background backdrop-blur">
									<span className="size-2 animate-pulse rounded-full bg-primary" />
									Quirófano 1: En Operación
								</span>
								<span className="rounded-md bg-background/90 px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur">
									Dra. E. San Roque
								</span>
							</div>
							<div className="absolute right-4 bottom-4 left-4 rounded-xl border bg-card/95 p-4 shadow-md backdrop-blur-md">
								<div className="mb-2 flex items-center justify-between">
									<span className="text-sm font-semibold">
										Monitoreo Fisiológico Vital
									</span>
									<span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">
										Estable
									</span>
								</div>
								<div className="grid grid-cols-3 gap-2 border-t pt-2 text-center">
									<div>
										<div className="text-[10px] text-muted-foreground">
											FC (lpm)
										</div>
										<div className="text-sm font-bold">
											94{' '}
											<span className="text-[10px] font-normal text-muted-foreground">
												bpm
											</span>
										</div>
									</div>
									<div>
										<div className="text-[10px] text-muted-foreground">
											Temp (°C)
										</div>
										<div className="text-sm font-bold">
											38.4{' '}
											<span className="text-[10px] font-normal text-muted-foreground">
												°C
											</span>
										</div>
									</div>
									<div>
										<div className="text-[10px] text-muted-foreground">
											SpO2
										</div>
										<div className="text-sm font-bold text-primary">99%</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
