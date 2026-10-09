import { Permission } from '@/constants/permission';
import { hasPermission } from '@/utils/permission';
import createHttpError from 'http-errors';
import type { Identity } from './http.types';

/**
 * Clinical records are staff-only in Phase 1: the caller must hold
 * {@link Permission.MEDICAL_RECORDS_MANAGE_ALL}. Route-level permissions gate
 * the endpoint; this keeps the rule inside the service as well.
 */
export function assertClinicalStaff(identity: Identity): void {
	if (
		!hasPermission(identity.permissions, [
			Permission.MEDICAL_RECORDS_MANAGE_ALL,
		])
	)
		throw new createHttpError.Forbidden();
}
