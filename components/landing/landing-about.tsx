import { BookOpen } from 'lucide-react';
import Image from 'next/image';

const METRICS = [
	{ id: 'patients', value: '+12,000', label: 'Mascotas atendidas' },
	{ id: 'satisfaction', value: '98.7%', label: 'Satisfacción tutores' },
	{ id: 'coverage', value: '24/7', label: 'Presencia ininterrumpida' },
];

export function LandingAbout() {
	return (
		<section className="border-y bg-card py-16 lg:py-20" id="nosotros">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
					<div className="relative lg:col-span-6">
						<div className="relative h-[400px] overflow-hidden rounded-2xl border shadow-md">
							<Image
								alt="Dra. Elena San Roque junto a su equipo médico veterinario en un laboratorio clínico moderno"
								className="object-cover"
								fill
								sizes="(min-width: 1024px) 45vw, 100vw"
								src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpbCu3ZohxZeeOrJZJJMd4n9Zi9sThlxOjcnJMkAlbght8hG65C1Epa0bJb0pWMtrSF9K4JTGoRNMnL1quedKE6nBJeqCPz7nRfWhDy5DDVg1zqX0QmPfGTODeRzXIBuW32f8nXBGPxqK-BT7m4ovqWDt-1eRi8ZFbm9Tjju7TDSdIbRkmdljrIlbh_Lb_l8s61hZ26LW2wEEVDCQQpF00jKSzlJGGP6oNmoRYtnr7kTKw04ayyuQa"
							/>
						</div>
						<div className="absolute -right-2 -bottom-5 max-w-xs rounded-xl border bg-foreground p-4 text-background shadow-lg sm:right-6">
							<div className="flex items-center gap-3">
								<div className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
									ES
								</div>
								<div>
									<div className="text-sm font-semibold">
										Dra. Elena San Roque
									</div>
									<div className="text-[11px] text-background/70">
										Directora Médica · Especialista en Cirugía
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="lg:col-span-6">
						<div className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium tracking-wider text-primary uppercase">
							<BookOpen className="size-3.5" />
							Medicina con Propósito
						</div>
						<h2 className="mb-4 text-2xl font-semibold tracking-tight">
							Dignificando la medicina veterinaria en El Salvador
						</h2>
						<p className="mb-4 leading-relaxed text-muted-foreground">
							Veterinaria San Roque nació con la convicción de que los miembros
							no humanos de nuestras familias merecen la misma exactitud
							diagnóstica, asepsia quirúrgica y calidez asistencial que la
							medicina humana contemporánea.
						</p>
						<p className="mb-6 leading-relaxed text-muted-foreground">
							Bajo la dirección de la <strong>Dra. Elena San Roque</strong>,
							nuestro hospital ha dejado atrás las prácticas empíricas para
							estructurar protocolos biomédicos reproducibles, sustentados en
							tecnología de punta e insumos anestésicos de grado hospitalario
							internacional.
						</p>
						<div className="grid grid-cols-2 gap-4 border-t pt-4 sm:grid-cols-3">
							{METRICS.map((metric) => (
								<div key={metric.id}>
									<div className="text-2xl font-bold tracking-tight text-primary">
										{metric.value}
									</div>
									<div className="text-xs text-muted-foreground">
										{metric.label}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
