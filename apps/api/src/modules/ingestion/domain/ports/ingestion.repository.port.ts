import { CreateIngestionLogDto, IngestionLogDto } from "@ncbs/dtos";

export interface IIngestionRepository {
  create(dto: CreateIngestionLogDto): Promise<IngestionLogDto>;

  findById(id: string): Promise<IngestionLogDto | null>;
}
