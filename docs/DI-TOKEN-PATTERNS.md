# Dependency Injection Token Patterns

## ✅ Recommended: Symbol Pattern

Both API and Worker services now use the **Symbol pattern** for DI tokens.

### Pattern

```typescript
export const IngestionProviders = {
  INGESTION_REPOSITORY: Symbol("INGESTION_REPOSITORY"),
  OUTBOX_REPOSITORY: Symbol("OUTBOX_REPOSITORY"),
} as const;
```

### Usage

```typescript
// In module
@Module({
  providers: [
    {
      provide: IngestionProviders.INGESTION_REPOSITORY,
      useClass: IngestionRepository,
    },
  ],
})
// In service/use-case
@Injectable()
export class MyService {
  constructor(
    @Inject(IngestionProviders.INGESTION_REPOSITORY)
    private readonly repo: IIngestionRepository
  ) {}
}
```

## Why Symbol Over String Enum?

### 1. Guaranteed Uniqueness 🔒

#### Symbol (✅ Unique)

```typescript
const token1 = Symbol("REPO");
const token2 = Symbol("REPO");
console.log(token1 === token2); // false - Each is unique!
```

#### String (❌ Can Collide)

```typescript
const token1 = "REPO";
const token2 = "REPO";
console.log(token1 === token2); // true - Collision risk!
```

### 2. No Cross-Module Collisions

#### Problem with Strings

```typescript
// auth.module.ts
export enum AuthProviders {
  REPOSITORY = "REPOSITORY", // ❌ String "REPOSITORY"
}

// ingestion.module.ts
export enum IngestionProviders {
  REPOSITORY = "REPOSITORY", // ❌ Same string "REPOSITORY"!
}

// Result: NestJS DI collision if both modules loaded! 💥
```

#### Solution with Symbols

```typescript
// auth.module.ts
export const AuthProviders = {
  REPOSITORY: Symbol("REPOSITORY"), // ✅ Unique symbol #1
};

// ingestion.module.ts
export const IngestionProviders = {
  REPOSITORY: Symbol("REPOSITORY"), // ✅ Unique symbol #2
};

// Result: No collision - each Symbol is unique! ✅
```

### 3. NestJS Best Practice

From [NestJS Documentation](https://docs.nestjs.com/fundamentals/custom-providers):

> "We recommend using **Symbol** for the injection token to avoid collisions"

```typescript
// NestJS recommended
{
  provide: Symbol('MY_TOKEN'),  // ✅
  useClass: MyClass,
}

// Not recommended
{
  provide: 'MY_TOKEN',  // ❌ String can collide
  useClass: MyClass,
}
```

### 4. Type Safety

#### Symbol - Strong Type Safety

```typescript
const Providers = {
  REPO: Symbol("REPO"),
} as const;

// Must use exact reference
@Inject(Providers.REPO)  // ✅ Type-safe

// Can't accidentally use wrong symbol
@Inject(Symbol("REPO"))  // ❌ Different symbol, won't work
```

#### String - Weak Type Safety

```typescript
enum Providers {
  REPO = "REPO",
}

@Inject(Providers.REPO)  // ✅ Works
@Inject("REPO")          // ❌ Also works, typo-prone!
@Inject("REPOO")         // ❌ Typo, runtime error!
```

### 5. Can't Be Accidentally Used

```typescript
// With Symbol - Must import and use exact reference
import { IngestionProviders } from "./providers";
@Inject(IngestionProviders.INGESTION_REPOSITORY)  // ✅ Only way

// With String - Can bypass and use raw string
enum IngestionProviders {
  INGESTION_REPOSITORY = "INGESTION_REPOSITORY",
}
@Inject("INGESTION_REPOSITORY")  // ❌ Bypasses enum, error-prone
```

## Comparison Table

| Aspect                   | Symbol (✅ Recommended)     | String Enum (❌ Not Recommended) |
| ------------------------ | --------------------------- | -------------------------------- |
| **Uniqueness**           | Guaranteed unique           | Can collide                      |
| **Type Safety**          | Strong (must use reference) | Weak (can use raw string)        |
| **Cross-Module**         | No collision possible       | Can collide                      |
| **NestJS Best Practice** | ✅ Recommended              | ❌ Not recommended               |
| **Typo Protection**      | ✅ Must import              | ❌ Can bypass with string        |
| **Refactoring Safety**   | ✅ IDE finds all usages     | ❌ String search needed          |
| **Runtime Safety**       | ✅ Can't be duplicated      | ❌ Can be duplicated             |

## Migration Guide (String → Symbol)

### Before (String Enum)

```typescript
export enum IngestionProviders {
  INGESTION_REPOSITORY = "INGESTION_REPOSITORY",
  OUTBOX_REPOSITORY = "OUTBOX_REPOSITORY",
}
```

### After (Symbol)

```typescript
export const IngestionProviders = {
  INGESTION_REPOSITORY: Symbol("INGESTION_REPOSITORY"),
  OUTBOX_REPOSITORY: Symbol("OUTBOX_REPOSITORY"),
} as const;
```

### Usage (No Change!)

```typescript
// Usage remains exactly the same
@Inject(IngestionProviders.INGESTION_REPOSITORY)
private readonly repo: IIngestionRepository
```

## Real-World Scenario

### Scenario: Multiple Modules with "REPOSITORY" Token

```typescript
// ❌ BAD: String collision
// Module A
enum ProvidersA {
  REPOSITORY = "REPOSITORY",
}

// Module B
enum ProvidersB {
  REPOSITORY = "REPOSITORY",
}

// Module C
enum ProvidersC {
  REPOSITORY = "REPOSITORY",
}

// Result: All three collide! NestJS can't distinguish! 💥
```

```typescript
// ✅ GOOD: No collision with Symbol
// Module A
const ProvidersA = { REPOSITORY: Symbol("REPOSITORY") };

// Module B
const ProvidersB = { REPOSITORY: Symbol("REPOSITORY") };

// Module C
const ProvidersC = { REPOSITORY: Symbol("REPOSITORY") };

// Result: Each is unique! No collision! ✅
```

## Summary

✅ **Always use Symbol() for DI tokens**

- Guaranteed uniqueness
- No collision risk
- NestJS best practice
- Better type safety
- Refactoring-safe

❌ **Avoid string enums for DI tokens**

- Collision risk
- Weak type safety
- Can be bypassed
- Not recommended by NestJS

## Current Status

| Service    | Pattern | Status               |
| ---------- | ------- | -------------------- |
| **API**    | Symbol  | ✅ Correct           |
| **Worker** | Symbol  | ✅ Correct (Updated) |

Both services now follow NestJS best practices! 🎉
