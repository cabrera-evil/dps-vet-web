import { ClinicalDataList } from '@/components/clinical/clinical-data-list';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { PET_SEX_LABEL } from '@/constants/clinical';
import type { PatientIdentity } from '@/types/patient-record.type';
import { getAgeLabel } from '@/utils/age';
import { formatDate } from '@/utils/date';
import { Pencil } from 'lucide-react';

interface PatientGeneralDataTabProps {
	patient: PatientIdentity;
	canWrite: boolean;
	onEdit: () => void;
}

export function PatientGeneralDataTab({
	patient,
	canWrite,
	onEdit,
}: PatientGeneralDataTabProps) {
	return (
		<div className="grid items-start gap-4 lg:grid-cols-3">
			<Card className="lg:col-span-2">
				<CardHeader>
					<CardTitle>Identificación del paciente</CardTitle>
					{canWrite && (
						<CardAction>
							<Button variant="outline" size="sm" onClick={onEdit}>
								<Pencil />
								Editar datos
							</Button>
						</CardAction>
					)}
				</CardHeader>
				<CardContent>
					<ClinicalDataList
						items={[
							{ label: 'Nombre', value: patient.name },
							{ label: 'Número de expediente', value: patient.recordNumber },
							{ label: 'Especie', value: patient.species },
							{ label: 'Raza', value: patient.breed },
							{ label: 'Sexo', value: PET_SEX_LABEL[patient.sex] },
							{
								label: 'Esterilizado / castrado',
								value: patient.sterilized ? 'Sí' : 'No',
							},
							{
								label: 'Fecha de nacimiento',
								value: formatDate(patient.birthDate),
							},
							{ label: 'Edad', value: getAgeLabel(patient.birthDate) },
							{ label: 'Color', value: patient.color },
							{ label: 'Señas particulares', value: patient.markings },
							{ label: 'Microchip / identificación', value: patient.microchip },
						]}
					/>
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle>Propietario</CardTitle>
				</CardHeader>
				<CardContent>
					<ClinicalDataList
						className="lg:grid-cols-1"
						items={[
							{ label: 'Nombre', value: patient.ownerName },
							{ label: 'Teléfono', value: patient.ownerPhone },
							{ label: 'Correo electrónico', value: patient.ownerEmail },
						]}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
