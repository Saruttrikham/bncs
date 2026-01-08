import { Injectable } from "@nestjs/common";
import { SyllabusDataDto } from "@ncbs/dtos";

import * as fs from "node:fs";
import * as path from "node:path";
import {
  FetchPageParams,
  IUniversityAdapter,
  PaginatedResponse,
} from "src/modules/ingestion/domain/ports/university-adapter.port";
import { randomUUID } from "node:crypto";

@Injectable()
export class ChulaSyllabusAdapter implements IUniversityAdapter {
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
    const data = rawData as {
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

    console.log(data, " data");

    const normalizedSyllabi: SyllabusDataDto[] = [];

    const basicInfo = data.basic_information;
    console.log(basicInfo, " basicInfo");

    normalizedSyllabi.push({
      courseId: randomUUID(),
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
      academicYear: data.course_information?.academic_year || "",
      semester: "",
      rawData: JSON.stringify(basicInfo),
    });

    return normalizedSyllabi;
  }

  fetchPage(_params: FetchPageParams): Promise<PaginatedResponse<any>> {
    const mockDataPath = path.join(
      process.cwd(),
      "syllabus_listbyyearsem.json"
    );

    if (!fs.existsSync(mockDataPath)) {
      throw new Error(`Mock syllabus file not found at: ${mockDataPath}`);
    }

    const rawData = JSON.parse(fs.readFileSync(mockDataPath, "utf-8"));
    return Promise.resolve({
      items: Object.values(rawData.data).map((item: any) => item.data),
      metadata: {
        totalItems: Object.values(rawData.data).length,
        totalPages: 2,
        currentPage: 1,
        pageSize: 100,
        hasNextPage: true,
      },
    } as unknown as PaginatedResponse<any>);
  }
}
