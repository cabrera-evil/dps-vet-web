'use client';

import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Login, loginSchema } from '@/schemas/login.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Stethoscope } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export function LoginForm() {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
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

		router.push('/');
		router.refresh();
	}

	return (
		<Card className="w-full max-w-sm">
			<CardHeader className="items-center text-center">
				<div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
					<Stethoscope className="size-5" />
				</div>
				<CardTitle>Veterinaria San Roque</CardTitle>
				<CardDescription>
					Ingresa tus credenciales para acceder al sistema de gestión
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
					<Field data-invalid={!!errors.email}>
						<FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
						<Input
							id="email"
							type="email"
							autoComplete="email"
							placeholder="doctor@sanroque.com"
							{...register('email')}
						/>
						<FieldError errors={errors.email ? [errors.email] : undefined} />
					</Field>
					<Field data-invalid={!!errors.password}>
						<FieldLabel htmlFor="password">Contraseña</FieldLabel>
						<Input
							id="password"
							type="password"
							autoComplete="current-password"
							{...register('password')}
						/>
						<FieldError
							errors={errors.password ? [errors.password] : undefined}
						/>
					</Field>
					<Button type="submit" className="w-full" disabled={isSubmitting}>
						Iniciar sesión
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
