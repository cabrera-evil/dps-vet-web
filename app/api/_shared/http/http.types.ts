import type { NextRequest, NextResponse } from 'next/server';

export type RouteContext = { params: Promise<Record<string, string>> };

export type RouteHandler = (
	request: NextRequest,
	context: RouteContext
) => Promise<NextResponse> | NextResponse;
