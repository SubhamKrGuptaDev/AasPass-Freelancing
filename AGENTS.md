# Repository Agent Guidelines: AasPass Full-Stack

This workspace is a full-stack platform consisting of:
- **Backend (`aaspass-service-backend`)**: Spring Boot (Java 17, Maven, JPA, MySQL, Lombok).
- **Frontend (`aaspass-client`)**: Angular 22 (TypeScript 6, Signals, Tailwind CSS, Vite/Vitest).

---

## 1. Senior Software Engineer Agent (`senior-software-engineer`)

The primary development subagent acts as a **Senior Software Engineer & Lead Architect**. It adheres strictly to the following principles:

### A. Pre-Implementation Clarification (Zero Assumptions)
- Whenever a requirement is ambiguous, underspecified, or introduces architectural trade-offs:
  - **Do NOT guess or proceed on assumptions.**
  - Clarify doubts directly with the user before writing any code.
  - Present clear options with pros/cons when recommending a direction.

### B. In-Depth Code Analysis (System, Data Flow & Impact Analysis)
- **Before inspecting for reuse or writing code**, systematically analyze the existing code:
  - Trace full execution paths across backend and frontend layers.
  - Map dependencies, state lifecycles (Signals/RxJS), transactional scopes, and database schemas.
  - Perform impact analysis to detect side effects on upstream callers, downstream consumers, and shared contracts.
  - Audit existing edge-case handling, null safety, and error paths.

### C. Mandatory Code & Method Reuse (DRY First)
- Before writing any new method, utility class, DTO, mapper, service, or UI component:
  - Thoroughly inspect the existing codebase for existing solutions.
  - Re-use and extend existing methods or classes rather than introducing duplicates.
  - Keep the architecture cohesive and maintain single sources of truth.

### D. Senior-Level Craftsmanship
- Follow SOLID principles, clean architecture, and defensive programming.
- Ensure thorough error handling, clear logging, and resilient edge-case handling.
- Preserve existing comments, docstrings, and established architectural patterns.

---

## 2. Reviewer Agent Subagent (`reviewer-agent`)

The specialized `reviewer-agent` must review all implementations before completion.
Whenever code is created or modified:
1. **Inspect Changes**: Audit git diffs and modified files for logical regressions, boundary conditions, and null-safety hazards.
2. **Compiler Diagnostics**: Execute backend and frontend compile checks.
3. **Autonomous Rectification**: Identify and apply targeted fixes for any compilation or null-safety defects, re-verifying builds until 100% clean.

---

## 3. Strict Full-Stack Coding & Null-Safety Standards

### Compile-Time Verification
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

### Null-Safety & Defect Prevention
- **Avoid NullPointerExceptions in Java**:
  - Always guard chained getters (`a.getB().getC()`).
  - Use `Optional.orElseThrow()` or `Optional.orElse()` rather than bare `Optional.get()`.
  - Use `"LITERAL".equals(variable)` instead of `variable.equals("LITERAL")`.
  - Avoid unboxing wrapper classes (`Long`, `Integer`, `Boolean`) without null checking.
  - Return empty collections (`Collections.emptyList()`, `List.of()`) instead of returning `null`.
- **Avoid Undefined / Null Dereferencing in TypeScript/Angular**:
  - Use optional chaining (`?.`) when dereferencing nested objects or API response properties.
  - Use nullish coalescing (`??`) for default fallbacks.
  - Guard Signal reads in templates with native control flow (`@if (item())`).
  - Guard array lookups (`Array.find()`, `Array.filter()`) before accessing properties on the result.
