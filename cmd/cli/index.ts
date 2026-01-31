import { Command } from "@effect/cli";
import { BunContext, BunRuntime } from "@effect/platform-bun";
import { Effect, Layer } from "effect";
import me from "./me";
import UserStore from "../../lib/userStore";

// Define the top-level command
const command = Command.make("effectful").pipe(Command.withSubcommands([me]));

// Set up the CLI application
const cli = Command.run(command, {
  name: "Effectful CLI",
  version: "v0.0.1",
});

const AppLive = BunContext.layer.pipe(Layer.merge(UserStore.Default));

// Prepare and run the CLI application
cli(process.argv).pipe(Effect.provide(AppLive), BunRuntime.runMain);
