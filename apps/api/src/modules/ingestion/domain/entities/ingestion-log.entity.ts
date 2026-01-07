// Pure domain logic - no frameworks, no DB
export class IngestionLogEntity {
  constructor(
    public readonly universityId: string,
    public readonly studentId: string,
    public readonly rawData: unknown
  ) {}

  validate(): boolean {
    // Domain validation logic
    return !!this.universityId && !!this.studentId && !!this.rawData;
  }
}
