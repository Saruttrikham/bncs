/**
 * Port: Interface for Syllabus Data Source
 * Abstracts data fetching (file system, HTTP API, etc.)
 * Application layer depends on this interface, not concrete implementation
 */
export interface ISyllabusDataSource {
  fetchRawData(): Promise<unknown>;
}
