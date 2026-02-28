import * as SQLite from 'expo-sqlite';

/**
 * Runtime FTS5 support detection.
 *
 * Instead of relying on `Platform.OS` (which is fragile and caused issues on
 * web where the WASM SQLite build doesn't bundle the fts5 extension), we query
 * the database engine directly to check whether the module is loaded.
 *
 * Usage:
 *   await detectFts5Support(db);   // run once during init
 *   if (isFts5Supported()) { … }   // fast cached check everywhere else
 */

let _supported: boolean | null = null;

/**
 * Probe the open database to determine whether the fts5 module is available.
 * The result is cached for subsequent calls to `isFts5Supported()`.
 */
export async function detectFts5Support(db: SQLite.SQLiteDatabase): Promise<boolean> {
	if (_supported !== null) return _supported;

	try {
		const rows = await db.getAllAsync<{ name: string }>('PRAGMA module_list');
		_supported = rows.some((r) => r.name === 'fts5');
	} catch {
		// PRAGMA module_list may not be available in every build – safe default
		_supported = false;
	}

	return _supported;
}

/**
 * Return the cached FTS5 support flag.
 * Must be called **after** `detectFts5Support()` has resolved at least once.
 */
export function isFts5Supported(): boolean {
	if (_supported === null) {
		throw new Error('FTS5 support not yet detected. Call detectFts5Support(db) first.');
	}
	return _supported;
}

/**
 * Reset the cached value (useful for tests or after database re-init).
 */
export function resetFts5Detection(): void {
	_supported = null;
}
