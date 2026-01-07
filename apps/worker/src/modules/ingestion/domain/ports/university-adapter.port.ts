import { SyllabusDataDto } from "@ncbs/dtos";

export interface PaginationMetadata {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  metadata: PaginationMetadata;
}

export interface FetchPageParams {
  page: number;
  pageSize: number;
  year?: string;
  semester?: string;
}

export interface IUniversityAdapter {
  normalize(rawData: unknown): {
    courseCode: string;
    courseName: string;
    credits: number;
    grade: string;
    semester: string;
    academicYear: number;
  }[];

  normalizeSyllabus(
    rawData: unknown,
    filters?: { academicYear?: string; semester?: string }
  ): SyllabusDataDto[];

  /**
   * Fetch a specific page of data from the university API
   * @param params - Pagination parameters
   * @returns Paginated response with items and metadata
   */
  fetchPage(params: FetchPageParams): Promise<PaginatedResponse<any>>;
}
