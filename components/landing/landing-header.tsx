import { Button } from '@/components/ui/button';
import {
	CalendarDays,
	LayoutDashboard,
	Phone,
	ShieldCheck,
	Stethoscope,
} from 'lucide-react';
import Link from 'next/link';

const NAV_LINKS = [
	{ href: '#inicio', label: 'Inicio' },
	{ href: '#servicios', label: 'Servicios' },
	{ href: '#por-que-san-roque', label: 'Por qué San Roque' },
	{ href: '#como-agendar', label: 'Cómo Agendar' },
	{ href: '#nosotros', label: 'Sobre Nosotros' },
	{ href: '#contacto', label: 'Contacto' },
];

export function LandingHeader() {
	return (
		<>
			<aside className="border-b bg-foreground px-4 py-2 text-background">
				<div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2.5 sm:flex-row">
					<div className="flex flex-wrap items-center justify-center gap-2.5 sm:justify-start">
						<span className="inline-flex items-center gap-1 rounded bg-destructive px-2 py-0.5 text-[10px] font-semibold tracking-wider text-destructive-foreground uppercase">
							<span className="size-1.5 animate-pulse rounded-full bg-background" />
							Urgencias 24/7
						</span>
						<span className="text-xs text-background/70">
							Médico veterinario en guardia presencial y quirófano activo en San
							Benito, San Salvador
						</span>
					</div>
					<div className="flex shrink-0 items-center gap-4 text-xs">
						<a
							className="flex items-center gap-1.5 font-medium transition-colors hover:text-primary"
							href="tel:+50322578900"
						>
							<Phone className="size-3.5 text-primary" />
							+503 2257-8900
						</a>
						<span className="hidden text-background/30 sm:inline">|</span>
						<span className="hidden items-center gap-1 text-background/70 sm:flex">
							<ShieldCheck className="size-3.5 text-primary" />
							Reg. MAG SV #4829-VT
						</span>
					</div>
				</div>
			</aside>

			<header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-background/95 px-4 shadow-sm backdrop-blur-md lg:px-8">
				<div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4">
					<div className="flex shrink-0 items-center gap-3">
						<Link className="group flex items-center gap-2.5" href="/">
							<div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-colors group-hover:bg-primary/80">
								<Stethoscope className="size-5" />
							</div>
							<div className="flex flex-col">
								<div className="flex items-center gap-1.5">
									<span className="text-lg leading-none font-bold tracking-tight">
										San Roque
									</span>
									<span className="hidden size-1.5 rounded-full bg-primary sm:inline-block" />
								</div>
								<span className="mt-0.5 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
									Clínica & Quirófano
								</span>
							</div>
						</Link>
						<div className="ml-1 hidden items-center rounded-full border bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground xl:inline-flex">
							<span className="mr-1.5 inline-block size-1.5 animate-pulse rounded-full bg-primary" />
							San Benito, San Salvador
						</div>
					</div>

					<nav className="hidden items-center gap-1 lg:flex xl:gap-1.5">
						{NAV_LINKS.map((link, index) => (
							<a
								key={link.href}
								className={
									index === 0
										? 'rounded-lg bg-muted px-3 py-2 text-xs font-semibold text-primary transition-colors'
										: 'rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
								}
								href={link.href}
							>
								{link.label}
							</a>
						))}
					</nav>

					<div className="flex shrink-0 items-center gap-2 sm:gap-3">
						<Link
							className="hidden items-center gap-1.5 rounded-lg border bg-muted px-3.5 py-2 text-xs font-semibold transition-colors hover:bg-muted/70 hover:text-primary sm:inline-flex"
							href="/dashboard"
							title="Acceso al portal para clientes, tutores y personal médico/administración"
						>
							<LayoutDashboard className="size-4 text-primary" />
							Portal Clínico
						</Link>
						<Button nativeButton={false} render={<a href="#agendar" />}>
							<CalendarDays />
							Agendar Cita
						</Button>
					</div>
				</div>
			</header>
		</>
	);
}
