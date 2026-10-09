import type { WithId } from '@/app/api/_shared/repository/repository.types';
import type { ClinicalEncounter } from '@/app/api/encounters/encounter.schema';
import type { Pet } from '@/app/api/pets/pet.schema';
import type { ClinicalAlertType, ItemStatus } from '@/constants/enum';

type SummaryPatient = Pick<
	Pet,
	| 'name'
	| 'species'
	| 'breed'
	| 'birthDate'
	| 'sex'
	| 'sterilized'
	| 'color'
	| 'markings'
	| 'microchip'
> & {
	id: string;
	recordNumber: string;
	status: ItemStatus;
};

export type ClinicalSummary = {
	patient: SummaryPatient;
	owner?: { name: string; phone: string; email: string };
	alerts: {
		id: string;
		type: ClinicalAlertType;
		title: string;
		detail?: string;
	}[];
	activeProblems: { id: string; name: string; statusLabel: string }[];
	weightHistory: { valueKg: number; measuredAt: string }[];
	/** Always empty until treatments exist (Phase 2). */
	currentMedications: { id: string; name: string; instructions: string }[];
	nextFollowUp?: {
		id: string;
		recommendedDate: string;
		reason: string;
		sourceConsultationId: string;
	};
	lastConsultation?: WithId<ClinicalEncounter>;
};
