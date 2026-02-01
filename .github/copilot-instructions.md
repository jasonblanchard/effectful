# Effectful Project - AI Coding Instructions

## Architecture Overview

This is an **Effect-TS** project demonstrating both HTTP API and CLI applications built on the Effect ecosystem. The project uses Bun runtime exclusively (not Node.js).

**Structure:**

- `cmd/api/` - HTTP API server using `@effect/platform` HttpApi
- `cmd/cli/` - CLI application using `@effect/cli`
- `lib/` - Shared services (Effect.Service pattern)

**Key architectural patterns:**

- Effect Services for dependency injection (see `lib/userStore.ts`)
- Layer-based composition for building the runtime environment
- Schema-first API definitions using `@effect/platform` HttpApi
- All async operations use Effect, not Promise

## Runtime & Tooling

**Always use Bun, never Node.js:**

- Run: `bun run --watch cmd/api/index.ts` (for API server)
- Run: `bun cmd/cli/index.ts me --token abc` (for CLI)
- Install: `bun install` (not npm/yarn/pnpm)
- Test: `bun test` (not jest/vitest)
- **Typecheck: `bun run typecheck` - ALWAYS run this before completing work**

**TypeScript Configuration:**

- Uses `moduleResolution: "bundler"` and `module: "Preserve"`
- Strict mode enabled with Effect language service plugin
- Import .ts extensions allowed via `allowImportingTsExtensions: true`

## Effect-TS Patterns

**Service Definition** (see [lib/userStore.ts](lib/userStore.ts)):

```typescript
export default class UserStore extends Effect.Service<UserStore>()("effectful/index/UserStore", {
  effect: Effect.gen(function* () {
    return { getUserByToken: ({ token }) => Effect.gen(function* () { ... }) };
  })
}) {}
```

**HTTP API Structure** (see [cmd/api/spec.ts](cmd/api/spec.ts)):

1. Define schemas and errors using `Schema.Class` and `Schema.TaggedError`
2. Create middleware tags with `HttpApiMiddleware.Tag` (e.g., `Authorization`)
3. Define API with `HttpApi.make()` and `HttpApiGroup` with endpoints
4. Middleware provides Context tags (e.g., `CurrentUser` from `Authorization`)

**Layer Composition** (see [cmd/api/index.ts](cmd/api/index.ts)):

- Build layers with `Layer.provide()` chaining from bottom-up (dependencies first)
- Security handlers via `Layer.effect()` (see [cmd/api/handlers.ts](cmd/api/handlers.ts))
- Launch with `Layer.launch().pipe(BunRuntime.runMain)`

**Handlers** (see [cmd/api/handlers.ts](cmd/api/handlers.ts)):

- Use `HttpApiBuilder.group()` and `handlers.handle()`
- Access context services with `yield* ServiceName`
- Access middleware-provided values like `yield* CurrentUser`

**CLI Pattern** (see [cmd/cli/me.ts](cmd/cli/me.ts)):

- Define commands with `Command.make(name, options, handler)`
- Options use method chaining (`.pipe(Options.withAlias())`)
- Handler is an Effect that yields services

## Critical Workflows

**Running the API server:**

```bash
bun run --watch cmd/api/index.ts
```

This starts the server on port 3000 with Swagger docs at `/spec`.

**Running CLI commands:**

```bash
bun cmd/cli/index.ts me --token sometoken -d  # -d for debug logging
```

**Authentication flow:**

- API uses bearer token security (see `Authorization` middleware in [cmd/api/spec.ts](cmd/api/spec.ts))
- Bearer token handler in [cmd/api/handlers.ts](cmd/api/handlers.ts#L11-L30) validates and provides `CurrentUser`
- Use `Redacted` for sensitive values like tokens

## Project Conventions

- **Effect generators:** Always use `Effect.gen(function* () { ... })`, not async/await
- **Service access:** `yield* ServiceName` to access services in Effect context
- **Logging:** Use `Effect.log()` and control with `Logger.withMinimumLogLevel()`
- **Logger setup:** Remove default pretty logger when using custom logger (see [cmd/api/index.ts](cmd/api/index.ts#L27))
- **Error handling:** Define errors as `Schema.TaggedError`, add to endpoints with `.addError()`
- **Security:** Use `Redacted.value()` to access sensitive values like tokens
- **Completion criteria:** Your work is NOT complete until `bun run typecheck` passes with no errors

## Dependencies

- `effect` - Core Effect library
- `@effect/platform` - Platform APIs (HttpApi, etc.)
- `@effect/platform-bun` - Bun-specific runtime (BunHttpServer, BunRuntime)
- `@effect/cli` - CLI framework
- `@effect/language-service` - TypeScript language service plugin for Effect
