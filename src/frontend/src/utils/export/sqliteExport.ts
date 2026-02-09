import type { FilteredExportData } from './exportFilters';
import type { TranslationKey } from '../../i18n/translations';

type TranslationFunction = (key: TranslationKey) => string;

// Define minimal types for sql.js since we're loading it dynamically
interface SqlJsStatic {
  Database: new (data?: ArrayLike<number> | Buffer | null) => SqlJsDatabase;
}

interface SqlJsDatabase {
  run(sql: string, params?: any[]): void;
  prepare(sql: string): SqlJsStatement;
  export(): Uint8Array;
  close(): void;
}

interface SqlJsStatement {
  run(params?: any[]): void;
  free(): void;
}

interface InitSqlJs {
  (config?: { locateFile?: (file: string) => string }): Promise<SqlJsStatic>;
}

/**
 * Dynamically loads sql.js from CDN
 */
async function loadSqlJs(): Promise<SqlJsStatic> {
  // Check if already loaded
  if ((window as any).initSqlJs) {
    return (window as any).initSqlJs({
      locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
    });
  }

  // Load the script dynamically
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://sql.js.org/dist/sql-wasm.js';
    script.async = true;
    
    script.onload = async () => {
      try {
        const initSqlJs = (window as any).initSqlJs as InitSqlJs;
        const SQL = await initSqlJs({
          locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
        });
        resolve(SQL);
      } catch (error) {
        reject(error);
      }
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load sql.js library'));
    };
    
    document.head.appendChild(script);
  });
}

/**
 * Generates a SQLite database from filtered export data
 * Creates tables for benches, components, and history based on included sections
 */
export async function generateSqliteDatabase(
  data: FilteredExportData,
  t: TranslationFunction
): Promise<Blob> {
  try {
    // Load SQL.js dynamically from CDN
    const SQL = await loadSqlJs();

    // Create a new database
    const db = new SQL.Database();

    // Create and populate benches table if data is included
    if (data.benches.length > 0) {
      db.run(`
        CREATE TABLE benches (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          serial_number TEXT,
          agile_code TEXT,
          plm_agile_url TEXT,
          decaweb_url TEXT,
          description TEXT,
          tags TEXT
        )
      `);

      const insertBench = db.prepare(
        'INSERT INTO benches (id, name, serial_number, agile_code, plm_agile_url, decaweb_url, description, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      );

      data.benches.forEach((bench) => {
        const tags = bench.tags.map((t) => t.tagName).join(', ');
        insertBench.run([
          bench.id,
          bench.name,
          bench.serialNumber,
          bench.agileCode,
          bench.plmAgileUrl,
          bench.decawebUrl,
          bench.description,
          tags,
        ]);
      });

      insertBench.free();
    }

    // Create and populate components table if data is included
    if (data.components.length > 0) {
      db.run(`
        CREATE TABLE components (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          bench_id TEXT NOT NULL,
          bench_name TEXT NOT NULL,
          component_name TEXT NOT NULL,
          manufacturer_reference TEXT,
          validity_date TEXT,
          expiration_date TEXT,
          status TEXT
        )
      `);

      const insertComponent = db.prepare(
        'INSERT INTO components (bench_id, bench_name, component_name, manufacturer_reference, validity_date, expiration_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)'
      );

      data.components.forEach(({ benchId, benchName, components }) => {
        components.forEach((comp) => {
          insertComponent.run([
            benchId,
            benchName,
            comp.componentName,
            comp.manufacturerReference,
            comp.validityDate,
            comp.expirationDate,
            comp.status,
          ]);
        });
      });

      insertComponent.free();
    }

    // Create and populate history table if data is included
    if (data.history.length > 0) {
      db.run(`
        CREATE TABLE history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          bench_id TEXT NOT NULL,
          bench_name TEXT NOT NULL,
          timestamp TEXT NOT NULL,
          action TEXT NOT NULL,
          user_principal TEXT NOT NULL,
          user_name TEXT,
          user_entity TEXT,
          details TEXT
        )
      `);

      const insertHistory = db.prepare(
        'INSERT INTO history (bench_id, bench_name, timestamp, action, user_principal, user_name, user_entity, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      );

      data.history.forEach(({ benchId, benchName, entries }) => {
        entries.forEach((entry) => {
          const timestamp = new Date(Number(entry.timestamp) / 1_000_000).toISOString();
          const userPrincipal = entry.user.toString();
          const user = data.userMap.get(userPrincipal);
          const userName = user?.username || '';
          const userEntity = user?.entity || '';

          insertHistory.run([
            benchId,
            benchName,
            timestamp,
            entry.action,
            userPrincipal,
            userName,
            userEntity,
            entry.details,
          ]);
        });
      });

      insertHistory.free();
    }

    // Export the database to a Uint8Array
    const binaryArray = db.export();
    
    // Close the database
    db.close();

    // Create a Blob from the binary array - convert to standard Uint8Array to fix type compatibility
    const blob = new Blob([new Uint8Array(binaryArray)], { type: 'application/x-sqlite3' });
    
    return blob;
  } catch (error: any) {
    console.error('SQLite generation error:', error);
    throw new Error(`Failed to generate SQLite database: ${error.message || String(error)}`);
  }
}
