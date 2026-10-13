import type { TreatmentPlanDocument } from '@/app/api/treatment-plans/treatment-plan.schema';
import type {
	AdministrationWrite,
	DocumentWrite,
} from '@/app/api/treatment-plans/treatment-plan.types';
import type { FollowUpStatus } from '@/constants/enum';
import type { ControlRecord, TreatmentPlan } from '@/types/treatment.type';
import type { FollowUpControl } from './follow-up-control.schema';
import type { FollowUp } from './follow-up.schema';

export type FollowUpDetail = {
	id: string;
	petId: string;
	sourceConsultationId: string;
	recommendedDate: string;
	reason: string;
	status: FollowUpStatus;
};

export type FollowUpControlDetail = {
	followUp: FollowUpDetail;
	plans: TreatmentPlan[];
	lastControl?: ControlRecord;
};

/** Everything the control rules need, read inside the transaction. */
export type ControlSnapshot = {
	followUp: FollowUp;
	nextFollowUpExists: boolean;
	plans: DocumentWrite<TreatmentPlanDocument>[];
	administrationsByPlan: ReadonlyMap<string, AdministrationWrite[]>;
};

export type ControlWrites = {
	control: FollowUpControl;
	followUpUpdate: Pick<FollowUp, 'status' | 'completedAt' | 'controlId'>;
	nextFollowUp?: DocumentWrite<FollowUp>;
	plans: DocumentWrite<TreatmentPlanDocument>[];
	cancelled: AdministrationWrite[];
	created: AdministrationWrite[];
	operationCount: number;
};
