import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { AppService } from "./app.service";
import { API_VERSION } from "./common/constants/api-version";

@ApiTags("health")
@Controller({
  version: API_VERSION.V1,
})
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: "Get API welcome message" })
  @ApiResponse({ status: 200, description: "Welcome message" })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("health")
  @ApiOperation({ summary: "Health check endpoint" })
  @ApiResponse({
    status: 200,
    description: "Service health status",
    schema: {
      type: "object",
      properties: {
        status: { type: "string", example: "ok" },
        service: { type: "string", example: "api" },
      },
    },
  })
  getHealth() {
    return { status: "ok", service: "api" };
  }
}
