'use client';

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export interface LandingNavLink {
	href: string;
	label: string;
}

interface LandingNavProps {
	links: LandingNavLink[];
	className?: string;
}

export function LandingNav({ links, className }: LandingNavProps) {
	const [activeHref, setActiveHref] = useState(links[0]?.href);

	useEffect(() => {
		const sections = links
			.map((link) => document.querySelector(link.href))
			.filter((section): section is Element => section !== null);

		if (sections.length === 0) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((entry) => entry.isIntersecting)
					.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

				if (visible[0]) {
					setActiveHref(`#${visible[0].target.id}`);
				}
			},
			{ rootMargin: '-112px 0px -55% 0px', threshold: 0 }
		);

		sections.forEach((section) => observer.observe(section));

		return () => observer.disconnect();
	}, [links]);

	return (
		<nav
			className={cn('hidden items-center gap-1 lg:flex xl:gap-1.5', className)}
		>
			{links.map((link) => (
				<a
					key={link.href}
					className={cn(
						'rounded-lg px-3 py-2 text-xs font-medium transition-colors',
						activeHref === link.href
							? 'bg-muted font-semibold text-primary'
							: 'text-muted-foreground hover:bg-muted hover:text-foreground'
					)}
					href={link.href}
				>
					{link.label}
				</a>
			))}
		</nav>
	);
}
