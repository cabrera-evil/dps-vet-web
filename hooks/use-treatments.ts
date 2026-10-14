import type { FollowUpControlDetail } from '@/app/api/consultations/follow-up-control.types';
import { queryClient } from '@/constants/environment';
import { invalidatePatientRecord } from '@/hooks/use-patient-record';
import { useGet } from '@/hooks/use-rest';
import { create } from '@/lib/rest';
import type {
	CloseTreatmentInput,
	RegisterApplicationInput,
	RegisterControlInput,
	SkipApplicationInput,
	TreatmentPlan,
} from '@/types/treatment.type';
import { getErrorMessage } from '@/utils/http-error';
import {
	toApplicationPayload,
	toControlPayload,
} from '@/utils/treatment-payload';
import { useMutation } from '@tanstack/react-query';

const plansPath = (petId: string) => `/pets/${petId}/treatment-plans`;

const planPath = (treatmentId: string) => `/treatment-plans/${treatmentId}`;

const followUpPath = (followUpId: string) => `/follow-ups/${followUpId}`;

/** Surfaces the server's message (409, 422...) instead of the generic HTTP one. */
async function post<T>(
	path: string,
	payload: Record<string, unknown>
): Promise<T> {
	try {
		return await create<T>({ path, payload });
	} catch (error) {
		throw new Error(getErrorMessage(error));
	}
}

export const invalidatePlans = (petId: string) =>
	queryClient.invalidateQueries({ queryKey: [plansPath(petId)] });

/** The detail screen may have read the plan on its own; the list and the summary also change. */
const invalidateTreatmentData = (petId: string, treatmentId?: string) =>
	Promise.all([
		invalidatePlans(petId),
		treatmentId
			? queryClient.invalidateQueries({ queryKey: [planPath(treatmentId)] })
			: undefined,
		invalidatePatientRecord(petId),
	]);

/** Plan mutations also change what any open follow-up control screen shows. */
const invalidateTreatments = (petId: string, treatmentId?: string) =>
	Promise.all([
		invalidateTreatmentData(petId, treatmentId),
		queryClient.invalidateQueries({
			predicate: ({ queryKey }) =>
				typeof queryKey[0] === 'string' &&
				queryKey[0].startsWith(`${followUpPath('')}`),
		}),
	]);

export function useTreatmentPlans(petId: string, enabled = true) {
	return useGet<TreatmentPlan[]>({ path: plansPath(petId) }, { enabled });
}

/** Reads the plan from the patient's list; falls back to its own request when it is not there. */
export function useTreatmentPlan(petId: string, id: string, enabled = true) {
	const plans = useTreatmentPlans(petId, enabled);
	const listed = plans.data?.find((plan) => plan.id === id);
	const single = useGet<TreatmentPlan>(
		{ path: planPath(id) },
		{ enabled: enabled && plans.isSuccess && !listed }
	);

	return {
		data: listed ?? single.data,
		error: plans.error ?? single.error,
		isLoading: plans.isLoading || single.isLoading,
		refetch: () => Promise.all([plans.refetch(), !listed && single.refetch()]),
	};
}

export function useFollowUpControl(followUpId: string, enabled = true) {
	return useGet<FollowUpControlDetail>(
		{ path: followUpPath(followUpId) },
		{ enabled }
	);
}

export function useRegisterApplication() {
	return useMutation<TreatmentPlan, Error, RegisterApplicationInput>({
		mutationFn: ({ treatmentId, applicationId, values }) =>
			post<TreatmentPlan>(
				`${planPath(treatmentId)}/applications/${applicationId}/register`,
				{ ...toApplicationPayload(values) }
			),
		onSuccess: (_plan, { petId, treatmentId }) =>
			invalidateTreatments(petId, treatmentId),
	});
}

export function useSkipApplication() {
	return useMutation<TreatmentPlan, Error, SkipApplicationInput>({
		mutationFn: ({ treatmentId, applicationId, reason }) =>
			post<TreatmentPlan>(
				`${planPath(treatmentId)}/applications/${applicationId}/skip`,
				{ reason: reason.trim() }
			),
		onSuccess: (_plan, { petId, treatmentId }) =>
			invalidateTreatments(petId, treatmentId),
	});
}

export function useCloseTreatment() {
	return useMutation<TreatmentPlan, Error, CloseTreatmentInput>({
		mutationFn: ({ treatmentId, action, outcome, reason, expectedUpdatedAt }) =>
			post<TreatmentPlan>(`${planPath(treatmentId)}/close`, {
				action,
				outcome,
				reason: reason?.trim() || undefined,
				expectedUpdatedAt,
			}),
		onSuccess: (_plan, { petId, treatmentId }) =>
			invalidateTreatments(petId, treatmentId),
	});
}

export function useRegisterControl() {
	return useMutation<FollowUpControlDetail, Error, RegisterControlInput>({
		mutationFn: ({ followUpId, values }) =>
			post<FollowUpControlDetail>(`${followUpPath(followUpId)}/control`, {
				...toControlPayload(values),
			}),
		onSuccess: (_detail, { petId, followUpId }) =>
			Promise.all([
				invalidateTreatmentData(petId),
				// Refetching now would show "already registered" before navigating.
				queryClient.invalidateQueries({
					queryKey: [followUpPath(followUpId)],
					refetchType: 'none',
				}),
			]),
		// The plans may have changed: retrying needs the current data.
		onError: (_error, { petId, followUpId }) =>
			Promise.all([
				invalidatePlans(petId),
				queryClient.invalidateQueries({ queryKey: [followUpPath(followUpId)] }),
			]),
	});
}
