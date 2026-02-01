import { Command, Options } from "@effect/cli";
import { Effect, Logger, LogLevel, Option } from "effect";
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
      const maybeUser = yield* userStore
        .getUserByToken({ token: args.token })
        .pipe(
          Logger.withMinimumLogLevel(
            args.debug ? LogLevel.Info : LogLevel.None,
          ),
        );

      if (Option.isNone(maybeUser)) {
        yield* Console.log("User not found");
        return;
      }

      const user = maybeUser.value;
      yield* Console.log(`User ID: ${user.id}, Name: ${user.name}`);
    }),
);

export default me;
