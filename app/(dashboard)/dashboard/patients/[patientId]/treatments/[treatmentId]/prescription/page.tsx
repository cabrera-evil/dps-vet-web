import { PrescriptionWorkspace } from '@/components/treatments/prescription-workspace';

export default async function DashboardPrescriptionPage({
	params,
}: {
	params: Promise<{ patientId: string; treatmentId: string }>;
}) {
	const { patientId, treatmentId } = await params;
	return (
		<PrescriptionWorkspace patientId={patientId} treatmentId={treatmentId} />
	);
}
