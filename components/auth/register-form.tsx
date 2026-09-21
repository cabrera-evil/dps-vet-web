'use client';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from '@/components/ui/input-group';
import { usePost } from '@/hooks/use-rest';
import { Register, registerSchema } from '@/schemas/register.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	ArrowLeft,
	ArrowRight,
	Eye,
	EyeOff,
	KeyRound,
	Mail,
	Phone,
	Stethoscope,
	User,
} from 'lucide-react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export function RegisterForm() {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const { mutateAsync: registerUser } = usePost();
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<Register>({ resolver: zodResolver(registerSchema) });

	async function onSubmit(values: Register) {
		setIsSubmitting(true);
		try {
			await registerUser({
				path: '/users',
				payload: {
					name: values.name,
					email: values.email,
					phone: values.phone,
					password: values.password,
				},
			});
		} catch {
			setIsSubmitting(false);
			return;
		}

		const result = await signIn('credentials', {
			email: values.email,
			password: values.password,
			redirect: false,
		});
		setIsSubmitting(false);

		if (!result || result.error) {
			toast.success('Cuenta creada', {
				description: 'Ya puedes iniciar sesión con tus credenciales.',
			});
			router.push('/auth/login');
			return;
		}

		router.push('/dashboard');
		router.refresh();
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
						Crea tu cuenta
					</h2>
					<p className="mt-1 text-sm text-muted-foreground">
						Regístrate para gestionar las citas y el historial de tus mascotas.
					</p>
				</div>

				<form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
					<Field data-invalid={!!errors.name}>
						<FieldLabel htmlFor="name">Nombre completo</FieldLabel>
						<InputGroup>
							<InputGroupAddon>
								<User />
							</InputGroupAddon>
							<InputGroupInput
								id="name"
								type="text"
								autoComplete="name"
								placeholder="Nombre y apellido"
								{...register('name')}
							/>
						</InputGroup>
						<FieldError errors={errors.name ? [errors.name] : undefined} />
					</Field>
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
					<Field data-invalid={!!errors.phone}>
						<FieldLabel htmlFor="phone">Teléfono</FieldLabel>
						<InputGroup>
							<InputGroupAddon>
								<Phone />
							</InputGroupAddon>
							<InputGroupInput
								id="phone"
								type="tel"
								autoComplete="tel"
								placeholder="+503 0000-0000"
								{...register('phone')}
							/>
						</InputGroup>
						<FieldError errors={errors.phone ? [errors.phone] : undefined} />
					</Field>
					<Field data-invalid={!!errors.password}>
						<FieldLabel htmlFor="password">Contraseña</FieldLabel>
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
								errors.confirmPassword ? [errors.confirmPassword] : undefined
							}
						/>
					</Field>
					<Button type="submit" className="w-full" disabled={isSubmitting}>
						Crear cuenta
						<ArrowRight />
					</Button>
				</form>

				<p className="mt-6 text-center text-sm text-muted-foreground">
					¿Ya tienes cuenta?{' '}
					<Link
						href="/auth/login"
						className="font-medium text-primary hover:underline"
					>
						Inicia sesión
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
