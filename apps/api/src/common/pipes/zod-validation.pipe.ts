import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from "@nestjs/common";
import { ZodError, ZodObject, ZodSchema } from "zod";

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, _metadata: ArgumentMetadata) {
    try {
      // Use strict() to reject unknown properties if it's a ZodObject
      const strictSchema =
        this.schema instanceof ZodObject ? this.schema.strict() : this.schema;
      const parsedValue = strictSchema.parse(value);
      return parsedValue;
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((err) => {
          const path = err.path.join(".");
          if (err.code === "unrecognized_keys") {
            return `property ${path} should not exist`;
          }
          return err.message
            ? `${path}: ${err.message}`
            : `property ${path} should not exist`;
        });
        throw new BadRequestException({
          message: messages,
          error: "Bad Request",
          statusCode: 400,
        });
      }
      throw new BadRequestException("Validation failed");
    }
  }
}
