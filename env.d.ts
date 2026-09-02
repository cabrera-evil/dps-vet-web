namespace NodeJS {
	interface ProcessEnv {
		NEXT_PUBLIC_API_URL: string;
		NEXT_PUBLIC_PROXY?: boolean;
		NEXT_PUBLIC_HOST?: string;
		NEXT_PUBLIC_GOOGLE_ADSENSE_ID: string;
		NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: string;
		NEXT_PUBLIC_GOOGLE_SITES_VERIFICATION: string;
		AUTH_SECRET: string;
		AUTH_DEBUG?: boolean;
		NEXT_PUBLIC_SENTRY_DSN: string;
		SENTRY_PROJECT: string;
		SENTRY_ORG: string;
	}
}
