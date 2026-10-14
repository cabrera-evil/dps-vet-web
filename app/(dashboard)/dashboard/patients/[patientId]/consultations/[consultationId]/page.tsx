import { ConsultationWorkspace } from '@/components/consultations/consultation-workspace';

export default async function DashboardConsultationPage({
	params,
}: {
	params: Promise<{ patientId: string; consultationId: string }>;
}) {
	const { patientId, consultationId } = await params;
	return (
		<ConsultationWorkspace
			patientId={patientId}
			consultationId={consultationId}
		/>
	);
}
