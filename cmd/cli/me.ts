import { Command, Options } from "@effect/cli";
import { Effect, Logger, LogLevel } from "effect";
import { Console } from "effect";
import UserStore from "../../lib/userStore";

const me = Command.make(
  "me",
  {
    token: Options.text("token")
      .pipe(Options.withAlias("t"))
      .pipe(Options.withDescription("Authentication token")),
    debug: Options.boolean("debug")
      .pipe(Options.withAlias("d"))
      .pipe(Options.withDescription("Enable debug mode")),
  },
  (args) =>
    Effect.gen(function* () {
      const userStore = yield* UserStore;
      const user = yield* userStore
        .getUserByToken({ token: args.token })
        .pipe(
          Logger.withMinimumLogLevel(
            args.debug ? LogLevel.Info : LogLevel.None,
          ),
        );
      yield* Console.log(`User ID: ${user.id}, Name: ${user.name}`);
    }),
);

export default me;
