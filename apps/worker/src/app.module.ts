import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BullModule } from "@nestjs/bullmq";
import { IngestionModule } from "./modules/ingestion/ingestion.module";
import { IngestionLog, Outbox, Syllabus, University } from "@ncbs/database";
import { envConfig } from "./config/env.config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
    }),
    TypeOrmModule.forRoot({
      type: "oracle",
      connectString: envConfig.database.connectString,
      username: envConfig.database.username,
      password: envConfig.database.password,
      port: envConfig.database.port,
      synchronize: false,
      logging:
        envConfig.server.nodeEnv === "development"
          ? ["query", "error"]
          : ["error"],
      entities: [University, IngestionLog, Outbox, Syllabus],
      extra: {
        poolMax: 10,
        poolMin: 0,
        poolIncrement: 1,
        poolTimeout: 10,
        connectTimeout: 10,
      },
    }),
    BullModule.forRoot({
      connection: {
        host: envConfig.redis.host,
        port: envConfig.redis.port,
      },
    }),
    IngestionModule,
  ],
})
export class AppModule {}
