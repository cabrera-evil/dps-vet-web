import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { ComponentProps } from 'react';

interface ClinicalTextareaProps extends ComponentProps<typeof Textarea> {
	id: string;
	label: string;
	help?: string;
	error?: { message?: string };
	required?: boolean;
}

/** Narrative field with the guidance always visible under the label. */
export function ClinicalTextarea({
	id,
	label,
	help,
	error,
	required,
	className,
	...props
}: ClinicalTextareaProps) {
	return (
		<Field data-invalid={!!error}>
			<FieldLabel htmlFor={id}>
				{label}
				{required && <span aria-hidden="true">*</span>}
			</FieldLabel>
			{help && <FieldDescription id={`${id}-help`}>{help}</FieldDescription>}
			<Textarea
				id={id}
				aria-invalid={!!error}
				aria-describedby={help ? `${id}-help` : undefined}
				className={cn('min-h-24', className)}
				{...props}
			/>
			<FieldError errors={error ? [error] : undefined} />
		</Field>
	);
}
