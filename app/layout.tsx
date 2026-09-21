import { cn } from '@/lib/utils';
import Providers from '@/providers/providers';
import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import React from 'react';
import './globals.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
	title: {
		default: 'Veterinaria San Roque',
		template: '%s | Veterinaria San Roque',
	},
	description:
		'Atención médica veterinaria integral con quirófano especializado, laboratorio clínico automatizado y expediente digital 24/7 en San Salvador.',
	keywords: ['veterinaria', 'clínica veterinaria', 'San Salvador', 'mascotas'],
	authors: [{ name: 'Veterinaria San Roque' }],
	creator: 'Veterinaria San Roque',
	publisher: 'Veterinaria San Roque',
	openGraph: {
		title: 'Veterinaria San Roque',
		description:
			'Atención médica veterinaria integral con quirófano especializado, laboratorio clínico automatizado y expediente digital 24/7 en San Salvador.',
		type: 'website',
		images: [
			{
				url: '/banner.webp',
				width: 800,
				height: 600,
				alt: 'Veterinaria San Roque',
			},
		],
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={cn('scroll-smooth font-sans', geist.variable)}
		>
			<body className="dark">
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
