import { Effect, Layer, Redacted } from "effect";
import { Authorization, CustomMiddleware, User } from "./spec";
import { HttpServerRequest, HttpApiError } from "@effect/platform";
import UserStore from "../../lib/userStore";

export const CustomMiddlewareLive = Layer.effect(
  CustomMiddleware,
  Effect.gen(function* () {
    // Implement any necessary logic for the custom middleware here
    return Effect.gen(function* () {
      const request = yield* HttpServerRequest.HttpServerRequest;
      const authorization = request.headers.authorization;
      yield* Effect.log(
        `CustomMiddleware invoked for ${request.method} ${request.url} with authz ${authorization}`,
      );
    });
  }),
);

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
