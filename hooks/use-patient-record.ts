import type { ClinicalSummary } from '@/app/api/clinical-summary/clinical-summary.types';
import { queryClient } from '@/constants/environment';
import { useGet } from '@/hooks/use-rest';
import type { ConsultationListItem } from '@/types/consultation.type';
import type { MedicalHistoryEntry } from '@/types/medical-history.type';
import type { PatientRecordData } from '@/types/patient-record.type';

/** Encounters shown in the Consultas tab; pagination ("load more") is pending. */
const ENCOUNTERS_PAGE_SIZE = 50;
const HISTORIES_PAGE_SIZE = 100;

export function usePatientClinicalSummary(patientId: string, enabled = true) {
	return useGet<ClinicalSummary>(
		{ path: `/pets/${patientId}/clinical-summary` },
		{ enabled }
	);
}

/** Composes the three reads behind the patient's record screen. */
export function usePatientRecord(patientId: string, enabled = true) {
	const summary = usePatientClinicalSummary(patientId, enabled);
	const encounters = useGet<ConsultationListItem[]>(
		{
			path: `/pets/${patientId}/encounters`,
			params: { pageSize: ENCOUNTERS_PAGE_SIZE },
		},
		{ enabled }
	);
	const histories = useGet<MedicalHistoryEntry[]>(
		{
			path: `/pets/${patientId}/medical-histories`,
			params: { pageSize: HISTORIES_PAGE_SIZE },
		},
		{ enabled }
	);

	const queries = [summary, encounters, histories];
	const data: PatientRecordData | undefined =
		summary.data && encounters.data && histories.data
			? {
					patient: {
						...summary.data.patient,
						ownerName: summary.data.owner?.name,
						ownerPhone: summary.data.owner?.phone,
						ownerEmail: summary.data.owner?.email,
					},
					summary: {
						alerts: summary.data.alerts,
						activeProblems: summary.data.activeProblems,
						weightHistory: summary.data.weightHistory,
						currentMedications: summary.data.currentMedications,
						nextFollowUp: summary.data.nextFollowUp,
					},
					histories: histories.data,
					consultations: encounters.data,
				}
			: undefined;

	return {
		data,
		error: queries.find((query) => query.error)?.error ?? null,
		refetch: () => Promise.all(queries.map((query) => query.refetch())),
	};
}

export function invalidateConsultation(consultationId: string) {
	return queryClient.invalidateQueries({
		queryKey: [`/consultations/${consultationId}`],
	});
}

/** Query keys are the request paths, so each affected read is invalidated by path. */
export function invalidatePatientRecord(patientId: string) {
	return Promise.all(
		['clinical-summary', 'encounters', 'medical-histories'].map((resource) =>
			queryClient.invalidateQueries({
				queryKey: [`/pets/${patientId}/${resource}`],
			})
		)
	);
}
