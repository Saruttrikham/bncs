import { UsePipes, ValidationPipe } from "@nestjs/common";
import { ZodSchema } from "zod";
import { ZodValidationPipe } from "../pipes/zod-validation.pipe";

export function ZodBody(schema: ZodSchema) {
  return UsePipes(
    new ValidationPipe({
      whitelist: false,
      forbidNonWhitelisted: false,
      transform: false,
    }),
    new ZodValidationPipe(schema)
  );
}
