# Repository Agent Guidelines: AasPass Full-Stack

This workspace is a full-stack platform consisting of:
- **Backend (`aaspass-service-backend`)**: Spring Boot (Java 17, Maven, JPA, MySQL, Lombok).
- **Frontend (`aaspass-client`)**: Angular 22 (TypeScript 6, Signals, Tailwind CSS, Vite/Vitest).

---

## Reviewer Agent & Code Quality Standards

Whenever changes are implemented or reviewed, ensure the following standards are strictly met:

### 1. Compile-Time Verification
- **Backend**: Always verify changes by compiling:
  ```powershell
  cd aaspass-service-backend; .\mvnw.cmd test-compile
  ```
  Ensure all Lombok annotations, JPA entities, repositories, and controllers compile cleanly without errors.
- **Frontend**: Always verify changes by compiling:
  ```powershell
  cd aaspass-client; npm run build
  ```
  Ensure TypeScript types, Angular component templates, and services pass without type or syntax errors.

### 2. Null-Safety & Defect Prevention
- **Avoid NullPointerExceptions in Java**:
  - Always guard chained getters (`a.getB().getC()`).
  - Use `Optional.orElseThrow()` or `Optional.orElse()` rather than bare `Optional.get()`.
  - Use `"LITERAL".equals(variable)` instead of `variable.equals("LITERAL")`.
  - Avoid unboxing wrapper classes (`Long`, `Integer`, `Boolean`) without null checking.
  - Return empty collections (`Collections.emptyList()`) instead of returning `null`.
- **Avoid Undefined / Null Dereferencing in TypeScript/Angular**:
  - Use optional chaining (`?.`) when dereferencing nested objects or API response properties.
  - Use nullish coalescing (`??`) for default fallbacks.
  - Guard Signal reads in templates with native control flow (`@if (item())`).
  - Guard array lookups (`Array.find()`, `Array.filter()`) before accessing properties on the result.

### 3. Reviewer Agent Subagent
The specialized subagent `reviewer-agent` is available to:
1. Inspect git changes and diffs.
2. Detect potential NullPointer and compile-time issues.
3. Automatically apply surgical fixes and re-verify builds.
