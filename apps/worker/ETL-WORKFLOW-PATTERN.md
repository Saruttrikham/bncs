# ETL Workflow Pattern (Temporal-Ready)

## Overview

The syllabus ingestion system now uses an **ETL (Extract, Transform, Load) pattern** with **Temporal activity abstraction**, making it easy to migrate to Temporal in the future while providing better separation of concerns today.

## Architecture

### Workflow vs Activities

```
┌─────────────────────────────────────────────────────────────┐
│ Workflow: FetchSyllabusUseCase                              │
│ (Orchestrator - Coordinates activities)                     │
│                                                             │
│  execute(dto) {                                             │
│    1. Create ingestion log                                  │
│    2. await extractActivity.execute()    ← Activity 1       │
│    3. await transformActivity.execute()  ← Activity 2       │
│    4. await loadActivity.execute()       ← Activity 3       │
│    5. Update ingestion log                                  │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ↓                   ↓                   ↓
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Extract     │  │  Transform   │  │    Load      │
│  Activity    │  │  Activity    │  │  Activity    │
│              │  │              │  │              │
│ Fetch from   │  │ Normalize    │  │ Save to      │
│ University   │  │ data to      │  │ database     │
│ API          │  │ common       │  │              │
│              │  │ schema       │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
```

## Key Concepts

### 1. Workflow (Orchestrator)

**File**: `application/use-cases/fetch-syllabus.use-case.ts`

**Responsibilities**:

- Coordinate activities in sequence
- Handle workflow-level concerns (logging, ingestion records)
- Pass data between activities
- Catch and propagate errors

**Does NOT**:

- Perform actual work (delegates to activities)
- Contain business logic (activities do that)
- Retry (activities handle their own retries)

### 2. Activities (Workers)

**Files**: `application/activities/*.activity.ts`

**Responsibilities**:

- Perform specific, focused work
- Be idempotent (can be retried safely)
- Be stateless (no shared state)
- Handle their own retries for transient errors

**Characteristics**:

- ✅ Independently testable
- ✅ Independently retryable
- ✅ Composable (can be used in different workflows)
- ✅ Focused single responsibility

## The Three Activities

### Activity 1: Extract

**File**: `extract-syllabus.activity.ts`

**Purpose**: Fetch raw data from university API

**Input**:

```typescript
{
  universityCode: "chula",
  page: 1,
  pageSize: 100,
  year?: "2024",
  semester?: "1"
}
```

**Output**:

```typescript
{
  universityCode: "chula",
  page: 1,
  items: [...],  // Raw API response
  metadata: {
    totalItems: 1000,
    totalPages: 10,
    currentPage: 1
  }
}
```

**Retry Logic**: Layer 1 (immediate retries for network errors)

- 3 attempts
- Linear backoff: 1s, 2s, 3s
- Only for transient network errors

### Activity 2: Transform

**File**: `transform-syllabus.activity.ts`

**Purpose**: Normalize raw data to common schema

**Input**:

```typescript
{
  universityCode: "chula",
  items: [...],  // Raw items from Extract
  year?: "2024",
  semester?: "1"
}
```

**Output**:

```typescript
{
  universityCode: "chula",
  syllabi: [
    {
      courseCode: "2110316",
      courseName: "PROG LANG PRIN",
      credits: 3,
      // ... normalized fields
    }
  ]
}
```

**Retry Logic**: No immediate retries (deterministic transformation)

- If transformation fails, it's likely a data issue
- Let workflow retry (Layer 2) handle it

### Activity 3: Load

**File**: `load-syllabus.activity.ts`

**Purpose**: Save normalized data to database

**Input**:

```typescript
{
  universityCode: "chula",
  syllabi: [...]  // Normalized from Transform
}
```

**Output**:

```typescript
{
  universityCode: "chula",
  savedCount: 95,
  errorCount: 5,
  errors: ["..."]  // Optional, if any failed
}
```

**Features**:

- Idempotent (upsert operations)
- Partial success handling (some records can fail)
- Throws only if ALL records fail

**Retry Logic**: Database retries handled by TypeORM

- If database is down, workflow retry (Layer 2) handles it

## Benefits

### 1. Temporal Migration Path

**Current (NestJS)**:

```typescript
// Workflow
class FetchSyllabusUseCase {
  async execute(dto) {
    const extracted = await this.extractActivity.execute(input);
    const transformed = await this.transformActivity.execute(input);
    const loaded = await this.loadActivity.execute(input);
  }
}

// Activity
class ExtractSyllabusActivity {
  async execute(input) {
    // Work here
  }
}
```

**Future (Temporal)**:

```typescript
// Workflow
@Workflow()
class FetchSyllabusWorkflow {
  @WorkflowMethod()
  async execute(dto) {
    const extracted = await proxyActivities<Activities>({
      startToCloseTimeout: "1 minute",
    }).extractSyllabus(input);

    const transformed = await proxyActivities<Activities>({
      startToCloseTimeout: "30 seconds",
    }).transformSyllabus(input);

    const loaded = await proxyActivities<Activities>({
      startToCloseTimeout: "1 minute",
    }).loadSyllabus(input);
  }
}

// Activity (same!)
const extractSyllabus = async (input) => {
  // Same logic as ExtractSyllabusActivity
};
```

