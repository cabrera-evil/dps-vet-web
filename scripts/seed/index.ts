import type { Seeder } from './seeder';
import { adminSeeder } from './seeders/admin.seeder';
import { breedSeeder } from './seeders/breed.seeder';
import { permissionSeeder } from './seeders/permission.seeder';
import { roleSeeder } from './seeders/role.seeder';
import { serviceSeeder } from './seeders/service.seeder';
import { speciesSeeder } from './seeders/species.seeder';

// Order matters: roles reference permission codes, so permissions seed
// first; the admin user references the ADMINISTRADOR role's permissions, so
// it seeds last. Species/breeds/services are independent catalogs and can
// seed anywhere in between.
const seeders: Seeder[] = [
	permissionSeeder,
	roleSeeder,
	speciesSeeder,
	breedSeeder,
	serviceSeeder,
	adminSeeder,
];

async function main() {
	for (const seeder of seeders) {
		process.stdout.write(`Seeding ${seeder.name}...\n`);
		await seeder.run();
	}
	process.stdout.write('Seed complete.\n');
}

main().catch((error: unknown) => {
	process.stderr.write(`${error instanceof Error ? error.stack : error}\n`);
	process.exitCode = 1;
});
