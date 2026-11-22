import { AuthMarketingPanel } from '@/components/auth/auth-marketing-panel';
import { LoginForm } from '@/components/auth/login-form';
import { Suspense } from 'react';

export default function LoginPage() {
	return (
		<main className="flex min-h-svh w-full flex-col bg-background lg:flex-row">
			<Suspense>
				<LoginForm />
			</Suspense>
			<AuthMarketingPanel />
		</main>
	);
}
