import { Badge } from '@/components/ui/badge';
import { MEDICAL_HISTORY_STATUS_LABEL } from '@/constants/clinical';
import { MedicalHistoryStatus } from '@/constants/enum';
import type { MedicalHistoryFormValues } from '@/schemas/medical-history.schema';
import type { MedicalHistoryEntry } from '@/types/medical-history.type';
import { formatMonthYear } from '@/utils/date';
import { TriangleAlert } from 'lucide-react';
import { MedicalHistoryFormDialog } from './medical-history-form-dialog';

interface MedicalHistoryItemProps {
	entry: MedicalHistoryEntry;
	canWrite: boolean;
	onSave: (values: MedicalHistoryFormValues, id?: string) => void;
}

export function MedicalHistoryItem({
	entry,
	canWrite,
	onSave,
}: MedicalHistoryItemProps) {
	return (
		<li className="flex items-start justify-between gap-3 py-3">
			<div className="flex min-w-0 flex-col gap-1">
				<div className="flex flex-wrap items-center gap-2">
					<h4 className="text-sm font-medium">{entry.name}</h4>
					<Badge
						variant={
							entry.status === MedicalHistoryStatus.RESOLVED
								? 'secondary'
								: 'outline'
						}
					>
						{MEDICAL_HISTORY_STATUS_LABEL[entry.status]}
					</Badge>
					{entry.isAlert && (
						<Badge variant="destructive">
							<TriangleAlert data-icon="inline-start" />
							Relevante
						</Badge>
					)}
				</div>
				{entry.approximateDate && (
					<p className="text-xs text-muted-foreground">
						Identificado: {formatMonthYear(entry.approximateDate)}
					</p>
				)}
				{entry.description && (
					<p className="text-sm text-muted-foreground">{entry.description}</p>
				)}
			</div>
			{canWrite && (
				<MedicalHistoryFormDialog mode="edit" entry={entry} onSave={onSave} />
			)}
		</li>
	);
}
