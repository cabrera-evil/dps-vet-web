import { MedicalHistoryFormDialog } from '@/components/medical-histories/medical-history-form-dialog';
import {
	Alert,
	AlertAction,
	AlertDescription,
	AlertTitle,
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ClinicalAlertType, MedicalHistoryType } from '@/constants/enum';
import { ADVERSE_REACTION_SEVERITY_LABEL } from '@/constants/treatment';
import { MEDICAL_HISTORY_NAME_MAX_LENGTH } from '@/schemas/medical-history.schema';
import type { MedicationApplication } from '@/types/treatment.type';
import { TriangleAlert } from 'lucide-react';

const NAME_SEPARATOR = ' — ';

interface AdverseReactionCalloutProps {
	petId: string;
	medicationName: string;
	reaction: NonNullable<MedicationApplication['adverseReaction']>;
}

export function AdverseReactionCallout({
	petId,
	medicationName,
	reaction,
}: AdverseReactionCalloutProps) {
	const description = reaction.description.trim();
	const room =
		MEDICAL_HISTORY_NAME_MAX_LENGTH -
		medicationName.length -
		NAME_SEPARATOR.length;
	const shortDescription =
		description.length <= room
			? description
			: `${description.slice(0, Math.max(room - 1, 0)).trimEnd()}…`;
	const name = (
		room > 1
			? `${medicationName}${NAME_SEPARATOR}${shortDescription}`
			: medicationName
	).slice(0, MEDICAL_HISTORY_NAME_MAX_LENGTH);

	return (
		<Alert className="has-data-[slot=alert-action]:pr-2.5">
			<TriangleAlert aria-hidden="true" />
			<AlertTitle>
				Reacción adversa detectada · {medicationName} ·{' '}
				{ADVERSE_REACTION_SEVERITY_LABEL[reaction.severity]}
			</AlertTitle>
			<AlertDescription>{description}</AlertDescription>
			<AlertAction className="static col-span-full mt-2">
				<MedicalHistoryFormDialog
					mode="create"
					petId={petId}
					trigger={
						<Button size="sm" variant="outline">
							Registrar como alerta del paciente
						</Button>
					}
					initialValues={{
						type: MedicalHistoryType.MEDICAL,
						name,
						description,
						isAlert: true,
						alertType: ClinicalAlertType.ADVERSE_REACTION,
					}}
				/>
			</AlertAction>
		</Alert>
	);
}
