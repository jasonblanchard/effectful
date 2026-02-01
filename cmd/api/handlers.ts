import { HttpApiBuilder } from "@effect/platform";
import { api, CurrentUser, User } from "./spec";
import { Effect } from "effect";

export const RootLive = HttpApiBuilder.group(api, "Root", (handlers) =>
  handlers.handle("getMe", () =>
    Effect.gen(function* () {
      // return yield* Effect.fail(new UnknownError());

      const currentUser = yield* CurrentUser;
      yield* Effect.log(`Current user from middleware: ${currentUser.name}`);

      return new User({ id: currentUser.id, name: currentUser.name });
    }),
  ),
);
