import { withSentryConfig } from '@sentry/nextjs';
/** @type {import('next').NextConfig} */
const nextConfig = {
	output: 'standalone',
	serverExternalPackages: ['firebase-admin'],
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '**',
				pathname: '**',
			},
		],
	},
	rewrites: async () => {
		return [
			// Keep ONLY the core NextAuth endpoints local
			{ source: '/api/auth/signin', destination: '/api/auth/signin' },
			{
				source: '/api/auth/signin/:path*',
				destination: '/api/auth/signin/:path*',
			},
			{
				source: '/api/auth/callback/:path*',
				destination: '/api/auth/callback/:path*',
			},
			{ source: '/api/auth/signout', destination: '/api/auth/signout' },
			{ source: '/api/auth/session', destination: '/api/auth/session' },
			{ source: '/api/auth/csrf', destination: '/api/auth/csrf' },
			{ source: '/api/auth/providers', destination: '/api/auth/providers' },
			// TODO(self-hosted-api): the backend is migrating into `app/api/**`
			// (see app/api/_shared + app/api/contacts). Remove this proxy rewrite
			// and NEXT_PUBLIC_API_URL once every consumed endpoint is served locally.
			// Proxy EVERYTHING else
			...(process.env.NEXT_PUBLIC_API_URL
				? [
						{
							source: '/api/:path*',
							destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
						},
					]
				: []),
		];
	},
};

export default withSentryConfig(nextConfig, {
	// For all available options, see:
	// https://www.npmjs.com/package/@sentry/webpack-plugin#options

	org: process.env.SENTRY_ORG,

	project: process.env.SENTRY_PROJECT,

	// Only print logs for uploading source maps in CI
	silent: !process.env.CI,

	// For all available options, see:
	// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

	// Upload a larger set of source maps for prettier stack traces (increases build time)
	widenClientFileUpload: true,

	// Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
	// This can increase your server load as well as your hosting bill.
	// Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
	// side errors will fail.
	tunnelRoute: '/monitoring',

	// Automatically tree-shake Sentry logger statements to reduce bundle size
	disableLogger: true,

	// Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
	// See the following for more information:
	// https://docs.sentry.io/product/crons/
	// https://vercel.com/docs/cron-jobs
	automaticVercelMonitors: true,
});
