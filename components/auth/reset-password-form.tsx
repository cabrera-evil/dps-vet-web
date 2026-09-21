'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from '@/components/ui/input-group';
import { usePost } from '@/hooks/use-rest';
import {
	ResetPassword,
	resetPasswordSchema,
} from '@/schemas/reset-password.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	ArrowLeft,
	ArrowRight,
	Eye,
	EyeOff,
	KeyRound,
	Stethoscope,
	TriangleAlert,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

export function ResetPasswordForm() {
	const searchParams = useSearchParams();
	const oobCode = searchParams.get('oobCode');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [completed, setCompleted] = useState(false);
	const { mutateAsync: resetPassword } = usePost();
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ResetPassword>({ resolver: zodResolver(resetPasswordSchema) });

	async function onSubmit(values: ResetPassword) {
		if (!oobCode) return;
		setIsSubmitting(true);
		try {
			await resetPassword({
				path: '/auth/reset-password',
				payload: { oobCode, password: values.password },
			});
			setCompleted(true);
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
				{!oobCode ? (
					<Alert variant="destructive">
						<TriangleAlert />
						<AlertTitle>Enlace inválido</AlertTitle>
						<AlertDescription>
							Este enlace de restablecimiento no es válido o ya expiró. Solicita
							uno nuevo desde{' '}
							<Link href="/auth/forgot-password">
								¿Olvidaste tu contraseña?
							</Link>
							.
						</AlertDescription>
					</Alert>
				) : completed ? (
					<Alert>
						<KeyRound />
						<AlertTitle>Contraseña actualizada</AlertTitle>
						<AlertDescription>
							Ya puedes <Link href="/auth/login">iniciar sesión</Link> con tu
							nueva contraseña.
						</AlertDescription>
					</Alert>
				) : (
					<>
						<div className="mb-7">
							<h2 className="text-2xl font-semibold tracking-tight text-balance">
								Restablece tu contraseña
							</h2>
							<p className="mt-1 text-sm text-muted-foreground">
								Ingresa tu nueva contraseña para continuar.
							</p>
						</div>

						<form
							className="flex flex-col gap-4"
							onSubmit={handleSubmit(onSubmit)}
						>
							<Field data-invalid={!!errors.password}>
								<FieldLabel htmlFor="password">Nueva contraseña</FieldLabel>
								<InputGroup>
									<InputGroupAddon>
										<KeyRound />
									</InputGroupAddon>
									<InputGroupInput
										id="password"
										type={showPassword ? 'text' : 'password'}
										autoComplete="new-password"
										{...register('password')}
									/>
									<InputGroupAddon align="inline-end">
										<InputGroupButton
											type="button"
											aria-label={
												showPassword
													? 'Ocultar contraseña'
													: 'Mostrar contraseña'
											}
											onClick={() => setShowPassword((value) => !value)}
										>
											{showPassword ? <EyeOff /> : <Eye />}
										</InputGroupButton>
									</InputGroupAddon>
								</InputGroup>
								<FieldError
									errors={errors.password ? [errors.password] : undefined}
								/>
							</Field>
							<Field data-invalid={!!errors.confirmPassword}>
								<FieldLabel htmlFor="confirmPassword">
									Confirmar contraseña
								</FieldLabel>
								<InputGroup>
									<InputGroupAddon>
										<KeyRound />
									</InputGroupAddon>
									<InputGroupInput
										id="confirmPassword"
										type={showConfirmPassword ? 'text' : 'password'}
										autoComplete="new-password"
										{...register('confirmPassword')}
									/>
									<InputGroupAddon align="inline-end">
										<InputGroupButton
											type="button"
											aria-label={
												showConfirmPassword
													? 'Ocultar contraseña'
													: 'Mostrar contraseña'
											}
											onClick={() => setShowConfirmPassword((value) => !value)}
										>
											{showConfirmPassword ? <EyeOff /> : <Eye />}
										</InputGroupButton>
									</InputGroupAddon>
								</InputGroup>
								<FieldError
									errors={
										errors.confirmPassword
											? [errors.confirmPassword]
											: undefined
									}
								/>
							</Field>
							<Button type="submit" className="w-full" disabled={isSubmitting}>
								Restablecer contraseña
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
