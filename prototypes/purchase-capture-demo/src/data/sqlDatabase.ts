export type SqlBind = Record<string, unknown> | unknown[];

export type SqlDatabase = {
  exec(sql: string): void;
  run(sql: string, bind?: SqlBind): void;
  selectObjects<T>(sql: string, bind?: SqlBind): T[];
  selectObject<T>(sql: string, bind?: SqlBind): T | undefined;
  selectValue<T>(sql: string, bind?: SqlBind): T | undefined;
  transaction<T>(callback: () => T): T;
  close?(): void;
};
