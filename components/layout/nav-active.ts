/** The Dashboard is the parent of every route, so it matches exactly. */
export function isNavActive(pathname: string, href: string): boolean {
	if (href === '/dashboard') return pathname === href;
	return pathname === href || pathname.startsWith(`${href}/`);
}
