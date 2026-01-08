import { config } from "dotenv";
import { from } from "env-var";

config({ path: ".env.local" });
config({ path: ".env" });

const envVar = from(process.env);

export const envConfig = {
  server: {
    nodeEnv: envVar
      .get("NODE_ENV")
      .default("development")
      .asEnum(["development", "production", "test"]),
    port: envVar.get("PORT").default(3001).asPortNumber(),
  },

  // CORS
  cors: {
    origin: envVar
      .get("CORS_ORIGIN")
      .default("http://localhost:3000")
      .asUrlString(),
  },

  // Database (Oracle)
  database: {
    connectString: envVar.get("DATABASE_CONNECT_STRING").required().asString(),
    username: envVar.get("DATABASE_USERNAME").required().asString(),
    password: envVar.get("DATABASE_PASSWORD").required().asString(),
    port: envVar.get("DB_PORT").default(1521).asPortNumber(),
  },

  // Redis/BullMQ
  redis: {
    host: envVar.get("REDIS_HOST").default("localhost").asString(),
    port: envVar.get("REDIS_PORT").default(6379).asPortNumber(),
  },

  // JWT (if needed for auth)
  jwt: {
    secret: envVar.get("JWT_SECRET").asString(),
    expiresIn: envVar.get("JWT_EXPIRES_IN").default("7d").asString(),
  },

  // API Keys (if needed)
  api: {
    key: envVar.get("API_KEY").asString(),
  },
};

// Export a flat structure for convenience (matching the old API)
export const env = {
  NODE_ENV: envConfig.server.nodeEnv,
  PORT: envConfig.server.port,
  CORS_ORIGIN: envConfig.cors.origin,
  DATABASE_CONNECT_STRING: envConfig.database.connectString,
  DATABASE_USERNAME: envConfig.database.username,
  DATABASE_PASSWORD: envConfig.database.password,
  DB_PORT: envConfig.database.port,
  REDIS_HOST: envConfig.redis.host,
  REDIS_PORT: envConfig.redis.port,
  JWT_SECRET: envConfig.jwt.secret,
  JWT_EXPIRES_IN: envConfig.jwt.expiresIn,
  API_KEY: envConfig.api.key,
};

export type Env = typeof env;
