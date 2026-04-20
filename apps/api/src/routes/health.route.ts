import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { createRouter } from "@/lib/create-app";

const router = createRouter().get("/", (c) => {
  c.var.logger.info("health check");
  return c.json({ status: ReasonPhrases.OK }, StatusCodes.OK);
});

export default router;
