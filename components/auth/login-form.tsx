'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from '@/components/ui/input-group';
import { Separator } from '@/components/ui/separator';
import { Login, loginSchema } from '@/schemas/login.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	ArrowLeft,
	ArrowRight,
	Eye,
	EyeOff,
	KeyRound,
	Mail,
	Stethoscope,
} from 'lucide-react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export function LoginForm() {
	const router = useRouter();
	const hasAuthError = useSearchParams().has('error');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isGoogleLoading, setIsGoogleLoading] = useState(false);
	const isBusy = isSubmitting || isGoogleLoading;
	const [showPassword, setShowPassword] = useState(false);
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<Login>({ resolver: zodResolver(loginSchema) });

	async function onSubmit(values: Login) {
		setIsSubmitting(true);
		const result = await signIn('credentials', { ...values, redirect: false });
		setIsSubmitting(false);

		if (!result || result.error) {
			toast.error('No se pudo iniciar sesión', {
				description: 'Verifica tu correo y contraseña e intenta nuevamente.',
			});
			return;
		}

		router.push('/dashboard');
		router.refresh();
	}

	async function onGoogleSignIn() {
		setIsGoogleLoading(true);
		try {
			await signIn('google', { redirectTo: '/dashboard' });
		} catch {
			setIsGoogleLoading(false);
			toast.error('No se pudo iniciar sesión con Google', {
				description: 'Inténtalo de nuevo o usa tu correo y contraseña.',
			});
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
					render={<Link href="/" />}
					size="sm"
					variant="ghost"
				>
					<ArrowLeft />
					Volver al sitio
				</Button>
			</div>

			<div className="mx-auto my-auto w-full max-w-md py-8">
				<div className="mb-7">
					<h2 className="text-2xl font-semibold tracking-tight text-balance">
						Inicia sesión
					</h2>
					<p className="mt-1 text-sm text-muted-foreground">
						Ingresa tus credenciales para acceder a tu cuenta.
					</p>
				</div>

				{hasAuthError && (
					<Alert variant="destructive" className="mb-4">
						<AlertDescription>
							No se pudo iniciar sesión con Google. Inténtalo de nuevo o usa tu
							correo y contraseña.
						</AlertDescription>
					</Alert>
				)}

				<form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
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
						<FieldError errors={errors.email ? [errors.email] : undefined} />
					</Field>
					<Field data-invalid={!!errors.password}>
						<div className="flex items-center justify-between">
							<FieldLabel htmlFor="password">Contraseña</FieldLabel>
							<Link
								href="/auth/forgot-password"
								className="text-xs font-medium text-primary hover:underline"
							>
								¿Olvidaste tu contraseña?
							</Link>
						</div>
						<InputGroup>
							<InputGroupAddon>
								<KeyRound />
							</InputGroupAddon>
							<InputGroupInput
								id="password"
								type={showPassword ? 'text' : 'password'}
								autoComplete="current-password"
								{...register('password')}
							/>
							<InputGroupAddon align="inline-end">
								<InputGroupButton
									type="button"
									aria-label={
										showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
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
					<Button type="submit" className="w-full" disabled={isBusy}>
						Iniciar sesión
						<ArrowRight />
					</Button>
				</form>

				<div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
					<Separator className="flex-1" />o<Separator className="flex-1" />
				</div>

				<Button
					type="button"
					variant="outline"
					className="w-full"
					disabled={isBusy}
					onClick={onGoogleSignIn}
				>
					<svg aria-hidden="true" viewBox="0 0 24 24" className="size-4">
						<path
							fill="#4285F4"
							d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
						/>
						<path
							fill="#34A853"
							d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
						/>
						<path
							fill="#FBBC05"
							d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
						/>
						<path
							fill="#EA4335"
							d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
						/>
					</svg>
					{isGoogleLoading ? 'Redirigiendo…' : 'Continuar con Google'}
				</Button>

				<p className="mt-6 text-center text-sm text-muted-foreground">
					¿No tienes cuenta?{' '}
					<Link
						href="/auth/register"
						className="font-medium text-primary hover:underline"
					>
						Regístrate
					</Link>
				</p>
			</div>

			<div className="flex flex-col items-center justify-between gap-2 border-t pt-4 text-xs text-muted-foreground sm:flex-row">
				<p>© {new Date().getFullYear()} Veterinaria San Roque S.A. de C.V.</p>
				<p>Soporte técnico: +503 2257-8900</p>
			</div>
		</section>
	);
}
