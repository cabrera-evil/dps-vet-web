'use client';

import { Permission } from '@/constants/permission';
import { hasPermission } from '@/utils/permission';
import { useSession } from 'next-auth/react';
import { ReactNode } from 'react';

interface BaseAuthWrapperProps {
	children: ReactNode;
	fallback?: ReactNode;
	loading?: ReactNode;
}

interface PermissionAuthWrapperProps extends BaseAuthWrapperProps {
	permissions: Permission[];
	mode?: 'any' | 'all';
}

// Main auth wrapper that handles both authentication and authorization
export function AuthWrapper({
	children,
	fallback,
	loading,
}: BaseAuthWrapperProps) {
	const { status } = useSession();
	if (status === 'loading') return loading;
	if (status !== 'authenticated') return fallback;
	return children;
}

// Permission-based authorization wrapper (requires authentication first)
export function PermissionWrapper({
	permissions,
	mode = 'any',
	children,
	fallback,
	loading,
}: PermissionAuthWrapperProps) {
	const { data: session, status } = useSession();
	if (status === 'loading') return loading;
	if (status !== 'authenticated') return fallback;
	if (!hasPermission(session?.user?.permissions, permissions, mode))
		return fallback;
	return children;
}

// Combined wrapper for authenticated + permission check
export function AuthPermissionWrapper({
	permissions,
	mode = 'any',
	children,
	fallback,
	loading,
}: PermissionAuthWrapperProps) {
	const { data: session, status } = useSession();
	if (status === 'loading') return loading;
	// Check authentication first
	if (status !== 'authenticated') return fallback;
	// Then check authorization
	if (!hasPermission(session?.user?.permissions, permissions, mode))
		return fallback;
	return children;
}
