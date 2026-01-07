import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";
import { logger } from "@ncbs/logger";

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ["error", "warn", "log", "verbose", "debug"],
  });
  const _configService = app.get(ConfigService);

  logger.info("🚀 Worker is running and processing jobs...");
}

bootstrap();
