import {
	assertCanReadPetRecord,
	isClinicalStaff,
} from '@/app/api/_shared/http/authorization';
import type { Identity } from '@/app/api/_shared/http/http.types';
import type { FirestoreReadRepository } from '@/app/api/_shared/repository/repository.contract';
import type { FirestoreQueryOptions } from '@/app/api/_shared/repository/repository.types';
import type { Pet } from '@/app/api/pets/pet.schema';
import { ConsultationStatus } from '@/constants/enum';
import type {
	ClinicalEncounter,
	ListEncountersQuery,
} from './encounter.schema';
import type { EncounterListResult } from './encounter.types';

/**
 * Read-only history of a patient's clinical attentions, most recent first.
 * Depends only on read-repository abstractions (DIP); concrete repositories
 * are chosen in `encounter.module.ts`.
 */
export class EncounterService {
	constructor(
		private readonly repo: FirestoreReadRepository<ClinicalEncounter>,
		private readonly petRepo: FirestoreReadRepository<Pet>
	) {}

	async list(
		identity: Identity,
		petId: string,
		query: ListEncountersQuery
	): Promise<EncounterListResult> {
		assertCanReadPetRecord(identity, await this.petRepo.findById(petId));

		const { page, pageSize } = query;
		// Owners only see finalized attentions, never drafts.
		const status = isClinicalStaff(identity)
			? query.status
			: ConsultationStatus.FINALIZED;
		const clauses: NonNullable<
			FirestoreQueryOptions<ClinicalEncounter>['where']
		> = [{ field: 'petId', op: '==', value: petId }];
		if (status) clauses.push({ field: 'status', op: '==', value: status });

		const [items, total] = await Promise.all([
			this.repo.findMany({
				where: clauses,
				orderBy: [{ field: 'occurredAt', direction: 'desc' }],
				offset: (page - 1) * pageSize,
				limit: pageSize,
			}),
			this.repo.count({ where: clauses }),
		]);

		return {
			items,
			pagination: {
				page,
				pageSize,
				total,
				pageCount: Math.max(1, Math.ceil(total / pageSize)),
			},
		};
	}
}
