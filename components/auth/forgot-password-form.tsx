'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from '@/components/ui/input-group';
import { usePost } from '@/hooks/use-rest';
import {
	ForgotPassword,
	forgotPasswordSchema,
} from '@/schemas/forgot-password.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	ArrowLeft,
	ArrowRight,
	Mail,
	MailCheck,
	Stethoscope,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

export function ForgotPasswordForm() {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
	const { mutateAsync: requestReset } = usePost();
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ForgotPassword>({ resolver: zodResolver(forgotPasswordSchema) });

	async function onSubmit(values: ForgotPassword) {
		setIsSubmitting(true);
		try {
			await requestReset({
				path: '/api/auth/forgot-password',
				payload: values,
			});
			setSubmittedEmail(values.email);
		} catch {
			// RestService's interceptor already surfaces the error toast.
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<section className="flex w-full flex-col justify-between overflow-y-auto p-6 sm:p-10 lg:w-[54%] lg:p-12 xl:w-1/2 xl:p-16">
			<div className="flex items-center justify-between gap-3">
				<div className="flex items-center gap-3">
					<div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
						<Stethoscope className="size-5" />
					</div>
					<div>
						<h1 className="font-heading text-lg font-semibold tracking-tight">
							Veterinaria San Roque
						</h1>
						<p className="flex items-center gap-1.5 text-xs text-muted-foreground">
							<span className="inline-block size-1.5 animate-pulse rounded-full bg-primary" />
							Portal de Veterinaria San Roque
						</p>
					</div>
				</div>
				<Button
					nativeButton={false}
					render={<Link href="/auth/login" />}
					size="sm"
					variant="ghost"
				>
					<ArrowLeft />
					Volver a iniciar sesión
				</Button>
			</div>

			<div className="mx-auto my-auto w-full max-w-md py-8">
				{submittedEmail ? (
					<Alert>
						<MailCheck />
						<AlertTitle>Revisa tu correo</AlertTitle>
						<AlertDescription>
							Si <strong>{submittedEmail}</strong> está registrado, te enviamos
							un enlace para restablecer tu contraseña.
						</AlertDescription>
					</Alert>
				) : (
					<>
						<div className="mb-7">
							<h2 className="text-2xl font-semibold tracking-tight text-balance">
								¿Olvidaste tu contraseña?
							</h2>
							<p className="mt-1 text-sm text-muted-foreground">
								Ingresa tu correo y te enviaremos un enlace para restablecerla.
							</p>
						</div>

						<form
							className="flex flex-col gap-4"
							onSubmit={handleSubmit(onSubmit)}
						>
							<Field data-invalid={!!errors.email}>
								<FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
								<InputGroup>
									<InputGroupAddon>
										<Mail />
									</InputGroupAddon>
									<InputGroupInput
										id="email"
										type="email"
										autoComplete="email"
										placeholder="correo@ejemplo.com"
										{...register('email')}
									/>
								</InputGroup>
								<FieldError
									errors={errors.email ? [errors.email] : undefined}
								/>
							</Field>
							<Button type="submit" className="w-full" disabled={isSubmitting}>
								Enviar enlace
								<ArrowRight />
							</Button>
						</form>
					</>
				)}
			</div>

			<div className="flex flex-col items-center justify-between gap-2 border-t pt-4 text-xs text-muted-foreground sm:flex-row">
				<p>© {new Date().getFullYear()} Veterinaria San Roque S.A. de C.V.</p>
				<p>Soporte técnico: +503 2257-8900</p>
			</div>
		</section>
	);
}
