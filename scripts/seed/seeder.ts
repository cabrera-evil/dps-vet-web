export interface Seeder {
	readonly name: string;
	run(): Promise<void>;
}
