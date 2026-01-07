import { Injectable } from "@nestjs/common";
import { SyllabusDataDto } from "@ncbs/dtos";
import {
  FetchPageParams,
  IUniversityAdapter,
  PaginatedResponse,
} from "../../domain/ports/university-adapter.port";

@Injectable()
export class KmitlSyllabusAdapter implements IUniversityAdapter {
  normalize(rawData: unknown): {
    courseCode: string;
    courseName: string;
    credits: number;
    grade: string;
    semester: string;
    academicYear: number;
  }[] {
    if (!rawData || typeof rawData !== "object") {
      return [];
    }

    const data = rawData as { courses?: unknown[] };
    if (!Array.isArray(data.courses)) {
      return [];
    }

    return data.courses.map((course: any) => ({
      courseCode: course.code || "",
      courseName: course.name || "",
      credits: parseFloat(course.credits) || 0,
      grade: course.grade || "",
      semester: course.semester || "",
      academicYear: parseInt(course.year) || 0,
    }));
  }

  normalizeSyllabus(
    rawData: unknown,
    filters?: { academicYear?: string; semester?: string }
  ): SyllabusDataDto[] {
    if (!rawData || typeof rawData !== "object") {
      return [];
    }

    const data = rawData as {
      status?: number;
      data?: Record<
        string,
        {
          status?: number;
          data?: {
            title?: string;
            basic_information?: {
              course_no?: string;
              course_title_th?: string;
              course_title_en?: string;
              credits?: string;
              school?: {
                school_id?: number;
                school_name_th?: string;
                school_name_en?: string;
              };
              department?: {
                department_id?: number;
                department_name_th?: string;
                department_name_en?: string;
              };
            };
            course_information?: {
              academic_year?: string;
            };
          };
        }
      >;
    };

    if (data.status !== 1 || !data.data) {
      return [];
    }

    const normalizedSyllabi: SyllabusDataDto[] = [];

    for (const [courseId, courseData] of Object.entries(data.data)) {
      if (courseData.status !== 1 || !courseData.data) {
        continue;
      }

      const basicInfo = courseData.data.basic_information;
      const courseInfo = courseData.data.course_information;

      // Extract academic year and semester from title or course_information
      const academicYear =
        courseInfo?.academic_year ||
        courseData.data.title?.match(/\d{4}/)?.[0] ||
        String(new Date().getFullYear() + 543); // Thai Buddhist year
      const semester = courseData.data.title?.match(/\((\d+)\)/)?.[1] || "1";

      // Filter by academic year and semester if provided
      if (filters?.academicYear && academicYear !== filters.academicYear) {
        continue;
      }
      if (filters?.semester && semester !== filters.semester) {
        continue;
      }

      normalizedSyllabi.push({
        courseId,
        courseNo: basicInfo?.course_no || "",
        courseTitleTh: basicInfo?.course_title_th || "",
        courseTitleEn: basicInfo?.course_title_en || "",
        credits: basicInfo?.credits || "",
        school: {
          schoolId: basicInfo?.school?.school_id || 0,
          schoolNameTh: basicInfo?.school?.school_name_th || "",
          schoolNameEn: basicInfo?.school?.school_name_en || "",
        },
        department: {
          departmentId: basicInfo?.department?.department_id || 0,
          departmentNameTh: basicInfo?.department?.department_name_th || "",
          departmentNameEn: basicInfo?.department?.department_name_en || "",
        },
        academicYear,
        semester,
        rawData: courseData.data,
      });
    }

    return normalizedSyllabi;
  }

  fetchPage(
    _params: FetchPageParams
  ): Promise<PaginatedResponse<SyllabusDataDto>> {
    throw new Error("Method not implemented.");
  }
}
