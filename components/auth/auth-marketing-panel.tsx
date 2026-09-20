import { LiveClock } from '@/components/auth/live-clock';
import {
	clinicHighlights,
	clinicStaffOnDuty,
} from '@/components/auth/mocks/clinic-highlights.mock';
import { Activity } from 'lucide-react';

export function AuthMarketingPanel() {
	return (
		<section className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-zinc-900 p-10 text-zinc-50 lg:flex xl:p-14">
			<div className="flex items-center justify-between gap-4">
				<div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur-md">
					<span className="size-2 animate-pulse rounded-full bg-primary" />
					<span className="text-xs font-medium tracking-wide">
						Urgencias 24/7 activas
					</span>
				</div>
				<div className="text-right text-xs text-zinc-400">
					<p>Hora local</p>
					<p className="font-semibold text-zinc-50">
						<LiveClock />
					</p>
				</div>
			</div>

			<div className="max-w-xl py-8">
				<span className="text-xs font-semibold tracking-widest text-primary uppercase">
					Infraestructura médica especializada
				</span>
				<h2 className="mt-2 mb-4 text-3xl font-semibold tracking-tight text-balance">
					Cuidado veterinario de precisión y alta complejidad.
				</h2>
				<p className="mb-8 leading-relaxed text-zinc-300">
					Plataforma centralizada de diagnósticos, quirófanos de alta frecuencia
					y farmacovigilancia veterinaria con trazabilidad continua.
				</p>

				<div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
					{clinicHighlights.map((highlight) => (
						<div
							key={highlight.id}
							className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-colors hover:border-primary/40"
						>
							<highlight.icon className="mb-2 size-6 text-primary" />
							<p className="text-lg font-semibold text-zinc-50">
								{highlight.value}
							</p>
							<p className="mt-0.5 text-sm text-zinc-400">{highlight.label}</p>
						</div>
					))}
					<div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm sm:col-span-2">
						<div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
							<div className="flex items-center gap-2">
								<Activity className="size-4 text-primary" />
								<span className="text-sm font-semibold text-zinc-50">
									Equipo de turno clínico
								</span>
							</div>
							<span className="text-xs text-zinc-400">Turno nocturno</span>
						</div>
						<div className="grid grid-cols-1 gap-3 pt-1 md:grid-cols-2">
							{clinicStaffOnDuty.map((staff) => (
								<div key={staff.id} className="flex items-center gap-2.5">
									<div className="flex size-8 items-center justify-center rounded-full border border-primary/40 bg-primary/20 text-xs font-bold text-primary">
										{staff.initials}
									</div>
									<div>
										<p className="text-sm leading-tight font-medium text-zinc-50">
											{staff.name}
										</p>
										<p className="text-xs text-zinc-400">{staff.role}</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			<div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs text-zinc-400">
				<span>Certificación sanitaria MAG SV-VET 2025</span>
				<span>ISO 9001:2015 Clínicas</span>
			</div>
		</section>
	);
}
