import {
  HttpApiBuilder,
  HttpApiSwagger,
  HttpMiddleware,
} from "@effect/platform";
import { BunHttpServer, BunRuntime } from "@effect/platform-bun";
import { NodeSdk } from "@effect/opentelemetry";
import {
  ConsoleSpanExporter,
  BatchSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import { api } from "./spec";
import { Layer, Effect, Logger } from "effect";
import { RootLive } from "./handlers";
import UserStore from "../../lib/userStore";
import { CustomMiddlewareLive, AuthorizationLive } from "./middleware";

const ApiLive = HttpApiBuilder.api(api).pipe(Layer.provide(RootLive));

// Configure tracing layer
const TracingLive = NodeSdk.layer(() => ({
  resource: { serviceName: "effectful-api" },
  spanProcessor: new BatchSpanProcessor(new ConsoleSpanExporter()),
}));

const ServerLive = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
  Layer.provide(HttpApiSwagger.layer({ path: "/spec" })),
  Layer.provide(ApiLive),
  Layer.provide(BunHttpServer.layer({ port: 3000 })),
  Layer.provide(AuthorizationLive),
  Layer.provide(CustomMiddlewareLive),
  Layer.provide(UserStore.Default),
  Layer.tap(() =>
    Effect.logInfo("API server is running on http://localhost:3000"),
  ),
  //   Layer.provide(TracingLive),
  Layer.provide(Logger.pretty),
  // Ensure no duplicate pretty logs alongside structured output
  Layer.provide(Logger.remove(Logger.prettyLoggerDefault)),
);

Layer.launch(ServerLive).pipe(BunRuntime.runMain);
