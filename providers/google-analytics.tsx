import Script from 'next/script';
import React from 'react';

type Props = {
	children: React.ReactNode;
};

export const GoogleAnalyticsProvider: React.FC<Props> = ({ children }) => {
	const googleAnalyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

	if (!googleAnalyticsId) return children;

	return (
		<>
			<Script
				async
				src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
				strategy="afterInteractive"
			/>
			<Script id="google-analytics" strategy="afterInteractive">
				{`
          window.dataLayer = window.dataLayer || [];
          function gtag() {
            dataLayer.push(arguments);
          }
          gtag('js', new Date());
						  gtag('config', '${googleAnalyticsId}');
        `}
			</Script>
			{children}
		</>
	);
};
