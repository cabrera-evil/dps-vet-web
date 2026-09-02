import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NotFoundPage() {
	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="max-w-md w-full space-y-8">
				<div className="text-center">
					<h1 className="text-6xl font-bold">404</h1>
					<h2 className="mt-6 text-3xl font-extrabold">Not Found</h2>
					<p className="mt-2 text-sm">
						The page you are looking for does not exist.
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
