import { AuthMarketingPanel } from '@/components/auth/auth-marketing-panel';
import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
	return (
		<main className="flex min-h-svh w-full flex-col bg-background lg:flex-row">
			<LoginForm />
			<AuthMarketingPanel />
		</main>
	);
}
