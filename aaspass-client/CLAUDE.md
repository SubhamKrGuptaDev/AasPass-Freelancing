Angular 22 + TypeScript (strict). Follow these conventions:

- No `any` (use `unknown`).
- Don't set `standalone: true` or `ChangeDetectionStrategy.OnPush` (both are defaults).
- Use signals, `computed()`, `input()`/`output()`/`model()`, and `inject()`. Never `mutate` signals.
- Use native control flow (`@if`, `@for`, `@switch`), `class`/`style` bindings (no `ngClass`/`ngStyle`), no `CommonModule`.
- Use the `host` object, not `@HostBinding`/`@HostListener`.
- Prefer Signal Forms for new forms, else Reactive forms.
- Use `@Service` for new singleton services; lazy-load feature routes; `NgOptimizedImage` for static images.
- Must pass AXE and WCAG AA.
