import { HttpApiBuilder } from "@effect/platform";
import { api, CurrentUser, User } from "./spec";
import { Effect } from "effect";
import UserStore from "../../lib/userStore";

export const RootLive = HttpApiBuilder.group(api, "Root", (handlers) =>
  handlers
    .handle("getMe", () =>
      Effect.gen(function* () {
        // return yield* Effect.fail(new UnknownError());

        const currentUser = yield* CurrentUser;
        yield* Effect.log(`Current user from middleware: ${currentUser.name}`);

        return new User({ id: currentUser.id, name: currentUser.name });
      }),
    )
    .handle("updateProfile", ({ payload }) =>
      Effect.gen(function* () {
        const currentUser = yield* CurrentUser;
        const userStore = yield* UserStore;

        yield* Effect.log(
          `Updating profile for user ${currentUser.id} with name: ${payload.name}`,
        );

        const updatedUser = yield* userStore.updateProfile({
          id: currentUser.id,
          name: payload.name,
        });

        return new User({ id: updatedUser.id, name: updatedUser.name });
      }),
    ),
);
