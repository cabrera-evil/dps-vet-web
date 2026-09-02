import Script from 'next/script';
import React from 'react';

type Props = {
	children: React.ReactNode;
};

export const GoogleAdsenseProvider: React.FC<Props> = ({ children }) => {
	const googleAdsenseId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID;

	if (!googleAdsenseId) return children;

	return (
		<>
			<Script
				async
				src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${googleAdsenseId}`}
				crossOrigin="anonymous"
				strategy="afterInteractive"
			/>
			{children}
		</>
	);
};
