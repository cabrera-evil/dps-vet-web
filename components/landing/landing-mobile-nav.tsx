import { CalendarDays, LayoutDashboard, Menu, PawPrint } from 'lucide-react';

const TABS = [
	{ href: '#inicio', label: 'Resumen', icon: LayoutDashboard, active: true },
	{ href: '#agendar', label: 'Agenda', icon: CalendarDays, active: false },
	{ href: '#servicios', label: 'Pacientes', icon: PawPrint, active: false },
	{ href: '#contacto', label: 'Más', icon: Menu, active: false },
];

export function LandingMobileNav() {
	return (
		<nav className="pb-safe fixed bottom-0 left-0 z-50 flex h-16 w-full items-center justify-around border-t bg-background px-2 shadow-[0_-2px_6px_-1px_rgba(15,23,42,0.08)] md:hidden">
			{TABS.map((tab) => (
				<a
					key={tab.href}
					className={
						tab.active
							? 'flex flex-col items-center justify-center py-1 font-semibold text-primary'
							: 'flex flex-col items-center justify-center py-1 text-muted-foreground'
					}
					href={tab.href}
				>
					<tab.icon className="size-5" />
					<span className="mt-0.5 text-[11px]">{tab.label}</span>
				</a>
			))}
		</nav>
	);
}
