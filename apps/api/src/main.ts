import { NestFactory } from "@nestjs/core";
import { ValidationPipe, VersioningType } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { env, envConfig } from "./config/env.config";
import { logger } from "@ncbs/logger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // API Versioning - URI versioning (e.g., /v1/auth/login)
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1", // Default to v1 if no version specified
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // CORS
  app.enableCors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  });

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle("NCBS API")
    .setDescription("National Credit Bank System API Documentation")
    .setVersion("1.0")
    .addTag("ingestion", "Data ingestion endpoints")
    .addTag("auth", "Authentication endpoints")
    .addServer(`http://localhost:${envConfig.server.port}`, "Development")
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup("api-docs", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = envConfig.server.port;
  await app.listen(port);

  logger.info(`🚀 API Server is running on: http://localhost:${port}`);
  logger.info("📚 API Versioning enabled: /v1/*");
  logger.info(`📖 Swagger documentation: http://localhost:${port}/api-docs`);
}

bootstrap().catch((error) => {
  logger.error("Failed to start API Server:", error);
  if (error instanceof Error) {
    logger.error("Error stack:", error.stack);
  }
  process.exit(1);
});
