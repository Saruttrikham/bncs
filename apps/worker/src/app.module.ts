import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BullModule } from "@nestjs/bullmq";
import { IngestionModule } from "./modules/ingestion/ingestion.module";
import { IngestionLog, Outbox } from "@ncbs/database";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
    }),
    TypeOrmModule.forRoot({
      type: "oracle",
      connectString: process.env.DATABASE_CONNECT_STRING,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 1521,
      synchronize: process.env.NODE_ENV === "development",
      logging:
        process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
      entities: [IngestionLog, Outbox],
    }),
    BullModule.forRootAsync({
      useFactory: () => ({
        connection: {
          host: process.env.REDIS_HOST || "localhost",
          port: parseInt(process.env.REDIS_PORT || "6379", 10),
        },
      }),
    }),
    IngestionModule,
  ],
})
export class AppModule {}
