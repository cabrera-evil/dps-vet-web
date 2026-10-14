import { FollowUpControlWorkspace } from '@/components/treatments/follow-up-control-workspace';

export default async function DashboardFollowUpControlPage({
	params,
}: {
	params: Promise<{ patientId: string; followUpId: string }>;
}) {
	const { patientId, followUpId } = await params;
	return (
		<FollowUpControlWorkspace patientId={patientId} followUpId={followUpId} />
	);
}
