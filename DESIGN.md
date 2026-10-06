# Việt Nam Bốn Mùa Hoa Trái

## Mission
Create implementation-ready, token-driven UI guidance for Việt Nam Bốn Mùa Hoa Trái that is optimized for consistency, accessibility, and fast delivery across e-commerce storefront.

## Brand
- Product/brand: Việt Nam Bốn Mùa Hoa Trái
- URL: https://vietnambonmuahoatrai.com.vn/?fbclid=IwY2xjawUwsFZleHRuA2FlbQIxMABwZG9mBWJyaWQRMWFqV25nZXBBcEdmZnUxWlVzcnRjBmFwcF9pZBAyMjIwMzkxNzg4MjAwODkyAAEekMnLaoNvvvpVzv17m39nwCvM7k0q_80L8uVEhJGDEQcBsoWhdABpZlkJCYA_aem_H5lIUH9jnrQ5GnLuXNGKew
- Audience: online shoppers and consumers
- Product surface: e-commerce storefront

## Style Foundations
- Visual style: structured, tokenized, content-first
- Main font style: `font.family.primary=-apple-system`, `font.family.stack=-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji`, `font.size.base=16px`, `font.weight.base=400`, `font.lineHeight.base=24px`
- Typography scale: `font.size.xs=15px`, `font.size.sm=16px`, `font.size.md=17px`, `font.size.lg=18px`, `font.size.xl=20px`, `font.size.2xl=22px`, `font.size.3xl=28px`, `font.size.4xl=30px`
- Color palette: `color.text.primary=#141414`, `color.surface.base=#000000`, `color.text.tertiary=#ffffff`, `color.text.inverse=#67350a`, `color.surface.muted=#f1f3e6`, `color.surface.raised=#61ce70`, `color.surface.strong=#020101`, `color.border.strong=#c5c5c5`
- Spacing scale: `space.1=4.5px`, `space.2=5px`, `space.3=6px`, `space.4=6.5px`, `space.5=7px`, `space.6=12px`, `space.7=14.4px`, `space.8=15px`
- Radius/shadow/motion tokens: `radius.xs=3px`, `radius.sm=16px`, `radius.md=40px`, `radius.lg=42px`, `radius.xl=100px` | `shadow.1=rgba(0, 0, 0, 0.16) 0px 0px 10px 0px` | `motion.duration.instant=250ms`, `motion.duration.fast=300ms`, `motion.duration.normal=400ms`

## Accessibility
- Target: WCAG 2.2 AA
- Keyboard-first interactions required.
- Focus-visible rules required.
- Contrast constraints required.

## Writing Tone
Concise, confident, implementation-focused.

## Rules: Do
- Use semantic tokens, not raw hex values, in component guidance.
- Every component must define states for default, hover, focus-visible, active, disabled, loading, and error.
- Component behavior should specify responsive and edge-case handling.
- Interactive components must document keyboard, pointer, and touch behavior.
- Accessibility acceptance criteria must be testable in implementation.

## Rules: Don't
- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.
- Do not ship component guidance without explicit state rules.

## Guideline Authoring Workflow
1. Restate design intent in one sentence.
2. Define foundations and semantic tokens.
3. Define component anatomy, variants, interactions, and state behavior.
4. Add accessibility acceptance criteria with pass/fail checks.
5. Add anti-patterns, migration notes, and edge-case handling.
6. End with a QA checklist.

## Required Output Structure
- Context and goals.
- Design tokens and foundations.
- Component-level rules (anatomy, variants, states, responsive behavior).
- Accessibility requirements and testable acceptance criteria.
- Content and tone standards with examples.
- Anti-patterns and prohibited implementations.
- QA checklist.

## Component Rule Expectations
- Include keyboard, pointer, and touch behavior.
- Include spacing and typography token requirements.
- Include long-content, overflow, and empty-state handling.
- Include known page component density: buttons (229), links (76), lists (47), inputs (6), navigation (5).


## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Teams should prefer system consistency over local visual exceptions.
