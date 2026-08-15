export interface RouteContext {
  server: Bun.Server<undefined>;
}

export interface Route {
  method: string; // '*' matches any method
  pattern: RegExp;
  handler: (req: Request, match: RegExpMatchArray, ctx: RouteContext) => Response | Promise<Response>;
}