**Migration Steps**:

1. ✅ Already have activity pattern (done!)
2. Extract activity logic to standalone functions
3. Register functions with Temporal worker
4. Replace NestJS workflow with Temporal workflow
5. Done!

### 2. Better Testability

**Before (Monolithic)**:

```typescript
// Must mock everything
test("fetch syllabus", async () => {
  const mockAdapter = { fetchPage: jest.fn() };
  const mockRepo = { save: jest.fn() };

  await useCase.execute(dto);

  // Hard to test transformation logic separately
});
```

**After (ETL Activities)**:

```typescript
// Test each activity independently
test('extract activity', async () => {
  const result = await extractActivity.execute(input);
  expect(result.items).toHaveLength(100);
});

test('transform activity', async () => {
  const result = await transformActivity.execute(input);
  expect(result.syllabi[0].courseCode).toBe('2110316');
});

test('load activity', async () => {
  const result = await loadActivity.execute(input);
  expect(result.savedCount).toBe(100);
});

test('workflow orchestration', async () => {
  // Mock activities
  const mockExtract = { execute: jest.fn().mockResolvedValue({...}) };
  const mockTransform = { execute: jest.fn().mockResolvedValue({...}) };
  const mockLoad = { execute: jest.fn().mockResolvedValue({...}) };

  await workflow.execute(dto);

  // Verify activity calls and order
  expect(mockExtract.execute).toHaveBeenCalledBefore(mockTransform.execute);
});
```

### 3. Independent Retry Strategies

Each activity can have its own retry strategy:

```typescript
// Extract: Fast retries for network
extractActivity.execute()
  └─ Layer 1: 3 attempts, 1s/2s/3s backoff
  └─ If fails → Workflow retry (Layer 2)

// Transform: No immediate retry (deterministic)
transformActivity.execute()
  └─ If fails → Workflow retry (Layer 2)

// Load: Database-level retries
loadActivity.execute()
  └─ TypeORM retries connection errors
  └─ If fails → Workflow retry (Layer 2)
```

### 4. Composability

Activities can be reused in different workflows:

```typescript
// Workflow 1: Full ETL
class FetchSyllabusWorkflow {
  async execute() {
    await extract();
    await transform();
    await load();
  }
}

// Workflow 2: Re-process existing data
class ReprocessSyllabusWorkflow {
  async execute() {
    const data = await fetchFromDatabase();
    await transform(data); // ← Reuse same activity!
    await load();
  }
}

// Workflow 3: Extract only (for testing/validation)
class ValidateSyllabusWorkflow {
  async execute() {
    await extract();
    // Don't transform or load, just validate
  }
}
```

### 5. Better Observability

Each activity logs independently:

```
[Workflow] Starting ETL for page 1 of chula
[Extract] Fetching page 1 from chula
[Extract] ✅ Fetched 100 items from page 1
[Transform] Normalizing 100 items from chula
[Transform] ✅ Normalized 100 syllabus records
[Load] Saving 100 syllabus records for chula
[Load] ✅ Successfully saved 100 syllabus records
[Workflow] ✅ ETL complete for page 1
```

Clear breakdown of where time is spent and where failures occur.

## Data Flow

```
Input (PaginatedFetchSyllabusDto)
  │
  ├─ universityCode: "chula"
  ├─ page: 1
  ├─ pageSize: 100
  ├─ year: "2024"
  └─ semester: "1"

  ↓

┌─────────────────────────────────────┐
│ Activity 1: Extract                 │
│                                     │
│ Input: { universityCode, page, ... }│
│                                     │
│ Work:                               │
│ - Call adapter.fetchPage()          │
│ - Retry on network errors (3x)     │
│                                     │
│ Output: { items, metadata }         │
└─────────────────────────────────────┘

  ↓ items (raw API response)

┌─────────────────────────────────────┐
│ Activity 2: Transform               │
│                                     │
│ Input: { items, year, semester }    │
│                                     │
│ Work:                               │
│ - Call adapter.normalizeSyllabus()  │
│ - Convert to common schema          │
│                                     │
│ Output: { syllabi }                 │
└─────────────────────────────────────┘

  ↓ syllabi (normalized records)

┌─────────────────────────────────────┐
│ Activity 3: Load                    │
│                                     │
│ Input: { syllabi }                  │
│                                     │
│ Work:                               │
│ - Call repository.save() for each   │
│ - Track successes/failures          │
│                                     │
│ Output: { savedCount, errorCount }  │
└─────────────────────────────────────┘

  ↓ result

Output: ETL complete
```

## Error Handling

### Scenario 1: Extract Fails (Network Error)

