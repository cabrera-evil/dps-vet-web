import {
	AdministrationContext,
	FollowUpStatus,
	TreatmentStatus,
} from '@/constants/enum';
import type { OwnerCarePlan, TreatmentPlan } from '@/types/treatment.type';
import { getEndDate, getNextApplication } from '@/utils/treatment';
import {
	formatDose,
	formatDuration,
	formatFrequency,
} from '@/utils/treatment-format';
import { parseISO } from 'date-fns';

/** Allow-list mapper: `internalNotes`, application notes and reactions never reach the owner. */
export function toOwnerCarePlan(plan: TreatmentPlan): OwnerCarePlan {
	const medications = plan.orders
		.filter((order) => order.status === TreatmentStatus.ACTIVE)
		.map((order) => ({
			name: order.medicationName,
			dose: formatDose(order),
			frequency: formatFrequency(order.frequencyHours),
			duration: formatDuration(order),
			context: order.context,
			instructions: order.instructions,
			nextApplicationAt:
				order.context === AdministrationContext.CLINIC
					? getNextApplication(order)?.scheduledAt
					: undefined,
			endsAt: getEndDate(parseISO(order.startsAt), order).toISOString(),
		}));
	const nextVisitAt = medications
		.map((medication) => medication.nextApplicationAt)
		.filter((value): value is string => !!value)
		.sort()[0];

	return {
		diagnosis: plan.diagnosis,
		medications,
		instructions: plan.ownerInstructions,
		nextVisitAt,
		followUp:
			plan.followUp?.status === FollowUpStatus.PENDING
				? {
						recommendedDate: plan.followUp.recommendedDate,
						reason: plan.followUp.reason,
					}
				: undefined,
	};
}
