import initSqlJs, { type Database } from "sql.js";
import type { SqlBind, SqlDatabase } from "../data/sqlDatabase";

export async function createTestSqlDatabase(): Promise<SqlDatabase> {
  const sql = await initSqlJs();
  return new SqlJsDatabase(new sql.Database());
}

class SqlJsDatabase implements SqlDatabase {
  constructor(private readonly database: Database) {}

  exec(sql: string): void {
    this.database.exec(sql);
  }

  run(sql: string, bind?: SqlBind): void {
    const statement = this.database.prepare(sql);

    try {
      if (bind) {
        statement.bind(bind as never);
      }

      while (statement.step()) {
        // Consume all rows for statements which happen to return data.
      }
    } finally {
      statement.free();
    }
  }

  selectObjects<T>(sql: string, bind?: SqlBind): T[] {
    const statement = this.database.prepare(sql);
    const rows: T[] = [];

    try {
      if (bind) {
        statement.bind(bind as never);
      }

      while (statement.step()) {
        rows.push(statement.getAsObject() as T);
      }
    } finally {
      statement.free();
    }

    return rows;
  }

  selectObject<T>(sql: string, bind?: SqlBind): T | undefined {
    return this.selectObjects<T>(sql, bind)[0];
  }

  selectValue<T>(sql: string, bind?: SqlBind): T | undefined {
    const statement = this.database.prepare(sql);

    try {
      if (bind) {
        statement.bind(bind as never);
      }

      if (!statement.step()) {
        return undefined;
      }

      return statement.get()[0] as T;
    } finally {
      statement.free();
    }
  }

  transaction<T>(callback: () => T): T {
    this.database.run("BEGIN");

    try {
      const result = callback();
      this.database.run("COMMIT");
      return result;
    } catch (error) {
      this.database.run("ROLLBACK");
      throw error;
    }
  }

  close(): void {
    this.database.close();
  }
}
