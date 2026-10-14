import {
	BODY_CONDITION_OPTIONS,
	CAPILLARY_REFILL_OPTIONS,
	HYDRATION_OPTIONS,
	MUCOUS_MEMBRANE_OPTIONS,
	PAIN_OPTIONS,
	type SelectOption,
} from '@/constants/clinical';
import type { ConsultationMeasurements } from '@/types/consultation.type';
import { ClinicalDataList } from './clinical-data-list';

const labelOf = (options: SelectOption[], value?: string | number) =>
	options.find((option) => option.value === String(value))?.label;

export function MeasurementGrid({
	measurements,
}: {
	measurements: ConsultationMeasurements;
}) {
	const items = [
		{
			label: 'Peso',
			value: measurements.weightKg && `${measurements.weightKg} kg`,
		},
		{
			label: 'Temperatura',
			value: measurements.temperatureC && `${measurements.temperatureC} °C`,
		},
		{
			label: 'Frecuencia cardíaca',
			value: measurements.heartRateBpm && `${measurements.heartRateBpm} lpm`,
		},
		{
			label: 'Frecuencia respiratoria',
			value:
				measurements.respiratoryRateRpm &&
				`${measurements.respiratoryRateRpm} rpm`,
		},
		{
			label: 'Condición corporal',
			value: labelOf(BODY_CONDITION_OPTIONS, measurements.bodyConditionScore),
		},
		{
			label: 'Hidratación',
			value: labelOf(HYDRATION_OPTIONS, measurements.hydration),
		},
		{
			label: 'Mucosas',
			value: labelOf(MUCOUS_MEMBRANE_OPTIONS, measurements.mucousMembranes),
		},
		{
			label: 'Llenado capilar',
			value: labelOf(CAPILLARY_REFILL_OPTIONS, measurements.capillaryRefill),
		},
		{ label: 'Dolor', value: labelOf(PAIN_OPTIONS, measurements.pain) },
	];

	return <ClinicalDataList items={items} className="lg:grid-cols-4" />;
}
