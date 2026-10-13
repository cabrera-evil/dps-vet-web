import type { TreatmentPlan } from '@/types/treatment.type';
import type {
	MedicationAdministrationDocument,
	TreatmentMedicationInput,
} from './treatment-plan.schema';

/** Same shapes the UI consumes, so responses need no client-side mapping. */
export type TreatmentPlanDetail = TreatmentPlan;

export type DocumentWrite<T> = { id: string; data: T };

export type AdministrationWrite =
	DocumentWrite<MedicationAdministrationDocument>;

export type TreatmentStaff = { id: string; name: string };

/** Replaces open orders with new ones, as decided in a follow-up control. */
export type TreatmentModification = {
	replacedOrderIds: string[];
	reason: string;
	medications: TreatmentMedicationInput[];
};
