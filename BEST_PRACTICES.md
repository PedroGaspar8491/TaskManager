# 📘 Project Best Practices

## 1. Project Purpose
TaskManager is a lightweight Angular application for organizing work into Topics, each with a simple checklist of items. It demonstrates modern Angular 17+/20 patterns: standalone components, the new control flow syntax (@if/@for), zoneless change detection, RxJS-based state in a service, and lightweight persistence via localStorage.

## 2. Project Structure
- Root
  - angular.json, tsconfig*.json: Angular CLI and TypeScript configuration
  - package.json: scripts, dependencies, test runner configuration
  - README.md: basic dev/build/test instructions
  - BEST_PRACTICES.md: this document
  - public/: static assets (if any)
  - dist/: build output (generated)
- src/
  - main.ts: application bootstrap using bootstrapApplication with appConfig
  - index.html: host page
  - styles.css: global styles
  - app/
    - app.ts|app.html|app.css: root standalone component (App)
    - app.config.ts: provides provideBrowserGlobalErrorListeners and provideZonelessChangeDetection
    - app.routes.ts: routing entry (currently empty)
    - app-content/ (feature component)
      - app-content.ts|.html|.css: selected topic view and checklist management
    - app-menu/ (feature component)
      - app-menu.ts|.html|.css: topics list, search, creation/removal
    - data-service.ts: application state management and localStorage persistence
    - topic.ts, topic-item.ts: domain models (interfaces)
    - *.spec.ts: unit tests for App and DataService

Separation of concerns
- Components manage view state, user interactions, and delegate business logic to DataService.
- DataService encapsulates application state, persistence, and mutations.
- Models define typed domain shapes.
- Configuration and bootstrap are separated (app.config.ts, main.ts).

Entry points and configuration
- main.ts bootstraps App with appConfig.
- app.config.ts provides zoneless change detection and global error listeners.
- app.routes.ts reserved for future routing.

## 3. Test Strategy
- Frameworks: Jasmine + Karma (Angular CLI defaults). Puppeteer is available to run headless Chrome in CI environments.
- Test layout and naming: co-located *.spec.ts files next to implementation for tight coupling and easy maintenance.
- Current examples:
  - app.spec.ts: smoke tests for component creation and simple DOM assertions.
  - data-service.spec.ts: verifies service behavior, id sequencing, mutation logic, and persistence safety.
- Mocking and environment setup:
  - Clear localStorage at the start of tests to ensure isolation: try { localStorage.clear(); } catch {}
  - Prefer explicit construction via TestBed where Angular providers are involved. Provide provideZonelessChangeDetection when testing components/services that depend on it.
- Philosophy:
  - Unit tests for service logic (pure mutations, persistence side-effects guarded by try/catch).
  - Component tests for rendering branches and user flows (e.g., @if branches, @for lists, search filtering).
  - Aim for fast, deterministic tests; avoid relying on real timers or external I/O.
- Coverage expectations:
  - Critical state transitions in DataService (add/remove topic/items, toggle, persistence) should be covered.
  - Key template branches should be asserted at least once (landing vs selected topic, empty vs non-empty lists).

## 4. Code Style
- Language/Angular conventions
  - Use standalone components (imports array in @Component) and the modern template control flow (@if/@for) introduced in Angular v17+.
  - Keep templateUrl/styleUrl in components; when multiple styles are needed, use styleUrls.
  - Use provideZonelessChangeDetection for push-based patterns and improved performance.
- Typing and immutability
  - Define domain interfaces in dedicated files (Topic, TopicItem).
  - Favor immutable updates for arrays and objects (spread syntax) rather than in-place mutation.
  - Validate and sanitize inputs at the service boundary (e.g., trim and throw on empty names).
- Observables and signals
  - Services: expose readonly Observables (asObservable()) from BehaviorSubjects; keep subjects private.
  - Components: prefer async pipe to manage subscriptions automatically when possible. If manually subscribing, ensure teardown via takeUntilDestroyed or DestroyRef.
  - Be consistent when naming streams (conventionally use $ suffix for Observables in components).
