import { AuthMarketingPanel } from '@/components/auth/auth-marketing-panel';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

export default function ForgotPasswordPage() {
	return (
		<main className="flex min-h-svh w-full flex-col bg-background lg:flex-row">
			<ForgotPasswordForm />
			<AuthMarketingPanel />
		</main>
	);
}
