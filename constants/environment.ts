import { QueryClient } from '@tanstack/react-query';

const SECOND = 1_000;
const MINUTE = 60 * SECOND;

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 30 * SECOND,
			gcTime: 5 * MINUTE,
			refetchOnWindowFocus: false,
			refetchOnReconnect: true,
			refetchOnMount: true,
			retry: 1,
		},
		mutations: {
			retry: false,
		},
	},
});
