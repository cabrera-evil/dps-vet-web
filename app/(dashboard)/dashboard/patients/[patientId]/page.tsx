import { PatientRecord } from '@/components/patients/patient-record';

export default async function DashboardPatientRecordPage({
	params,
}: {
	params: Promise<{ patientId: string }>;
}) {
	const { patientId } = await params;
	return <PatientRecord patientId={patientId} />;
}
