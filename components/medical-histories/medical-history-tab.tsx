import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from '@/components/ui/empty';
import { MEDICAL_HISTORY_TYPE_LABEL } from '@/constants/clinical';
import { MedicalHistoryType } from '@/constants/enum';
import type { MedicalHistoryEntry } from '@/types/medical-history.type';
import { FileHeart } from 'lucide-react';
import { MedicalHistoryFormDialog } from './medical-history-form-dialog';
import { MedicalHistoryItem } from './medical-history-item';

const GROUP_ORDER = [
	MedicalHistoryType.MEDICAL,
	MedicalHistoryType.SURGICAL,
	MedicalHistoryType.REPRODUCTIVE,
	MedicalHistoryType.OTHER,
];

interface MedicalHistoryTabProps {
	petId: string;
	entries: MedicalHistoryEntry[];
	canWrite: boolean;
}

export function MedicalHistoryTab({
	petId,
	entries,
	canWrite,
}: MedicalHistoryTabProps) {
	const groups = GROUP_ORDER.map((type) => ({
		type,
		items: entries.filter((entry) => entry.type === type),
	})).filter((group) => group.items.length > 0);

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<p className="text-sm text-muted-foreground">
					Historia médica del paciente, independiente de cada consulta.
				</p>
				{canWrite && entries.length > 0 && (
					<MedicalHistoryFormDialog mode="create" petId={petId} />
				)}
			</div>
			{groups.length === 0 ? (
				<Empty className="border">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<FileHeart />
						</EmptyMedia>
						<EmptyTitle>Sin antecedentes registrados</EmptyTitle>
						<EmptyDescription>
							Registra enfermedades previas, cirugías u otros datos que deban
							acompañar al paciente en futuras consultas.
						</EmptyDescription>
					</EmptyHeader>
					{canWrite && (
						<EmptyContent>
							<MedicalHistoryFormDialog mode="create" petId={petId} />
						</EmptyContent>
					)}
				</Empty>
			) : (
				groups.map(({ type, items }) => (
					<Card key={type}>
						<CardHeader>
							<CardTitle>{MEDICAL_HISTORY_TYPE_LABEL[type]}</CardTitle>
						</CardHeader>
						<CardContent>
							<ul className="divide-y">
								{items.map((entry) => (
									<MedicalHistoryItem
										key={entry.id}
										petId={petId}
										entry={entry}
										canWrite={canWrite}
									/>
								))}
							</ul>
						</CardContent>
					</Card>
				))
			)}
		</div>
	);
}
