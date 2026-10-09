import type { ControlDecision } from '@/schemas/treatment.schema';
import { toOptions, type SelectOption } from './clinical';
import {
	AdministrationContext,
	AdministrationRoute,
	AdverseReactionSeverity,
	ApplicationStatus,
	DoseUnit,
	DurationUnit,
	FollowUpEvolution,
	FollowUpStatus,
	TreatmentOutcome,
	TreatmentStatus,
} from './enum';

export const TREATMENT_STATUS_LABEL: Record<TreatmentStatus, string> = {
	[TreatmentStatus.PLANNED]: 'Planificado',
	[TreatmentStatus.ACTIVE]: 'Activo',
	[TreatmentStatus.COMPLETED]: 'Completado',
	[TreatmentStatus.SUSPENDED]: 'Suspendido',
	[TreatmentStatus.CANCELLED]: 'Cancelado',
};

export const APPLICATION_STATUS_LABEL: Record<ApplicationStatus, string> = {
	[ApplicationStatus.SCHEDULED]: 'Programada',
	[ApplicationStatus.COMPLETED]: 'Completada',
	[ApplicationStatus.SKIPPED]: 'Omitida',
	[ApplicationStatus.CANCELLED]: 'Cancelada',
};

export const FOLLOW_UP_STATUS_LABEL: Record<FollowUpStatus, string> = {
	[FollowUpStatus.PENDING]: 'Pendiente',
	[FollowUpStatus.COMPLETED]: 'Completado',
	[FollowUpStatus.CANCELLED]: 'Cancelado',
};

export const ADMINISTRATION_CONTEXT_LABEL: Record<
	AdministrationContext,
	string
> = {
	[AdministrationContext.HOME]: 'En casa',
	[AdministrationContext.CLINIC]: 'En clínica',
};

export const ADMINISTRATION_ROUTE_LABEL: Record<AdministrationRoute, string> = {
	[AdministrationRoute.ORAL]: 'Oral',
	[AdministrationRoute.IM]: 'Intramuscular',
	[AdministrationRoute.IV]: 'Intravenosa',
	[AdministrationRoute.SC]: 'Subcutánea',
	[AdministrationRoute.TOPICAL]: 'Tópica',
	[AdministrationRoute.OTHER]: 'Otra',
};

export const ADMINISTRATION_ROUTE_SHORT_LABEL: Record<
	AdministrationRoute,
	string
> = {
	[AdministrationRoute.ORAL]: 'Oral',
	[AdministrationRoute.IM]: 'IM',
	[AdministrationRoute.IV]: 'IV',
	[AdministrationRoute.SC]: 'SC',
	[AdministrationRoute.TOPICAL]: 'Tópica',
	[AdministrationRoute.OTHER]: 'Otra vía',
};

export const DOSE_UNIT_LABEL: Record<DoseUnit, string> = {
	[DoseUnit.MG]: 'mg',
	[DoseUnit.ML]: 'ml',
	[DoseUnit.TABLET]: 'tableta(s)',
	[DoseUnit.CAPSULE]: 'cápsula(s)',
	[DoseUnit.DROPS]: 'gotas',
	[DoseUnit.OTHER]: 'otra unidad',
};

export const DURATION_UNIT_LABEL: Record<DurationUnit, string> = {
	[DurationUnit.DAYS]: 'días',
	[DurationUnit.WEEKS]: 'semanas',
	[DurationUnit.APPLICATIONS]: 'aplicaciones',
};

export const TREATMENT_OUTCOME_LABEL: Record<TreatmentOutcome, string> = {
	[TreatmentOutcome.COMPLETED]: 'Completado satisfactoriamente',
	[TreatmentOutcome.SUSPENDED]: 'Suspendido',
	[TreatmentOutcome.CHANGED]: 'Cambiado',
	[TreatmentOutcome.OTHER]: 'Otro',
};

