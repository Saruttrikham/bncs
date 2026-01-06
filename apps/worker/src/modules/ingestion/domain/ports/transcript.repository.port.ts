import { CreateTranscriptDto } from "@ncbs/dtos";

/**
 * Port: Interface for Transcript Repository
 * Application layer depends on this interface, not concrete implementation
 */
export interface ITranscriptRepository {
  create(dto: CreateTranscriptDto): Promise<void>;
}
