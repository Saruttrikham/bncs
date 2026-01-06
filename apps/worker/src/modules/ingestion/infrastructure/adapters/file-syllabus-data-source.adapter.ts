import { Injectable } from "@nestjs/common";
import { ISyllabusDataSource } from "../../domain/ports/syllabus-data-source.port";
import * as fs from "node:fs";
import * as path from "node:path";

@Injectable()
export class FileSyllabusDataSourceAdapter implements ISyllabusDataSource {
  async fetchRawData(): Promise<unknown> {
    const mockDataPath = path.join(
      process.cwd(),
      "syllabus_listbyyearsem.json"
    );

    if (!fs.existsSync(mockDataPath)) {
      throw new Error(`Mock syllabus file not found at: ${mockDataPath}`);
    }

    const rawData = JSON.parse(fs.readFileSync(mockDataPath, "utf-8"));
    return rawData;
  }
}
