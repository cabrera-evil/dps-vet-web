'use client';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import {
	cloneElement,
	isValidElement,
	useState,
	type ReactElement,
} from 'react';

interface DialogTriggerWrapperProps {
	children: ReactElement<{ onClose?: () => void }>; // 👈 esto fuerza compatibilidad
	title?: string;
	buttonText?: string;
	trigger?: ReactElement<{ onClick?: (e: React.MouseEvent) => void }>;
	className?: string;
}

export function DialogTriggerWrapper({
	children,
	title = 'Untitled',
	buttonText = 'Create',
	trigger,
	className = '',
}: DialogTriggerWrapperProps) {
	const [open, setOpen] = useState(false);

	const handleOpen = (e?: React.MouseEvent) => {
		e?.stopPropagation();
		e?.preventDefault();
		setOpen(true);
	};

	const handleClose = () => setOpen(false);

	const wrappedTrigger =
		trigger && isValidElement(trigger) ? (
			cloneElement(trigger, {
				onClick: (e: React.MouseEvent) => {
					trigger.props?.onClick?.(e);
					handleOpen(e);
				},
			})
		) : (
			<Button
				variant="default"
				size="sm"
				className={`ml-auto hidden h-8 lg:flex gap-2 ${className}`}
				onClick={handleOpen}
			>
				<Plus className="w-4 h-4" />
				<span className="hidden sm:inline">{buttonText}</span>
			</Button>
		);

	const injectedChildren = isValidElement(children)
		? cloneElement(children, { onClose: handleClose })
		: children;

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger render={wrappedTrigger} />
			<DialogContent className="max-w-xl">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				{injectedChildren}
			</DialogContent>
		</Dialog>
	);
}
