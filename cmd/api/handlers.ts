import { HttpApiBuilder } from "@effect/platform";
import { api } from "./spec";
import { Effect } from "effect";
import UserStore from "../../lib/userStore";

export const RootLive = HttpApiBuilder.group(api, "Root", (handlers) =>
  handlers.handle("getMe", () =>
    Effect.gen(function* () {
      const userStore = yield* UserStore;

      // return yield* Effect.fail(new UnknownError({ code: "UNKNOWN" }));

      return yield* userStore.getUserByToken({ token: "dummy-token" });
    }),
  ),
);
