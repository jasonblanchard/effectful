import {
  HttpApiBuilder,
  HttpServerRequest,
  HttpApiSecurity,
  HttpApiError,
} from "@effect/platform";
import { api, Authorization, CurrentUser, User } from "./spec";
import { Effect, Redacted, Layer } from "effect";
import UserStore from "../../lib/userStore";

export const AuthorizationLive = Layer.effect(
  Authorization,
  Effect.gen(function* () {
    const userStore = yield* UserStore;

    // Return the security handlers for the middleware
    return {
      // Define the handler for the Bearer token
      // The Bearer token is redacted for security
      bearer: (bearerToken) =>
        Effect.gen(function* () {
          yield* Effect.log(
            "checking bearer token",
            Redacted.value(bearerToken),
          );

          if (!Redacted.value(bearerToken)) {
            return yield* Effect.fail(new HttpApiError.Unauthorized());
          }

          const user = yield* userStore.getUserByToken({
            token: Redacted.value(bearerToken),
          });

          // Return a mock User object as the CurrentUser
          return new User({ id: user.id, name: user.name });
        }),
    };
  }),
);

export const RootLive = HttpApiBuilder.group(api, "Root", (handlers) =>
  handlers.handle("getMe", () =>
    Effect.gen(function* () {
      // return yield* Effect.fail(new UnknownError({ code: "UNKNOWN" }));

      const currentUser = yield* CurrentUser;
      yield* Effect.log(`Current user from middleware: ${currentUser.name}`);

      return new User({ id: currentUser.id, name: currentUser.name });
    }),
  ),
);
