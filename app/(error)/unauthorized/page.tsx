import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function UnauthorizedPage() {
	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="max-w-md w-full space-y-8">
				<div className="text-center">
					<h1 className="text-6xl font-bold">403</h1>
					<h2 className="mt-6 text-3xl font-extrabold">Access Denied</h2>
					<p className="mt-2 text-sm">
						You don&apos;t have permission to access this resource.
					</p>
				</div>
				<div className="mt-8 space-y-6">
					<div className="flex items-center justify-center space-x-4">
						<Link href="/">
							<Button>Go Home</Button>
						</Link>
						<Link href="/#contact">
							<Button variant="secondary">Contact Support</Button>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
