import { deployFirestoreIndexes } from './deploy-firestore-indexes';

async function main() {
	process.stdout.write('Deploying Firestore indexes...\n');
	await deployFirestoreIndexes();
	process.stdout.write('Firestore index deploy complete.\n');
}

main().catch((error: unknown) => {
	process.stderr.write(`${error instanceof Error ? error.stack : error}\n`);
	process.exitCode = 1;
});
