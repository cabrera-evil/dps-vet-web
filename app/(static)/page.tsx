export default function Page() {
	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="max-w-md w-full space-y-8">
				<div className="text-center">
					<h1 className="text-6xl font-bold">400</h1>
					<h2 className="mt-6 text-3xl font-extrabold">Bad Request</h2>
					<p className="mt-2 text-sm">
						The request could not be understood by the server due to malformed
						syntax.
					</p>
				</div>
			</div>
		</div>
	);
}
