import { TooltipProvider } from '@/components/ui/tooltip';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import React from 'react';
import AuthProvider from './auth-provider';
import { GoogleAdsenseProvider } from './google-adsence';
import { GoogleAnalyticsProvider } from './google-analytics';
import { QueryProvider } from './query';
import { ThemeProvider } from './theme';
import { ToastProvider } from './toast';

interface Props {
	children: React.ReactNode;
}

export default function Providers({ children }: Props) {
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>
			<GoogleAnalyticsProvider>
				<GoogleAdsenseProvider>
					<TooltipProvider>
						<QueryProvider>
							<NuqsAdapter>
								<AuthProvider>{children}</AuthProvider>
							</NuqsAdapter>
						</QueryProvider>
					</TooltipProvider>
				</GoogleAdsenseProvider>
			</GoogleAnalyticsProvider>
			<ToastProvider position="top-right" richColors />
		</ThemeProvider>
	);
}