```
[Workflow] Starting ETL
[Extract] Attempt 1: ETIMEDOUT
[Extract] Wait 1s, retry
[Extract] Attempt 2: ETIMEDOUT
[Extract] Wait 2s, retry
[Extract] Attempt 3: ETIMEDOUT
[Extract] Layer 1 exhausted, throw error

[Workflow] Caught error from Extract
[Workflow] Throw to OutboxProcessor

[OutboxProcessor] Caught error
[OutboxProcessor] markAsFailed() → Layer 2
[OutboxRepository] Calculate backoff: ~2s
[OutboxRepository] Status: PENDING, scheduledAt: now + 2s

... 2 seconds later ...

[OutboxProcessor] Retry workflow
[Workflow] Starting ETL (attempt 2)
[Extract] Attempt 1: Success! ✅
[Transform] Success! ✅
[Load] Success! ✅
[Workflow] ✅ Complete
```

### Scenario 2: Transform Fails (Data Issue)

```
[Workflow] Starting ETL
[Extract] ✅ Success
[Transform] Error: Invalid course code format

[Workflow] Caught error from Transform
[Workflow] Throw to OutboxProcessor

[OutboxProcessor] markAsFailed()
[OutboxRepository] Error contains "invalid"
[OutboxRepository] Classify as permanent error
[OutboxRepository] Status: FAILED (no retry)
```

### Scenario 3: Load Partial Failure

```
[Workflow] Starting ETL
[Extract] ✅ 100 items
[Transform] ✅ 100 records
[Load] Saving 100 records...
[Load] ⚠️  5 records failed (duplicate keys)
[Load] ✅ 95 records saved
[Load] Return: { savedCount: 95, errorCount: 5 }

[Workflow] ✅ Complete (partial success)
```

## Configuration

### Activity Timeouts (Future Temporal)

```typescript
// When migrating to Temporal:

const extractActivity = proxyActivities({
  startToCloseTimeout: "2 minutes", // Max time including retries
  scheduleToStartTimeout: "1 minute", // Max time in queue
  scheduleToCloseTimeout: "3 minutes", // Total max time
  retryPolicy: {
    maximumAttempts: 3,
    initialInterval: 1000,
    backoffCoefficient: 2,
  },
});

const transformActivity = proxyActivities({
  startToCloseTimeout: "30 seconds", // Faster (just CPU work)
  scheduleToStartTimeout: "30 seconds",
  scheduleToCloseTimeout: "1 minute",
  retryPolicy: {
    maximumAttempts: 1, // Deterministic, don't retry
  },
});

const loadActivity = proxyActivities({
  startToCloseTimeout: "2 minutes", // Allow time for DB writes
  scheduleToStartTimeout: "1 minute",
  scheduleToCloseTimeout: "3 minutes",
  retryPolicy: {
    maximumAttempts: 5,
    initialInterval: 2000,
    backoffCoefficient: 2,
  },
});
```

## Testing

### Unit Tests (Activity Level)

```typescript
describe("ExtractSyllabusActivity", () => {
  it("should fetch and return raw items", async () => {
    const mockAdapter = {
      fetchPage: jest.fn().mockResolvedValue({
        items: [{ id: 1 }, { id: 2 }],
        metadata: { totalItems: 2, totalPages: 1, currentPage: 1 },
      }),
    };

    const activity = new ExtractSyllabusActivity(mockAdapterSelector);

    const result = await activity.execute({
      universityCode: "chula",
      page: 1,
      pageSize: 100,
    });

    expect(result.items).toHaveLength(2);
    expect(mockAdapter.fetchPage).toHaveBeenCalledWith({
      page: 1,
      pageSize: 100,
    });
  });
});
```

### Integration Tests (Workflow Level)

```typescript
describe("FetchSyllabusWorkflow", () => {
  it("should orchestrate ETL activities", async () => {
    const workflow = new FetchSyllabusUseCase(
      mockIngestionRepo,
      extractActivity,
      transformActivity,
      loadActivity
    );

    await workflow.execute({
      universityCode: "chula",
      page: 1,
      pageSize: 100,
      isPaginated: true,
    });

    // Verify activities called in order
    expect(extractActivity.execute).toHaveBeenCalled();
    expect(transformActivity.execute).toHaveBeenCalled();
    expect(loadActivity.execute).toHaveBeenCalled();

    // Verify ingestion log updated
    expect(mockIngestionRepo.updateStatus).toHaveBeenCalledWith(
      expect.any(String),
      IngestionStatus.COMPLETED,
      expect.any(Date),
      null
    );
  });
});
```

## Summary

### What We Built

✅ **ETL Pattern**: Extract → Transform → Load  
✅ **Activity Abstraction**: Each step is independent  
✅ **Temporal-Ready**: Easy migration path to Temporal  
✅ **Better Testing**: Each activity testable independently  
✅ **Composability**: Activities reusable in other workflows  
✅ **Observability**: Clear logging per activity

### Migration Path to Temporal

1. ✅ **Phase 1**: Implement activity pattern (DONE!)
2. **Phase 2**: Extract activity logic to pure functions
3. **Phase 3**: Register with Temporal worker
4. **Phase 4**: Replace NestJS workflow with Temporal
5. **Phase 5**: Deploy and monitor

### Current State

```
✅ Activities implemented
✅ Workflow orchestrator updated
✅ Retry strategies in place
✅ Registered in DI container
✅ Ready for production
🔄 Ready for Temporal migration (when needed)
```

Your ETL workflow is now production-ready and Temporal-ready! 🚀
