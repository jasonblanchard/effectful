import { Effect, Option } from "effect";

export default class UserStore extends Effect.Service<UserStore>()(
  "effectful/index/UserStore",
  {
    effect: Effect.gen(function* () {
      return {
        getUserByToken: ({ token }: { token: string }) =>
          Effect.gen(function* () {
            yield* Effect.log(`Looking up user for token: ${token}`);

            if (token === "abd123") {
              return Option.some({ id: "123", name: "John Doe" });
            }

            return Option.none();
          }),
      };
    }),
  },
) {}
