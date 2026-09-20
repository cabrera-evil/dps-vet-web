import type { Permission } from '@/constants/permission';
import type { NextRequest, NextResponse } from 'next/server';

/** Caller identity resolved by `withAuth`, from either auth path. */
export type Identity = {
	uid: string;
	permissions: Permission[];
};

export type RouteContext = {
	params: Promise<Record<string, string>>;
	/** Populated by `withAuth`; absent on routes without it. */
	identity?: Identity;
};

export type RouteHandler = (
	request: NextRequest,
	context: RouteContext
) => Promise<NextResponse> | NextResponse;
