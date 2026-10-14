import { Permission } from '@/constants/permission';
import { hasPermission } from '@/utils/permission';
import createHttpError from 'http-errors';
import type { Identity } from './http.types';

export function isClinicalStaff(identity: Identity): boolean {
	return hasPermission(identity.permissions, [
		Permission.MEDICAL_RECORDS_MANAGE_ALL,
	]);
}

/**
 * Clinical writes are staff-only: the caller must hold
 * {@link Permission.MEDICAL_RECORDS_MANAGE_ALL}. Route-level permissions gate
 * the endpoint; this keeps the rule inside the service as well.
 */
export function assertClinicalStaff(identity: Identity): void {
	if (!isClinicalStaff(identity)) throw new createHttpError.Forbidden();
}

/**
 * Clinical reads: staff read any pet; an owner holding
 * {@link Permission.MEDICAL_RECORDS_READ} reads only their own pets. Anyone
 * else gets a 404 so a pet's existence is never revealed.
 */
export function assertCanReadPetRecord(
	identity: Identity,
	pet: { ownerId: string } | null
): asserts pet is { ownerId: string } {
	const isOwnerReader =
		!!pet &&
		pet.ownerId === identity.uid &&
		hasPermission(identity.permissions, [Permission.MEDICAL_RECORDS_READ]);
	if (!pet || !(isClinicalStaff(identity) || isOwnerReader))
		throw new createHttpError.NotFound('Pet not found');
}
