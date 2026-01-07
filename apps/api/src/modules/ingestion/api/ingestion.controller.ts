import { Controller, Post, Body, Param } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from "@nestjs/swagger";
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

  @Post("universities/:code/sync")
  @ApiOperation({
    summary: "Sync all syllabus data for a university",
    description:
      "Triggers batch synchronization using outbox pattern. " +
      "Coordinator fetches pagination metadata, creates page jobs in outbox. " +
      "Worker processes pages concurrently with crash recovery.",
  })
  @ApiParam({
    name: "code",
    description: "University code (e.g., chula, kmitl)",
    example: "chula",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        year: { type: "string", example: "2024" },
        semester: { type: "string", example: "1" },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Sync coordination job queued successfully",
    schema: {
      type: "object",
      properties: {
        jobId: { type: "string", example: "123e4567-e89b-12d3" },
        message: { type: "string" },
      },
    },
  })
  async syncUniversity(
    @Param("code") code: string,
    @Body() body: { year?: string; semester?: string }
  ) {
    return this.ingestionService.syncUniversity({
      universityCode: code,
      year: body.year,
      semester: body.semester,
    });
  }
}
