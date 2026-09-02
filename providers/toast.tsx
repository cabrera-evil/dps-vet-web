'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

function ToastProvider(props: ToasterProps) {
	const { resolvedTheme } = useTheme();

	return (
		<Sonner
			theme={(resolvedTheme ?? 'system') as ToasterProps['theme']}
			{...props}
		/>
	);
}

export { ToastProvider };
