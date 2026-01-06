import { Controller, Post, Body } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from "@nestjs/swagger";
import {
  CreateIngestionLogDto,
  IngestionLogDto,
  FetchSyllabusDto,
} from "@ncbs/dtos";
import { IngestionService } from "../application/ingestion.service";
import { API_VERSION } from "../../../common/constants/api-version";
import { createZodDto } from "nestjs-zod";
import { ZodBody } from "../../../common/decorators/zod-body.decorator";

// Create Swagger-compatible DTO classes from Zod schemas
class CreateIngestionLogDtoClass extends createZodDto(CreateIngestionLogDto) {}
class IngestionLogDtoClass extends createZodDto(IngestionLogDto) {}
class FetchSyllabusDtoClass extends createZodDto(FetchSyllabusDto) {}

@ApiTags("ingestion")
@Controller({
  path: "ingestion",
  version: API_VERSION.V1,
})
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post()
  @ApiOperation({ summary: "Create ingestion log for transcript data" })
  @ApiResponse({
    status: 201,
    description: "Ingestion log created successfully",
    type: IngestionLogDtoClass,
  })
  async createIngestionLog(
    @Body() dto: CreateIngestionLogDtoClass
  ): Promise<IngestionLogDto> {
    return this.ingestionService.createIngestionLog(dto);
  }

  @Post("syllabus/fetch")
  @ZodBody(FetchSyllabusDto)
  @ApiOperation({ summary: "Fetch syllabus data from university" })
  @ApiBody({ type: FetchSyllabusDtoClass })
  @ApiResponse({
    status: 201,
    description: "Syllabus fetch job queued successfully",
    schema: {
      type: "object",
      properties: {
        jobId: { type: "string", example: "12345" },
      },
    },
  })
  async fetchSyllabus(
    @Body() dto: FetchSyllabusDto
  ): Promise<{ jobId: string }> {
    return this.ingestionService.fetchSyllabus(dto);
  }
}
