import {
  HttpApiEndpoint,
  HttpApi,
  HttpApiGroup,
  HttpApiError,
} from "@effect/platform";
import { Schema } from "effect";

export class UnknownError extends Schema.TaggedError<UnknownError>()(
  "UnknownError",
  {
    code: Schema.Literal("UNKNOWN"),
  },
) {}

const User = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
});

export const api = HttpApi.make("Effectful").add(
  HttpApiGroup.make("Root")
    .add(HttpApiEndpoint.get("getMe")`/me`.addSuccess(User))
    .addError(UnknownError, { status: 500 }),
);
