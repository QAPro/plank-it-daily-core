
# Testing Strategy for PlankIt Fitness App

## Overview

This project uses a comprehensive testing strategy with multiple layers to ensure reliability and maintainability as the app scales.

## Testing Stack

- **Unit Tests**: Vitest + React Testing Library
- **Integration Tests**: Vitest + React Testing Library
- **E2E Tests**: Playwright
- **Coverage**: Vitest Coverage (v8)
- **CI/CD**: GitHub Actions

## Running Tests

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests once (CI mode)
npm run test:run

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

## Test Structure

```
src/
├── __tests__/           # Test utilities and global tests
│   ├── utils/           # Test helpers and factories
│   └── integration/     # Integration tests
├── components/
│   └── __tests__/       # Component unit tests
├── hooks/
│   └── __tests__/       # Hook unit tests
├── services/
│   └── __tests__/       # Service unit tests
└── e2e/                 # End-to-end tests
```

## Test Categories

### 1. Unit Tests
- **Components**: Render correctly, handle props, user interactions
- **Hooks**: State management, side effects, error handling
- **Services**: Business logic, API calls, data transformations
- **Utilities**: Pure functions, helpers, calculations

### 2. Integration Tests
- **User Flows**: Complete workout sessions with state changes
- **Database Integration**: Supabase queries and real-time updates
- **Cross-component Communication**: Timer → Achievement → Celebration

### 3. E2E Tests
- **Critical User Journeys**: Onboarding → Workout → Achievement
- **Cross-browser Compatibility**: Chrome, Firefox, Safari
- **Responsive Design**: Mobile, tablet, desktop viewports

## Test Utilities

### Mock Factories
```typescript
import { createMockUser, createMockExercise } from '@/__tests__/utils/test-utils';

const user = createMockUser({ email: 'custom@example.com' });
const exercise = createMockExercise({ difficulty_level: 'advanced' });
```

### Supabase Mocking
```typescript
import { mockSupabase, setupSupabaseMocks } from '@/__tests__/utils/mock-supabase';

setupSupabaseMocks();
mockSupabase.from('user_sessions').insert.mockResolvedValue({ error: null });
```

### Custom Render
```typescript
import { render } from '@/__tests__/utils/test-utils';

render(<Component />); // Includes all providers automatically
```

## Coverage Requirements

- **Minimum Coverage**: 80% across branches, functions, lines, statements
- **Critical Paths**: 95%+ coverage for core workout and achievement flows
- **New Features**: Must include comprehensive tests before merge

## Automated Testing

### Pre-commit Hooks
- Run unit tests and linting before each commit
- Prevent commits if tests fail

### GitHub Actions
- Run full test suite on push/PR
- E2E tests across multiple browsers
- Coverage reporting with Codecov
- Artifact upload for failed tests

## Best Practices

### Writing Tests
1. **Arrange, Act, Assert**: Clear test structure
2. **Descriptive Names**: Tests as documentation
3. **Single Responsibility**: One concept per test
4. **Mock External Dependencies**: Focus on unit under test

### Test Data
1. **Use Factories**: Consistent, maintainable test data
2. **Realistic Data**: Mirror production scenarios
3. **Edge Cases**: Test boundaries and error conditions

### Maintenance
1. **Keep Tests Fast**: Unit tests < 100ms, integration < 1s
2. **Avoid Implementation Details**: Test behavior, not internals
3. **Regular Cleanup**: Remove obsolete tests, update mocks

## Performance Monitoring

- **Test Execution Time**: Monitor and optimize slow tests
- **Coverage Trends**: Track coverage over time
- **Flaky Test Detection**: Identify and fix unreliable tests

## Scaling Strategy

As the app grows:

1. **Test Organization**: Group by feature domains
2. **Parallel Execution**: Utilize multiple workers
3. **Smart Test Selection**: Run only affected tests in development
4. **Visual Regression**: Add screenshot testing for UI components
5. **Load Testing**: Add performance testing for high-traffic scenarios

## Debugging Tests

```bash
# Debug specific test
npm test -- --reporter=verbose MyComponent.test.tsx

# Run tests in watch mode
npm run test:watch

# Open test UI for interactive debugging
npm run test:ui
```

## Continuous Improvement

- Monthly test suite performance review
- Coverage gap analysis
- Flaky test identification and resolution
- Test strategy refinement based on bug patterns

This testing strategy ensures high confidence in deployments while maintaining fast development cycles and easy maintenance as the app scales.
