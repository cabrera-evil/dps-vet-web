import { ClinicalAlertList } from '@/components/clinical/clinical-alert-list';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type {
	ClinicalAlert,
	WeightMeasurement,
} from '@/types/patient-record.type';
import { getAgeLabel } from '@/utils/age';

export interface ConsultationPatientContext {
	name: string;
	species: string;
	breed: string;
	birthDate: string;
	lastWeight?: WeightMeasurement;
	alerts: ClinicalAlert[];
}

export interface ConsultationSectionLink {
	id: string;
	label: string;
}

interface ConsultationPatientBarProps {
	patient: ConsultationPatientContext;
	sections?: ConsultationSectionLink[];
	sticky?: boolean;
}

/** Compact patient context that stays visible while the vet works. */
export function ConsultationPatientBar({
	patient,
	sections,
	sticky = false,
}: ConsultationPatientBarProps) {
	return (
		<div
			className={cn(
				'flex flex-col gap-2 border-b bg-background/95 py-3 backdrop-blur supports-backdrop-filter:bg-background/80',
				sticky && 'sticky top-0 z-20 -mx-4 px-4 md:-mx-6 md:px-6'
			)}
		>
			<div className="flex flex-wrap items-center gap-x-4 gap-y-2">
				<div className="flex items-center gap-3">
					<Avatar>
						<AvatarFallback>
							{patient.name.slice(0, 2).toUpperCase()}
						</AvatarFallback>
					</Avatar>
					<div>
						<p className="font-heading text-sm leading-tight font-semibold">
							{patient.name}
						</p>
						<p className="text-xs text-muted-foreground">
							{patient.species} · {patient.breed} ·{' '}
							{getAgeLabel(patient.birthDate)}
							{patient.lastWeight && ` · ${patient.lastWeight.valueKg} kg`}
						</p>
					</div>
				</div>
				<ClinicalAlertList alerts={patient.alerts} showEmpty={false} />
			</div>
			{sections && (
				<nav
					aria-label="Secciones de la consulta"
					className="-mb-1 flex gap-1 overflow-x-auto"
				>
					{sections.map((section) => (
						<a
							key={section.id}
							href={`#${section.id}`}
							className="rounded-md px-2 py-1 text-sm whitespace-nowrap text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
						>
							{section.label}
						</a>
					))}
				</nav>
			)}
		</div>
	);
}
