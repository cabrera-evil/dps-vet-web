import { ReactNode } from 'react';

interface Props {
	isLoading: boolean;
	fallback?: ReactNode;
	children: ReactNode;
}

export function LoadingWrapper({ isLoading, fallback, children }: Props) {
	return isLoading ? fallback : children;
}
