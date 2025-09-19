import { getAuth } from "@/shared/config/auth/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function handlers() {
  const auth = getAuth(); // lazily create at request time
  return toNextJsHandler(auth); // returns { GET(req), POST(req), ... }
}

// Type-safe and simple: only pass `req`
export async function GET(req: Request) {
  return handlers().GET(req);
}

export async function POST(req: Request) {
  return handlers().POST(req);
}
