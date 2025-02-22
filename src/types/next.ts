// types/next.d.ts
import "next";

declare module "next" {
  interface NextApiRouteContext {
    params: Record<string, string>;
  }
}
