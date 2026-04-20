import { structuredLogger } from "@hono/structured-logger";
import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { requestId } from "hono/request-id";
import pino from "pino";
import env from "@/env";

export type AppEnv = {
  Variables: {
    logger: pino.Logger;
  };
};

export function createRouter() {
  return new Hono<AppEnv>({ strict: false });
}

export default function createApp() {
  const transport =
    env.NODE_ENV === "development"
      ? {
          transport: {
            target: "pino-pretty",
            options: { colorize: true, singleLine: true },
          },
        }
      : {};

  const rootLogger = pino({
    level: env.NODE_ENV === "production" ? "info" : "debug",
    ...transport,
  });

  const app = createRouter();

  app.use("/favicon.ico", serveStatic({ path: "./favicon.ico" }));
  app.use("*", requestId());

  app.use(
    structuredLogger({
      createLogger: (c) =>
        rootLogger.child({
          requestId: c.var.requestId,
        }),
    }),
  );

  app.notFound((c) => {
    return c.json({ message: `Not Found: ${c.req.path}` }, 404);
  });

  app.onError((err, c) => {
    c.var.logger.error({ err }, "request failed");
    return c.json(
      {
        message: err.message,
        ...(env.NODE_ENV !== "production" && { stack: err.stack }),
      },
      500,
    );
  });

  return app;
}
