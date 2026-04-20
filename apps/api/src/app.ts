import health from "@/routes/health.route";
import createApp from "./lib/create-app";

const app = createApp();

const routes = [{ path: "/health", router: health }] as const;

for (const { path, router } of routes) {
  app.route(path, router);
}

export default app;
