import { ClinicalMeasurementType } from '@/constants/enum';
import { z } from 'zod';

/** Weight in kg, shared by consultations and pet registration. */
export const weightKgSchema = z.number().positive().max(1000);

/** `encounterId` is absent for a weight recorded outside a consultation (pet registration). */
export const clinicalMeasurementSchema = z.object({
	petId: z.string().min(1),
	encounterId: z.string().min(1).optional(),
	measurementType: z.nativeEnum(ClinicalMeasurementType),
	numericValue: z.number().positive(),
	unit: z.string().min(1),
	measuredAt: z.string(),
	createdAt: z.string(),
	createdBy: z.string(),
});

/** Which consultation measurement feeds each history type, and its unit. */
export const MEASUREMENT_SOURCES = {
	[ClinicalMeasurementType.WEIGHT]: { field: 'weightKg', unit: 'kg' },
	[ClinicalMeasurementType.TEMPERATURE]: { field: 'temperatureC', unit: '°C' },
	[ClinicalMeasurementType.HEART_RATE]: { field: 'heartRateBpm', unit: 'lpm' },
	[ClinicalMeasurementType.RESPIRATORY_RATE]: {
		field: 'respiratoryRateRpm',
		unit: 'rpm',
	},
} as const;

export type ClinicalMeasurement = z.infer<typeof clinicalMeasurementSchema>;
