import { TreatmentWorkspace } from '@/components/treatments/treatment-workspace';

export default async function DashboardTreatmentPage({
	params,
}: {
	params: Promise<{ patientId: string; treatmentId: string }>;
}) {
	const { patientId, treatmentId } = await params;
	return <TreatmentWorkspace patientId={patientId} treatmentId={treatmentId} />;
}
