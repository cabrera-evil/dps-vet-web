import { Eye, Lock } from 'lucide-react';

const NOTE = {
	owner: { icon: Eye, text: 'Visible para el propietario.' },
	internal: {
		icon: Lock,
		text: 'Esta información solo será visible para el personal de la clínica.',
	},
};

export function OwnerVisibilityNote({
	variant,
}: {
	variant: keyof typeof NOTE;
}) {
	const { icon: Icon, text } = NOTE[variant];
	return (
		<p className="flex items-center gap-1.5 text-xs text-muted-foreground">
			<Icon className="size-3" aria-hidden="true" />
			{text}
		</p>
	);
}
