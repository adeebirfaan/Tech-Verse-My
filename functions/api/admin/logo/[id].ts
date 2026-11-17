// GET /api/admin/logo/:id -> any submission's logo, for review (the middleware has checked the session).
import { serveLogo } from "../../../_logo";
import { param, type Ctx } from "../../../_types";

export const onRequestGet = (ctx: Ctx): Promise<Response> => serveLogo(ctx.env, param(ctx, "id"), { approvedOnly: false });