export const ADVERSE_REACTION_SEVERITY_LABEL: Record<
	AdverseReactionSeverity,
	string
> = {
	[AdverseReactionSeverity.MILD]: 'Leve',
	[AdverseReactionSeverity.MODERATE]: 'Moderada',
	[AdverseReactionSeverity.SEVERE]: 'Grave',
};

export const FOLLOW_UP_EVOLUTION_LABEL: Record<FollowUpEvolution, string> = {
	[FollowUpEvolution.IMPROVED]: 'Mejoró',
	[FollowUpEvolution.UNCHANGED]: 'Sin cambios',
	[FollowUpEvolution.WORSENED]: 'Empeoró',
	[FollowUpEvolution.RESOLVED]: 'Resuelto',
};

export const CONTROL_DECISION_LABEL: Record<ControlDecision, string> = {
	CONTINUE: 'Continuar',
	MODIFY: 'Modificar',
	FINISH: 'Finalizar',
};

export const ADMINISTRATION_CONTEXT_OPTIONS = toOptions(
	ADMINISTRATION_CONTEXT_LABEL
);
export const ADMINISTRATION_ROUTE_OPTIONS = toOptions(
	ADMINISTRATION_ROUTE_LABEL
);
export const DOSE_UNIT_OPTIONS = toOptions(DOSE_UNIT_LABEL);
export const DURATION_UNIT_OPTIONS = toOptions(DURATION_UNIT_LABEL);
export const TREATMENT_OUTCOME_OPTIONS = toOptions(TREATMENT_OUTCOME_LABEL);
export const ADVERSE_REACTION_SEVERITY_OPTIONS = toOptions(
	ADVERSE_REACTION_SEVERITY_LABEL
);
export const FOLLOW_UP_EVOLUTION_OPTIONS = toOptions(FOLLOW_UP_EVOLUTION_LABEL);
export const CONTROL_DECISION_OPTIONS = toOptions(CONTROL_DECISION_LABEL);

export const MAX_DURATION: Record<DurationUnit, number> = {
	[DurationUnit.DAYS]: 365,
	[DurationUnit.WEEKS]: 52,
	[DurationUnit.APPLICATIONS]: 200,
};

export const PRN_FREQUENCY = 'PRN';
export const CUSTOM_FREQUENCY = 'CUSTOM';

export const FREQUENCY_OPTIONS: SelectOption[] = [
	{ value: '4', label: 'Cada 4 horas' },
	{ value: '6', label: 'Cada 6 horas' },
	{ value: '8', label: 'Cada 8 horas' },
	{ value: '12', label: 'Cada 12 horas' },
	{ value: '24', label: 'Cada 24 horas' },
	{ value: PRN_FREQUENCY, label: 'Según necesidad' },
	{ value: CUSTOM_FREQUENCY, label: 'Otra frecuencia' },
];

export const ALREADY_REGISTERED_MESSAGE = 'Esta aplicación ya fue registrada';

export const CONTROL_ALREADY_REGISTERED_MESSAGE =
	'Este control ya fue registrado';

export const APPLICATION_SITE_OTHER = 'Otro';

export const APPLICATION_SITE_OPTIONS: SelectOption[] = [
	'Muslo derecho',
	'Muslo izquierdo',
	'Región lumbar',
	'Dorso/escápula',
	APPLICATION_SITE_OTHER,
].map((site) => ({ value: site, label: site }));

export const INJECTABLE_ROUTES: AdministrationRoute[] = [
	AdministrationRoute.IM,
	AdministrationRoute.IV,
	AdministrationRoute.SC,
];

/** Temporal: id del único paciente con datos de ejemplo; se elimina al integrar con la API. */
export const TREATMENTS_MOCK_PET_ID =
	process.env.NEXT_PUBLIC_TREATMENTS_MOCK_PET_ID;

export const TREATMENT_VIEWS = ['activos', 'historial'] as const;
