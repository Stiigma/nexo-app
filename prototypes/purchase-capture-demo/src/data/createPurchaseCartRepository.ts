import { PurchaseCartRepository } from "./purchaseCartRepository";
import { createBrowserSqliteDatabase } from "./sqliteWasmDatabase";

let repositoryPromise: Promise<PurchaseCartRepository> | undefined;

export async function createPurchaseCartRepository(): Promise<PurchaseCartRepository> {
  repositoryPromise ??= createRepository();
  return repositoryPromise;
}

async function createRepository(): Promise<PurchaseCartRepository> {
  const database = await createBrowserSqliteDatabase();
  const repository = new PurchaseCartRepository(database);
  repository.initialize();
  return repository;
}