- Naming conventions
  - Classes/Components: PascalCase (AppMenu, AppContent, DataService).
  - Selectors: kebab-case (app-menu, app-content).
  - Files: kebab-case for component folders/files; .spec.ts for tests.
  - Variables and methods: camelCase; boolean flags prefixed with is/has/show when appropriate.
- Templates and accessibility
  - Keep templates declarative and lean; move logic to components/services.
  - Use track or trackBy to optimize list rendering (already used with @for track item.id).
  - Provide accessible labels (aria-label) for interactive controls.
- Error handling
  - Validate inputs (throw or handle gracefully) in DataService and surface actionable errors in the UI when needed.
  - Wrap persistence in try/catch to guard against storage unavailability or quota errors (already implemented).
- Formatting and linting
  - Prettier is configured to parse Angular HTML. Maintain consistent formatting for readability and diffs.

## 5. Common Patterns
- State management via BehaviorSubject
  - Private BehaviorSubjects, public Observables; centralized mutations in DataService (add/remove/toggle).
  - Immutability: create new arrays/objects on updates to trigger change detection efficiently.
- Persistence
  - localStorage keys are namespaced (tm.topicList, tm.currentTopic). Loading and saving are guarded by try/catch.
- Identity and selection
  - Sequential numeric ids per Topic and per TopicItem list. Selected topic represented by a sentinel id (-1) when none.
- UI patterns
  - Feature components per area (menu/content) with local UI flags (showNewTopicInput, showTopics).
  - Filtering via a searchTerm and derived filteredTopics getter.
  - Angular’s modern template syntax (@if, @for) with track for efficient rendering.

## 6. Do's and Don'ts
- Do
  - Use standalone components and the new template control flow (@if/@for).
  - Keep state updates immutable and centralized in DataService; persist after meaningful state changes.
  - Trim and validate all user inputs before mutating state.
  - Use track or trackBy for large lists; prefer async pipe when consuming Observables in templates.
  - Keep selectors, file names, and class names consistent (kebab-case selectors, PascalCase classes, kebab-case files).
  - Clear or mock localStorage in tests to avoid leakage; use TestBed with proper providers.
  - Use accessibility attributes and keyboard-friendly interactions.
- Don't
  - Mutate arrays/objects in-place within shared state; avoid pushing directly into BehaviorSubject values.
  - Create subscriptions in components without a teardown strategy; avoid nested subscriptions.
  - Rely on magic sentinel values across layers; centralize and document them (e.g., -1 for no selection).
  - Perform heavy logic in templates; keep expressions simple for maintainability and performance.
  - Expose BehaviorSubject instances from services; expose only Observables.

## 7. Tools & Dependencies
- Angular 20 (core, common, forms, platform-browser, router)
  - Standalone components, modern control flow, zoneless change detection.
- RxJS ~7.8: reactive state and events.
- Testing: Jasmine, Karma, @types/jasmine; Puppeteer for headless Chrome in CI.
- Build/CLI: @angular/cli, @angular/build, @angular/compiler-cli, TypeScript ~5.8.
- Prettier: HTML parser override for Angular templates.

Project setup and scripts
- Install: npm install
- Dev server: npm start or ng serve → http://localhost:4200/
- Build: npm run build → outputs to dist/
- Unit tests: npm test

## 8. Other Notes
- For new code, follow the established standalone structure and place feature components in their own folders with .ts/.html/.css files.
- Prefer async pipe in templates over manual subscribe in components to align with zoneless/push-based change detection. When manual subscriptions are necessary, use takeUntilDestroyed or DestroyRef for cleanup.
- Maintain immutability and update persistence via a single persistState method after state changes.
- Keep using the modern template syntax (@if/@for) and utilize track for list performance. Ensure consistency (either track expressions or trackBy functions) across the codebase.
- Consider creating lightweight UI indicators for persistence or error states (e.g., storage failures) without blocking the UI.
- If routing is introduced, keep routes in app.routes.ts and adopt lazy-loaded feature areas where appropriate.
- When adding fields to Topic/TopicItem, update tests and persistence migration logic as needed to maintain backward compatibility with stored data.
