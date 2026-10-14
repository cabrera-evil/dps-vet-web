import { ConsultationWorkspace } from '@/components/consultations/consultation-workspace';

export default async function DashboardNewConsultationPage({
	params,
}: {
	params: Promise<{ patientId: string }>;
}) {
	const { patientId } = await params;
	return <ConsultationWorkspace patientId={patientId} />;
}
