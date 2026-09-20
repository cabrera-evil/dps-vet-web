import { AuthMarketingPanel } from '@/components/auth/auth-marketing-panel';
import { RegisterForm } from '@/components/auth/register-form';

export default function RegisterPage() {
	return (
		<main className="flex min-h-svh w-full flex-col bg-background lg:flex-row">
			<RegisterForm />
			<AuthMarketingPanel />
		</main>
	);
}
