import type {
  DataSource,
  EntityTarget,
  ObjectLiteral,
  Repository,
} from "typeorm";
import { AppDataSource } from "./data-source";

let dataSource: DataSource | null = null;

export async function getDataSource(): Promise<DataSource> {
  if (!dataSource) {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    dataSource = AppDataSource;
  }
  return dataSource;
}

export async function closeDataSource(): Promise<void> {
  if (dataSource?.isInitialized) {
    await dataSource.destroy();
    dataSource = null;
  }
}

// Export repository getters for convenience
export async function getRepository<T extends ObjectLiteral>(
  entity: EntityTarget<T>
): Promise<Repository<T>> {
  const ds = await getDataSource();
  return ds.getRepository(entity);
}
