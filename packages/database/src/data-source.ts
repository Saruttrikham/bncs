import { config } from "dotenv";
import { resolve } from "node:path";
import { DataSource } from "typeorm";
import { User } from "./entities/user.entity";
import { StudentProfile } from "./entities/student-profile.entity";
import { University } from "./entities/university.entity";
import { IngestionLog } from "./entities/ingestion-log.entity";
import { StandardizedTranscript } from "./entities/standardized-transcript.entity";

const projectRoot = resolve(__dirname, "../../..");
config({ path: resolve(projectRoot, ".env.local") });
config({ path: resolve(projectRoot, ".env") });

function parseDatabaseUrl(): {
  type: "oracle";
  connectString?: string;
  username?: string;
  password?: string;
  host?: string;
  port?: number;
  sid?: string;
  serviceName?: string;
} {
  return {
    type: "oracle",
    connectString: process.env.DATABASE_CONNECT_STRING,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 1521,
  };
}

const dbConfig = parseDatabaseUrl();

export const AppDataSource = new DataSource({
  ...dbConfig,
  synchronize: process.env.NODE_ENV === "development",
  logging:
    process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
  entities: [
    User,
    StudentProfile,
    University,
    IngestionLog,
    StandardizedTranscript,
  ],
  migrations: ["dist/migrations/*.js"],
  migrationsTableName: "migrations",
  subscribers: [],
});
