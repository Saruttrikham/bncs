import { IngestionStatus } from "@ncbs/dtos";

type IngestionLogDto = {
  id: string;
  universityId: string;
  studentId: string;
  rawData: unknown;
  status: IngestionStatus;
  errorMessage: string | null;
  processedAt: Date | null;
  createdAt: Date;
};

export class IngestionLogEntity {
  public readonly id: string;
  public readonly universityId: string;
  public readonly studentId: string;
  public readonly rawData: unknown;
  public readonly status: IngestionStatus;
  public readonly errorMessage: string | null;
  public readonly processedAt: Date | null;
  public readonly createdAt: Date;

  constructor(dto: IngestionLogDto) {
    this.id = dto.id;
    this.universityId = dto.universityId;
    this.studentId = dto.studentId;
    this.rawData = dto.rawData;
    this.status = dto.status;
    this.errorMessage = dto.errorMessage;
    this.processedAt = dto.processedAt;
    this.createdAt = dto.createdAt;
  }

  getValue(): IngestionLogDto {
    return {
      id: this.id,
      universityId: this.universityId,
      studentId: this.studentId,
      rawData: this.rawData,
      status: this.status,
      errorMessage: this.errorMessage,
      processedAt: this.processedAt,
      createdAt: this.createdAt,
    };
  }
}
