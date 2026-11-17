// GET /api/logo/:id -> the logo of an approved submission (public).
import { serveLogo } from "../../_logo";
import { param, type Ctx } from "../../_types";

export const onRequestGet = (ctx: Ctx): Promise<Response> => serveLogo(ctx.env, param(ctx, "id"), { approvedOnly: true });
