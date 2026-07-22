import sqlite3InitModule from "@sqlite.org/sqlite-wasm";
import type { SqlBind, SqlDatabase } from "./sqlDatabase";

type SqliteOo1Database = {
  exec(input: string | { sql: string; bind?: SqlBind; rowMode?: string }): unknown;
  selectObjects<T>(sql: string, bind?: SqlBind): T[];
  selectObject<T>(sql: string, bind?: SqlBind): T | undefined;
  selectValue<T>(sql: string, bind?: SqlBind): T | undefined;
  transaction<T>(callback: () => T): T;
  close(): void;
};

type SqliteModule = {
  oo1: {
    DB: new (filename?: string, flags?: string) => SqliteOo1Database;
    JsStorageDb?: new (storageName: "local" | "session") => SqliteOo1Database;
  };
};

let sqliteModulePromise: Promise<SqliteModule> | undefined;

export async function createBrowserSqliteDatabase(): Promise<SqlDatabase> {
  const sqlite3 = await loadSqliteModule();
  const database = sqlite3.oo1.JsStorageDb
    ? new sqlite3.oo1.JsStorageDb("local")
    : new sqlite3.oo1.DB("file:local?vfs=kvvfs", "c");

  return new SqliteWasmDatabase(database);
}

async function loadSqliteModule(): Promise<SqliteModule> {
  sqliteModulePromise ??= sqlite3InitModule() as unknown as Promise<SqliteModule>;

  return sqliteModulePromise;
}

class SqliteWasmDatabase implements SqlDatabase {
  constructor(private readonly database: SqliteOo1Database) {}

  exec(sql: string): void {
    this.database.exec(sql);
  }

  run(sql: string, bind?: SqlBind): void {
    if (bind) {
      this.database.exec({ sql, bind });
      return;
    }

    this.database.exec(sql);
  }

  selectObjects<T>(sql: string, bind?: SqlBind): T[] {
    return this.database.selectObjects<T>(sql, bind);
  }

  selectObject<T>(sql: string, bind?: SqlBind): T | undefined {
    return this.database.selectObject<T>(sql, bind);
  }

  selectValue<T>(sql: string, bind?: SqlBind): T | undefined {
    return this.database.selectValue<T>(sql, bind);
  }

  transaction<T>(callback: () => T): T {
    return this.database.transaction(callback);
  }

  close(): void {
    this.database.close();
  }
}
