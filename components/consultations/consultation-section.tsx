import type { ReactNode } from 'react';

interface ConsultationSectionProps {
	id: string;
	title: string;
	description?: string;
	children: ReactNode;
}

export function ConsultationSection({
	id,
	title,
	description,
	children,
}: ConsultationSectionProps) {
	return (
		<section
			id={id}
			aria-labelledby={`${id}-title`}
			className="grid scroll-mt-36 gap-4 border-t py-6 first:border-t-0 first:pt-0 lg:grid-cols-[14rem_1fr] lg:gap-8"
		>
			<div className="flex flex-col gap-1">
				<h3 id={`${id}-title`} className="font-heading text-base font-medium">
					{title}
				</h3>
				{description && (
					<p className="text-sm text-muted-foreground">{description}</p>
				)}
			</div>
			<div className="flex min-w-0 flex-col gap-4">{children}</div>
		</section>
	);
}
