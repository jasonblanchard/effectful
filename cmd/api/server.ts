import {
  HttpApiBuilder,
  HttpApiSwagger,
  HttpMiddleware,
} from "@effect/platform";
import { BunHttpServer } from "@effect/platform-bun";
// import { NodeSdk } from "@effect/opentelemetry";
// import {
//   ConsoleSpanExporter,
//   BatchSpanProcessor,
// } from "@opentelemetry/sdk-trace-base";
import { api } from "./spec";
import { Layer, Effect, Logger } from "effect";
import { RootLive } from "./handlers";
import UserStore from "../../lib/userStore";
import { CustomMiddlewareLive, AuthorizationLive } from "./middleware";

const ApiLive = HttpApiBuilder.api(api).pipe(
  Layer.provide(RootLive),
  Layer.provide(AuthorizationLive),
  Layer.provide(CustomMiddlewareLive),
  Layer.provide(UserStore.Default),
  Layer.provide(Logger.pretty),
);

// Configure tracing layer
// const TracingLive = NodeSdk.layer(() => ({
//   resource: { serviceName: "effectful-api" },
//   spanProcessor: new BatchSpanProcessor(new ConsoleSpanExporter()),
// }));

// Build the HttpApp Layer (without the BunHttpServer)
const HttpLive = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
  Layer.provide(HttpApiSwagger.layer({ path: "/spec" })),
  Layer.provide(ApiLive),
  Layer.provide(Logger.remove(Logger.prettyLoggerDefault)),
);

// For standalone server with BunHttpServer
export const ServerLive = HttpLive.pipe(
  Layer.provide(BunHttpServer.layer({ port: 3000 })),
  Layer.tap(() =>
    Effect.logInfo("API server is running on http://localhost:3000"),
  ),
);

// For Web Handler - merge ApiLive with the server context at the top level
const WebHandlerLive = Layer.mergeAll(ApiLive, BunHttpServer.layerContext);

export const webhandler = HttpApiBuilder.toWebHandler(WebHandlerLive, {
  middleware: (httpApp) => HttpMiddleware.logger(httpApp),
});
