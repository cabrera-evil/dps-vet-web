'use client';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from '@/components/ui/input-group';
import { Login, loginSchema } from '@/schemas/login.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	ArrowRight,
	Eye,
	EyeOff,
	KeyRound,
	Mail,
	ShieldCheck,
	Stethoscope,
	Users,
} from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const SERVICE_PROFILES = [
	{
		value: 'vet',
		label: 'Veterinario',
		icon: Stethoscope,
		hint: 'Ingresa con tu correo institucional del área clínica.',
	},
	{
		value: 'admin',
		label: 'Administración',
		icon: ShieldCheck,
		hint: 'Ingresa con tu correo institucional de administración.',
	},
	{
		value: 'reception',
		label: 'Recepción',
		icon: Users,
		hint: 'Ingresa con tu correo institucional de recepción.',
	},
] as const;

export function LoginForm() {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [profile, setProfile] =
		useState<(typeof SERVICE_PROFILES)[number]['value']>('vet');
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<Login>({ resolver: zodResolver(loginSchema) });

	const activeProfile = SERVICE_PROFILES.find((item) => item.value === profile);

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

		router.push('/admin');
		router.refresh();
	}

	return (
		<section className="flex w-full flex-col justify-between overflow-y-auto p-6 sm:p-10 lg:w-[54%] lg:p-12 xl:w-1/2 xl:p-16">
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
						Sistema Integrado de Gestión Clínica
					</p>
				</div>
			</div>

			<div className="mx-auto my-auto w-full max-w-md py-8">
				<div className="mb-7">
					<h2 className="text-2xl font-semibold tracking-tight text-balance">
						Acceso institucional
					</h2>
					<p className="mt-1 text-sm text-muted-foreground">
						Ingresa tus credenciales para acceder al sistema de gestión.
					</p>
				</div>

				<div className="mb-6">
					<span className="mb-2 block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
						Perfil de servicio
					</span>
					<div
						className="grid grid-cols-3 gap-1.5 rounded-lg border bg-muted/40 p-1"
						role="tablist"
					>
						{SERVICE_PROFILES.map((item) => (
							<button
								key={item.value}
								type="button"
								role="tab"
								aria-selected={profile === item.value}
								onClick={() => setProfile(item.value)}
								className={`flex items-center justify-center gap-1.5 rounded-md px-2.5 py-2 text-xs font-medium transition-colors ${
									profile === item.value
										? 'bg-card text-primary shadow-sm ring-1 ring-foreground/10'
										: 'text-muted-foreground hover:text-foreground'
								}`}
							>
								<item.icon className="size-3.5" />
								{item.label}
							</button>
						))}
					</div>
					{activeProfile && (
						<p className="mt-2 text-xs text-muted-foreground">
							{activeProfile.hint}
						</p>
					)}
				</div>

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
								placeholder="doctor@sanroque.com"
								{...register('email')}
							/>
						</InputGroup>
						<FieldError errors={errors.email ? [errors.email] : undefined} />
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
					<Button type="submit" className="w-full" disabled={isSubmitting}>
						Iniciar sesión
						<ArrowRight />
					</Button>
				</form>
			</div>

			<div className="flex flex-col items-center justify-between gap-2 border-t pt-4 text-xs text-muted-foreground sm:flex-row">
				<p>© {new Date().getFullYear()} Veterinaria San Roque S.A. de C.V.</p>
				<p>Soporte técnico: +503 2257-8900</p>
			</div>
		</section>
	);
}
