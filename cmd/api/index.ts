import { BunRuntime } from "@effect/platform-bun";
import { Layer } from "effect";
import { ServerLive } from "./server";

Layer.launch(ServerLive).pipe(BunRuntime.runMain);
