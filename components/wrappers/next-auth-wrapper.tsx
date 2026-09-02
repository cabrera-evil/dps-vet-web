'use client';

import { Role } from '@/constants/enum';
import { hasRequiredRole } from '@/utils/role';
import { useSession } from 'next-auth/react';
import { ReactNode } from 'react';

interface BaseAuthWrapperProps {
	children: ReactNode;
	fallback?: ReactNode;
	loading?: ReactNode;
}

interface RoleAuthWrapperProps extends BaseAuthWrapperProps {
	roles: Role[];
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

// Role-based authorization wrapper (requires authentication first)
export function RoleWrapper({
	roles,
	children,
	fallback,
	loading,
}: RoleAuthWrapperProps) {
	const { data: session, status } = useSession();
	if (status === 'loading') return loading;
	if (status !== 'authenticated') return fallback;
	if (!hasRequiredRole(session?.user?.role, roles)) return fallback;
	return children;
}

// Combined wrapper for authenticated + role check
export function AuthRoleWrapper({
	roles,
	children,
	fallback,
	loading,
}: RoleAuthWrapperProps) {
	const { data: session, status } = useSession();
	if (status === 'loading') return loading;
	// Check authentication first
	if (status !== 'authenticated') return fallback;
	// Then check authorization
	if (!hasRequiredRole(session?.user?.role, roles)) return fallback;
	return children;
}
