import {
  HttpApiEndpoint,
  HttpApi,
  HttpApiGroup,
  HttpApiError,
  HttpApiMiddleware,
  HttpApiSecurity,
} from "@effect/platform";
import { Schema, Context, Effect } from "effect";

export class UnknownError extends Schema.TaggedError<UnknownError>()(
  "UnknownError",
  {},
) {}

export class UnauthorizedError extends Schema.TaggedError<UnauthorizedError>()(
  "UnauthorizedError",
  {},
) {}

export class User extends Schema.Class<User>("User")({
  id: Schema.String,
  name: Schema.String,
}) {}

export class CurrentUser extends Context.Tag("CurrentUser")<
  CurrentUser,
  User
>() {}

// Create the Authorization middleware
export class Authorization extends HttpApiMiddleware.Tag<Authorization>()(
  "Authorization",
  {
    // Define the error schema for unauthorized access
    failure: UnauthorizedError,
    // Specify the resource this middleware will provide
    provides: CurrentUser,
    security: {
      bearer: HttpApiSecurity.bearer,
    },
  },
) {}

export class CustomMiddleware extends HttpApiMiddleware.Tag<CustomMiddleware>()(
  "CustomMiddleware",
  {},
) {}

export const api = HttpApi.make("Effectful").add(
  HttpApiGroup.make("Root")
    .add(HttpApiEndpoint.get("getMe")`/me`.addSuccess(User))

    .addError(UnknownError, { status: 500 })
    .addError(UnauthorizedError, { status: 401 })
    .middleware(Authorization)
    .middleware(CustomMiddleware),
);
