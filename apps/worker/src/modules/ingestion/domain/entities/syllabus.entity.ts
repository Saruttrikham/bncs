import { SyllabusDataDto } from "@ncbs/dtos";

type SyllabusEntityDto = {
  id: string;
  universityId: string;
  courseNo: string;
  credits: string;
  courseTitleTh: string;
  courseTitleEn: string;
  schoolId: string;
  schoolNameTh: string;
  schoolNameEn: string;
  departmentId: string;
  departmentNameTh: string;
  departmentNameEn: string;
  academicYear: string;
  semester: string;
  rawData: string;
};

export class SyllabusEntity {
  public readonly id: string;
  public readonly universityId: string;
  public readonly courseNo: string;
  public readonly credits: string;
  public readonly courseTitleTh: string;
  public readonly courseTitleEn: string;
  public readonly schoolId: string;
  public readonly schoolNameTh: string;
  public readonly schoolNameEn: string;
  public readonly departmentId: string;
  public readonly departmentNameTh: string;
  public readonly departmentNameEn: string;
  public readonly academicYear: string;
  public readonly semester: string;
  public readonly rawData: string;

  constructor(dto: SyllabusEntityDto) {
    this.id = dto.id;
    this.universityId = dto.universityId;
    this.courseNo = dto.courseNo;
    this.credits = dto.credits;
    this.courseTitleTh = dto.courseTitleTh;
    this.courseTitleEn = dto.courseTitleEn;
    this.schoolId = dto.schoolId;
    this.schoolNameTh = dto.schoolNameTh;
    this.schoolNameEn = dto.schoolNameEn;
    this.departmentId = dto.departmentId;
    this.departmentNameTh = dto.departmentNameTh;
    this.departmentNameEn = dto.departmentNameEn;
    this.academicYear = dto.academicYear;
    this.semester = dto.semester;
    this.rawData = dto.rawData;
  }

  /**
   * Create a domain entity from API data (DTO)
   */
  static fromDto(universityId: string, dto: SyllabusDataDto): SyllabusEntity {
    // Generate a unique ID from universityId, courseId, year, and semester
    const id = `${universityId}_${dto.courseId}_${dto.academicYear}_${dto.semester}`;

    return new SyllabusEntity({
      id,
      universityId,
      courseNo: dto.courseNo,
      credits: dto.credits,
      courseTitleTh: dto.courseTitleTh,
      courseTitleEn: dto.courseTitleEn,
      schoolId: dto.school.schoolId.toString(),
      schoolNameTh: dto.school.schoolNameTh,
      schoolNameEn: dto.school.schoolNameEn,
      departmentId: dto.department.departmentId.toString(),
      departmentNameTh: dto.department.departmentNameTh,
      departmentNameEn: dto.department.departmentNameEn,
      academicYear: dto.academicYear,
      semester: dto.semester,
      rawData: JSON.stringify(dto.rawData),
    });
  }

  /**
   * Get the values to persist to database
   */
  getValue(): SyllabusEntityDto {
    return {
      id: this.id,
      universityId: this.universityId,
      courseNo: this.courseNo,
      credits: this.credits,
      courseTitleTh: this.courseTitleTh,
      courseTitleEn: this.courseTitleEn,
      schoolId: this.schoolId,
      schoolNameTh: this.schoolNameTh,
      schoolNameEn: this.schoolNameEn,
      departmentId: this.departmentId,
      departmentNameTh: this.departmentNameTh,
      departmentNameEn: this.departmentNameEn,
      academicYear: this.academicYear,
      semester: this.semester,
      rawData: this.rawData,
    };
  }
}
