import type {
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
} from '@/constants/enum';
import type {
	ApplicationFormValues,
	ControlDecision,
	ControlFormValues,
	TreatmentFormValues,
} from '@/schemas/treatment.schema';

export interface MedicationApplication {
	id: string;
	sequence: number;
	total: number;
	scheduledAt: string;
	status: ApplicationStatus;
	administeredAt?: string;
	administeredByName?: string;
	actualDose?: number;
	actualDoseUnit?: DoseUnit;
	actualRoute?: AdministrationRoute;
	adjustmentReason?: string;
	site?: string;
	notes?: string;
	skipReason?: string;
	adverseReaction?: {
		description: string;
		severity: AdverseReactionSeverity;
		action?: string;
	};
}

export interface MedicationOrder {
	id: string;
	medicationId: string;
	medicationName: string;
	presentation?: string;
	dose: number;
	doseUnit: DoseUnit;
	route: AdministrationRoute;
	frequencyHours?: number; // undefined = PRN
	durationValue: number;
	durationUnit: DurationUnit;
	startsAt: string;
	context: AdministrationContext;
	firstDoseInConsultation?: boolean; // la aplicación 1 se hizo en la consulta
	instructions: string; // visible para el propietario
	status: TreatmentStatus;
	stopReason?: string;
	stoppedAt?: string;
	replacedByOrderId?: string;
	applications: MedicationApplication[];
}

export interface TreatmentFollowUp {
	id: string;
	recommendedDate: string;
	reason: string;
	status: FollowUpStatus;
}

export interface ControlRecord {
	id: string;
	followUpId: string;
	recommendedDate: string;
	registeredAt: string;
	reason: string;
	evolution: FollowUpEvolution;
	weightKg?: number;
	temperatureC?: number;
	clinicalNotes?: string;
	treatmentResponse?: string;
	decision?: ControlDecision; // undefined si el plan ya estaba cerrado
}

export interface TreatmentPlan {
	id: string;
	petId: string;
	sourceConsultationId: string;
	sourceConsultationLabel: string;
	diagnosis: string;
	status: TreatmentStatus;
	startsAt: string;
	endsAt?: string;
	ownerInstructions?: string; // visible para el propietario
	internalNotes?: string; // solo personal
	followUp?: TreatmentFollowUp; // el más reciente; los controles registrados quedan en `controls`
	controls?: ControlRecord[];
	outcome?: { result: TreatmentOutcome; notes?: string; closedAt: string };
	orders: MedicationOrder[];
}

export interface PendingApplication {
	plan: TreatmentPlan;
	order: MedicationOrder;
	application: MedicationApplication;
}

export interface ApplicationTarget {
	petId: string;
	treatmentId: string;
	orderId: string;
	applicationId: string;
}

export interface RegisterApplicationInput extends ApplicationTarget {
	values: ApplicationFormValues;
	administeredByName?: string;
}

export interface SkipApplicationInput extends ApplicationTarget {
	reason: string;
}

export type CloseTreatmentAction = 'COMPLETE' | 'SUSPEND' | 'CANCEL';

export interface CloseTreatmentInput {
	petId: string;
	treatmentId: string;
	action: CloseTreatmentAction;
	outcome?: TreatmentOutcome;
	reason?: string;
}

export interface CreateTreatmentsInput {
	petId: string;
	consultationId: string;
	consultationLabel: string;
	consultationAt: Date;
	treatments: TreatmentFormValues[];
	followUp?: { recommendedDate: string; reason: string };
}

export interface RegisterControlInput {
	petId: string;
	followUpId: string;
	values: ControlFormValues;
}

export interface OwnerCareMedication {
	name: string;
	dose: string;
	frequency: string;
	duration: string;
	context: AdministrationContext;
	instructions: string;
	nextApplicationAt?: string;
	endsAt?: string;
}

/** What the owner may see: built from an allow-list, never from internal fields. */
export interface OwnerCarePlan {
	diagnosis: string;
	medications: OwnerCareMedication[];
	instructions?: string;
	nextVisitAt?: string;
	followUp?: { recommendedDate: string; reason: string };
}
