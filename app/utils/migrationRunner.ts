import * as SQLite from 'expo-sqlite';
import { migrations, getLatestVersion, type Migration } from './migrations';

/**
 * Schema version record stored in the database
 */
interface SchemaVersionRecord {
	version: number;
	applied_at: string;
}

/**
 * Create the schema_version table if it doesn't exist
 */
async function ensureSchemaVersionTable(db: SQLite.SQLiteDatabase): Promise<void> {
	await db.execAsync(`
		CREATE TABLE IF NOT EXISTS schema_version (
			version INTEGER PRIMARY KEY,
			applied_at TEXT NOT NULL
		);
	`);
}

/**
 * Get the current database schema version
 * Returns 0 if no migrations have been applied yet
 */
async function getCurrentVersion(db: SQLite.SQLiteDatabase): Promise<number> {
	const result = await db.getFirstAsync<{ version: number }>('SELECT MAX(version) as version FROM schema_version');
	return result?.version ?? 0;
}

/**
 * Record a migration as applied
 */
async function recordMigration(db: SQLite.SQLiteDatabase, version: number): Promise<void> {
	const appliedAt = new Date().toISOString();
	await db.runAsync('INSERT INTO schema_version (version, applied_at) VALUES (?, ?)', [version, appliedAt]);
}

/**
 * Remove a migration record (used during rollback)
 */
async function removeMigrationRecord(db: SQLite.SQLiteDatabase, version: number): Promise<void> {
	await db.runAsync('DELETE FROM schema_version WHERE version = ?', [version]);
}

/**
 * Check if the database has existing tables but no schema_version
 * This indicates a pre-migration database that needs baseline versioning
 */
async function isExistingDatabase(db: SQLite.SQLiteDatabase): Promise<boolean> {
	const result = await db.getFirstAsync<{ count: number }>(
		"SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='decks'"
	);
	return (result?.count ?? 0) > 0;
}

/**
 * Run a single migration within a transaction
 */
async function executeMigration(db: SQLite.SQLiteDatabase, migration: Migration, direction: 'up' | 'down'): Promise<void> {
	const handler = direction === 'up' ? migration.up : migration.down;

	if (!handler) {
		throw new Error(`Migration ${migration.version} (${migration.name}) does not support ${direction}`);
	}

	try {
		await handler(db);

		if (direction === 'up') {
			await recordMigration(db, migration.version);
		} else {
			await removeMigrationRecord(db, migration.version);
		}

		console.log(`✓ Migration ${migration.version} (${migration.name}) ${direction} completed`);
	} catch (error) {
		console.error(`✗ Migration ${migration.version} (${migration.name}) ${direction} failed:`, error);
		throw error;
	}
}

/**
 * Run all pending migrations
 * Returns the number of migrations applied
 */
export async function runMigrations(db: SQLite.SQLiteDatabase): Promise<number> {
	await ensureSchemaVersionTable(db);

	const currentVersion = await getCurrentVersion(db);
	const latestVersion = getLatestVersion();

	// Handle existing databases without schema_version
	// If database has tables but no version, mark version 1 as applied
	if (currentVersion === 0 && (await isExistingDatabase(db))) {
		console.log('Existing database detected, setting baseline version to 1');
		await recordMigration(db, 1);
		const updatedVersion = await getCurrentVersion(db);
		return runMigrationsFromVersion(db, updatedVersion);
	}

	return runMigrationsFromVersion(db, currentVersion);
}

/**
 * Run migrations starting from a specific version
 */
async function runMigrationsFromVersion(db: SQLite.SQLiteDatabase, fromVersion: number): Promise<number> {
	const pendingMigrations = migrations.filter((m) => m.version > fromVersion);

	if (pendingMigrations.length === 0) {
		console.log(`Database is up to date (version ${fromVersion})`);
		return 0;
	}

	console.log(`Running ${pendingMigrations.length} migration(s) from version ${fromVersion}...`);

	// Sort migrations by version to ensure correct order
	pendingMigrations.sort((a, b) => a.version - b.version);

	for (const migration of pendingMigrations) {
		await executeMigration(db, migration, 'up');
	}

	console.log(`Migrations complete. Database now at version ${getLatestVersion()}`);
	return pendingMigrations.length;
}

/**
 * Rollback migrations to a specific version
 * Returns the number of migrations rolled back
 */
export async function rollbackToVersion(db: SQLite.SQLiteDatabase, targetVersion: number): Promise<number> {
	await ensureSchemaVersionTable(db);

	const currentVersion = await getCurrentVersion(db);

	if (targetVersion >= currentVersion) {
		console.log(`Target version ${targetVersion} >= current version ${currentVersion}, nothing to rollback`);
		return 0;
	}

	// Get migrations to rollback in reverse order
	const migrationsToRollback = migrations.filter((m) => m.version > targetVersion && m.version <= currentVersion).sort((a, b) => b.version - a.version);

	console.log(`Rolling back ${migrationsToRollback.length} migration(s) to version ${targetVersion}...`);

	for (const migration of migrationsToRollback) {
		if (!migration.down) {
			throw new Error(`Cannot rollback: Migration ${migration.version} (${migration.name}) has no down handler`);
		}
		await executeMigration(db, migration, 'down');
	}

	console.log(`Rollback complete. Database now at version ${targetVersion}`);
	return migrationsToRollback.length;
}

/**
 * Get migration status information
 */
export async function getMigrationStatus(db: SQLite.SQLiteDatabase): Promise<{
	currentVersion: number;
	latestVersion: number;
	pendingMigrations: number;
	appliedMigrations: SchemaVersionRecord[];
}> {
	await ensureSchemaVersionTable(db);

	const currentVersion = await getCurrentVersion(db);
	const latestVersion = getLatestVersion();
	const appliedMigrations = await db.getAllAsync<SchemaVersionRecord>('SELECT * FROM schema_version ORDER BY version ASC');

	return {
		currentVersion,
		latestVersion,
		pendingMigrations: migrations.filter((m) => m.version > currentVersion).length,
		appliedMigrations,
	};
}
