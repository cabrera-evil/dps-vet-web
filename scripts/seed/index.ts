import type { Seeder } from './seeder';
import { adminSeeder } from './seeders/admin.seeder';
import { permissionSeeder } from './seeders/permission.seeder';
import { roleSeeder } from './seeders/role.seeder';

// Order matters: roles reference permission codes, so permissions seed
// first; the admin user references the ADMINISTRADOR role's permissions, so
// it seeds last. Add future catalog seeders (e.g. pet species, service
// categories) here, before adminSeeder.
const seeders: Seeder[] = [permissionSeeder, roleSeeder, adminSeeder];

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
