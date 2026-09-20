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
import { Stethoscope } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

export function LoginForm() {
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Firebase client sign-in is not wired yet; this collects credentials only.
	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setIsSubmitting(true);
		toast.info('La autenticación con Firebase aún no está conectada.');
		setIsSubmitting(false);
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
				<form className="flex flex-col gap-4" onSubmit={handleSubmit}>
					<Field>
						<FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
						<Input
							id="email"
							name="email"
							type="email"
							autoComplete="email"
							placeholder="doctor@sanroque.com"
							required
						/>
						<FieldError />
					</Field>
					<Field>
						<FieldLabel htmlFor="password">Contraseña</FieldLabel>
						<Input
							id="password"
							name="password"
							type="password"
							autoComplete="current-password"
							required
						/>
						<FieldError />
					</Field>
					<Button type="submit" className="w-full" disabled={isSubmitting}>
						Iniciar sesión
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
