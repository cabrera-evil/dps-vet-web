import { AuthMarketingPanel } from '@/components/auth/auth-marketing-panel';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import { Suspense } from 'react';

export default function ResetPasswordPage() {
	return (
		<main className="flex min-h-svh w-full flex-col bg-background lg:flex-row">
			<Suspense>
				<ResetPasswordForm />
			</Suspense>
			<AuthMarketingPanel />
		</main>
	);
}
