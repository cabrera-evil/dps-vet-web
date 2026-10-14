import { ClinicalAlertList } from '@/components/clinical/clinical-alert-list';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PATIENT_STATUS_LABEL, PET_SEX_LABEL } from '@/constants/clinical';
import type {
	ClinicalAlert,
	PatientIdentity,
	WeightMeasurement,
} from '@/types/patient-record.type';
import { getAgeLabel } from '@/utils/age';
import { formatDate } from '@/utils/date';
import { ArrowLeft, Pencil } from 'lucide-react';
import Link from 'next/link';
import { RegisterRecordMenu } from './register-record-menu';

interface PatientRecordHeaderProps {
	patient: PatientIdentity;
	alerts: ClinicalAlert[];
	lastWeight?: WeightMeasurement;
	canWrite: boolean;
	onEdit: () => void;
}

function HeaderFact({ label, value }: { label: string; value?: string }) {
	return (
		<div className="flex flex-col">
			<dt className="text-xs text-muted-foreground">{label}</dt>
			<dd className="font-medium">
				{value ?? (
					<>
						<span aria-hidden="true">—</span>
						<span className="sr-only">No registrado</span>
					</>
				)}
			</dd>
		</div>
	);
}

export function PatientRecordHeader({
	patient,
	alerts,
	lastWeight,
	canWrite,
	onEdit,
}: PatientRecordHeaderProps) {
	return (
		<header className="flex flex-col gap-4">
			<Button
				variant="ghost"
				size="sm"
				className="-ml-2 w-fit"
				nativeButton={false}
				render={<Link href="/dashboard/patients" />}
			>
				<ArrowLeft />
				Pacientes
			</Button>
			<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
				<div className="flex items-start gap-4">
					<Avatar className="size-14 text-lg">
						<AvatarFallback>
							{patient.name.slice(0, 2).toUpperCase()}
						</AvatarFallback>
					</Avatar>
					<div className="flex min-w-0 flex-col gap-3">
						<div>
							<div className="flex flex-wrap items-center gap-2">
								<h2 className="font-heading text-xl font-semibold">
									{patient.name}
								</h2>
								<Badge variant="outline">
									{PATIENT_STATUS_LABEL[patient.status]}
								</Badge>
							</div>
							<p className="text-sm text-muted-foreground">
								{[
									patient.species,
									patient.breed,
									patient.sex && PET_SEX_LABEL[patient.sex],
								]
									.filter(Boolean)
									.join(' · ')}
							</p>
						</div>
						<dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
							<HeaderFact label="Expediente" value={patient.recordNumber} />
							<HeaderFact label="Edad" value={getAgeLabel(patient.birthDate)} />
							<HeaderFact
								label="Último peso"
								value={
									lastWeight &&
									`${lastWeight.valueKg} kg · ${formatDate(lastWeight.measuredAt)}`
								}
							/>
							<HeaderFact label="Propietario" value={patient.ownerName} />
							<HeaderFact label="Contacto" value={patient.ownerPhone} />
						</dl>
					</div>
				</div>
				{canWrite && (
					<div className="flex shrink-0 gap-2">
						<Button variant="outline" onClick={onEdit}>
							<Pencil />
							Editar
						</Button>
						<RegisterRecordMenu patientId={patient.id} />
					</div>
				)}
			</div>
			<ClinicalAlertList alerts={alerts} />
		</header>
	);
}
