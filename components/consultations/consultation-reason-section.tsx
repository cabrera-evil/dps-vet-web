'use client';

import { ClinicalTextarea } from '@/components/clinical/clinical-textarea';
import type { ConsultationFormValues } from '@/schemas/consultation.schema';
import { useFormContext } from 'react-hook-form';
import { ConsultationSection } from './consultation-section';

export function ConsultationReasonSection() {
	const {
		register,
		formState: { errors },
	} = useFormContext<ConsultationFormValues>();

	return (
		<ConsultationSection
			id="motivo"
			title="Motivo y anamnesis"
			description="Lo que reporta el propietario y cómo ha evolucionado."
		>
			<ClinicalTextarea
				id="consultation-reason"
				label="Motivo de consulta"
				required
				rows={2}
				placeholder="Ej.: Vómitos desde hace dos días y disminución del apetito."
				error={errors.reason}
				className="min-h-16"
				{...register('reason')}
			/>
			<ClinicalTextarea
				id="consultation-anamnesis"
				label="Anamnesis"
				required
				help="Describa los síntomas reportados, cuándo comenzaron y cómo han evolucionado. Puede incluir alimentación, consumo de agua, vómitos, tos, orina, defecación, comportamiento, medicamentos actuales y antecedentes relevantes."
				placeholder="Ej.: Propietario refiere vómitos desde hace dos días, disminución del apetito y menor consumo de agua..."
				rows={6}
				error={errors.anamnesis}
				{...register('anamnesis')}
			/>
		</ConsultationSection>
	);
}
