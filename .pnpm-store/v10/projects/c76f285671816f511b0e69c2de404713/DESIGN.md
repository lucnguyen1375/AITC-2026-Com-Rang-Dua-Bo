---
name: "Bữa Việt — Ăn theo nhịp tập"
description: "A bright Vietnamese sports nutrition companion with cobalt, orange, and bold Be Vietnam Pro."
colors:
  blue: "#2349d8"
  blue-deep: "#1737af"
  blue-light: "#edf1ff"
  orange: "#ff8950"
  orange-ink: "#993d12"
  orange-light: "#fff0e6"
  green: "#237857"
  green-light: "#e9f5ee"
  ink: "#17233b"
  muted: "#657088"
  ground: "#f5f7fb"
  white: "#fff"
  line: "#e1e6ef"
  error: "#b82f32"
  coach-stage: "#e9efff"
  assistant-bubble: "#f1f4fa"
  chat-note: "#f7f8fc"
  field-line: "#cdd5e4"
  option-line: "#bccaf0"
  composer-line: "#ced7e9"
  progress-ground: "#e7ecf5"
typography:
  display:
    fontFamily: "'Be Vietnam Pro', sans-serif"
    fontSize: "32px"
    fontWeight: 800
    lineHeight: 1.35
    letterSpacing: "-.035em"
  onboarding-display:
    fontFamily: "'Be Vietnam Pro', sans-serif"
    fontSize: "36px"
    fontWeight: 800
    lineHeight: 1.4
    letterSpacing: "-.035em"
  headline:
    fontFamily: "'Be Vietnam Pro', sans-serif"
    fontSize: "21px"
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: "-.025em"
  title:
    fontFamily: "'Be Vietnam Pro', sans-serif"
    fontSize: "17px"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "-.02em"
  body:
    fontFamily: "'Be Vietnam Pro', sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.65
  conversation:
    fontFamily: "'Be Vietnam Pro', sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.85
  label:
    fontFamily: "'Be Vietnam Pro', sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.65
  action:
    fontFamily: "'Be Vietnam Pro', sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.65
  ai-question:
    fontFamily: "'Be Vietnam Pro', sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.7
  ai-field:
    fontFamily: "'Be Vietnam Pro', sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.65
rounded:
  option: "8px"
  field: "9px"
  action: "10px"
  navigation: "12px"
  panel: "16px"
  onboarding-shell: "18px"
  pill: "99px"
spacing:
  tight: "8px"
  compact: "12px"
  regular: "16px"
  comfortable: "20px"
  panel: "24px"
  section: "32px"
  desktop-gutter: "40px"
components:
  button-primary:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.white}"
    typography: "{typography.action}"
    rounded: "{rounded.action}"
    padding: "12px 20px"
  button-primary-hover:
    backgroundColor: "{colors.blue-deep}"
    textColor: "{colors.white}"
  button-secondary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.action}"
    rounded: "{rounded.action}"
    padding: "12px 20px"
  button-secondary-hover:
    backgroundColor: "{colors.blue-light}"
    textColor: "{colors.ink}"
  input-ai:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.ai-field}"
    rounded: "{rounded.field}"
    padding: "11px 12px"
  navigation-active:
    backgroundColor: "{colors.blue-light}"
    textColor: "{colors.blue}"
    rounded: "{rounded.navigation}"
    padding: "10px 4px"
  pill:
    backgroundColor: "{colors.blue-light}"
    textColor: "{colors.blue}"
    rounded: "{rounded.pill}"
    padding: "5px 11px"
  panel:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
  onboarding-option:
    backgroundColor: "{colors.white}"
    textColor: "{colors.blue}"
    rounded: "{rounded.option}"
    padding: "11px 17px"
  onboarding-option-selected:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.white}"
    rounded: "{rounded.option}"
  onboarding-shell:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.onboarding-shell}"
  conversation-assistant:
    backgroundColor: "{colors.assistant-bubble}"
    textColor: "{colors.ink}"
    typography: "{typography.conversation}"
    padding: "13px 14px"
  conversation-user:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.white}"
    typography: "{typography.conversation}"
    padding: "13px 14px"
---

# Design System: Bữa Việt

## Overview

**Creative North Star: "Sân tập hiện đại"**

Bữa Việt is a bright, confident training companion for Vietnamese adults. Cobalt establishes the identity and the next action; orange adds energy to training and nutrition markers. White working surfaces, dark ink, compact Vietnamese headings, and clear numerical measures keep practical tasks readable.

The system pairs flat, bordered interface surfaces with Vi, a rounded 3D sports companion wearing the same cobalt, orange, and white identity. The character brings warmth and physical depth without making the surrounding interface glossy or ornamental. The confirmed user direction is sporty, bold, and bright.

**Key Characteristics:**
- Cobalt actions and selected states, orange energy markers, white working surfaces.
- Be Vietnam Pro throughout, with heavy compact headings and readable Vietnamese text.
- Flat border-led panels with softly rounded corners.
- A sporty 3D companion with controllable motion.
- Clear conversational questions, editable answers, and an explicit agreement action.

This document records the desktop source implementation in `src/styles.css`, `src/workspace.css`, and `src/onboarding.css`, sampled against the onboarding, assistant, and avatar components. Frontmatter values are normative. Existing smaller-screen CSS is outside this documentation pass's review scope.

## Colors

The palette combines confident cobalt and energetic orange with cool white and slate neutrals.

### Primary
- **Cobalt** (`blue`): main actions, active navigation, selected answers, key numerical values, and Vi's sports clothing.
- **Deep Cobalt** (`blue-deep`): primary action hover.
- **Cobalt Tint** (`blue-light`): selected navigation, contextual cards, pills, and quiet blue hover states.

### Secondary
- **Energy Orange** (`orange`): training-day dots, nutrition progress, text selection, and the character's accessories.
- **Orange Ink** (`orange-ink`) and **Orange Wash** (`orange-light`): notices and qualified information that need readable warm emphasis.

### Tertiary
- **Success Green** (`green`) and **Success Wash** (`green-light`): positive status, confirmation, and safety/support cues.
- **Error Red** (`error`): invalid fields and request errors; always paired with explanatory text.

### Neutral
- **Training Ink** (`ink`): headings, body text, and numeric labels.
- **Slate** (`muted`): supporting copy, secondary labels, and inactive navigation.
- **Cool Ground** (`ground`): page canvas and quiet inset regions.
- **White** (`white`): editable fields and working panels.
- **Divider** (`line`): panel boundaries, separators, and secondary button borders.
- **Coach Stage** (`coach-stage`): the pale blue environment behind Vi.
- **Assistant Bubble** (`assistant-bubble`) and **Chat Note** (`chat-note`): assistant speech and adjacent service information.
- **Field, Option, and Composer Lines** (`field-line`, `option-line`, `composer-line`): the distinct source borders for entry and conversation controls.
- **Progress Ground** (`progress-ground`): unfilled collected-information segments.

**The Cobalt Action Rule.** Keep primary actions and selected states cobalt. Orange supports energy and context; the shipped primary action is cobalt.

## Typography

**Display Font:** Be Vietnam Pro, with sans-serif fallback.
**Body Font:** Be Vietnam Pro, with sans-serif fallback.

**Character:** One Vietnamese-capable family supplies a bold sports voice and a calm reading voice. Weight and scale create hierarchy; the implementation does not introduce a second display family or monospace identity.

### Hierarchy
- **Display:** the `display` role supplies general page headings; `onboarding-display` records the larger standalone welcome heading.
- **Headline:** the `headline` role supplies section headings. Conversation headings use a smaller source-specific size to fit their panels.
- **Title:** the `title` role supplies compact subheadings.
- **Body:** the `body` role supplies the base text. Welcome supporting text has an observed maximum width of (65ch).
- **Conversation:** the `conversation` role supplies the more open line rhythm used for onboarding messages.
- **Label and Action:** the `label` and `action` roles supply fields and common controls.
- **AI Question and Field:** the `ai-question` and `ai-field` roles keep generated prompts and answers above small supporting text.

Numerical measures use tabular numerals where implemented, including macro totals and body measurements. Do not shrink a substantive question to the small status-label scale.

**The Vietnamese Voice Rule.** Keep Be Vietnam Pro throughout the interface and retain Vietnamese diacritics in display text, labels, and data.

## Layout

Standalone desktop onboarding uses a centered container capped at (1240px), with horizontal gutters from `desktop-gutter`. The welcome is centered; the working area pairs a sticky character stage with a bordered conversation shell. The source grid is `minmax(280px,.85fr) minmax(440px,1fr)`, with the `section` spacing token between columns. The stage is (620px) high and sticky at (25px) from the top.

After agreement, the desktop workspace follows sidebar, main content, Vi, and chat. At the base desktop size, its outer columns are `92px minmax(420px,1fr) minmax(560px,1.12fr)`; the assistant area splits into `minmax(220px,.72fr) minmax(330px,1fr)`. The workspace occupies (100dvh), and main content and conversation history scroll within their regions. At the observed large-desktop threshold (1600px), the source widens the sidebar and content columns.

Use the recorded compact spacing rhythm inside controls and comfortable panel spacing around questions. Conversation options wrap naturally. The collected-information strip uses eight equal segments; it represents known information rather than a fixed sequence of quiz steps.

## Elevation & Depth

The CSS interface is flat: the sampled stylesheets define no box-shadow vocabulary. White panels are separated by cool borders, tonal fills, and whitespace. Vi supplies genuine 3D depth through geometry, lighting, and a platform; do not convert that depth into a new shadow system for cards and controls.

**The Border-Led Surface Rule.** Use borders and tonal layering for interface depth; preserve the rounded 3D character as the physical focal point.

The sidecar records the implemented transition easing and timing. Primary actions in the current onboarding and workspace change color on hover without translating; the more general base style's upward hover translation is overridden on these surfaces. Avatar animation respects pause and reduced motion.

## Shapes

Forms use gently curved field and option corners. Common actions are slightly rounder; navigation and utility blocks use broader corners. General panels use `panel`, while the paired onboarding stage and conversation shell use `onboarding-shell`. Pills are fully rounded.

Conversation bubbles have an asymmetric speech silhouette: the assistant's upper-left corner and the user's upper-right corner are square, with (13px) rounding on their remaining corners. The collected-information strip uses short, low, rounded segments rather than large step badges.

## Components

### Buttons

Confident, compact controls keep the action visible.
- **Primary:** cobalt with white text, `action` typography, and the frontmatter padding. The source minimum height is (46px).
- **Secondary:** white with dark ink and a divider border; hover uses cobalt tint and a cobalt border.
- **Text:** cobalt, unfilled, with an underlined hover treatment for reset and secondary text actions.
- **Focus:** the global keyboard treatment is a (3px) cobalt outline offset by (4px).
- **Disabled:** the source uses reduced opacity (.55) and a not-allowed cursor.

### Chips

The small informational pill uses cobalt tint and cobalt text. AI quick options are larger interactive controls with a light cobalt border, wrapping layout, and comfortable padding. Hover fills them with cobalt tint; selected onboarding answers fill cobalt with white text. Selection is also exposed through `aria-pressed`.

### Cards / Containers

Working cards are white with a divider border and the `panel` radius. Profile snapshots use `panel` spacing internally. The onboarding shell uses its larger radius and clips the progress header, conversation, and composer into one surface. In the proposal state, the question/action region removes its height cap and inner scrolling (`max-height:none; overflow:visible`): the complete proposal and its source/assumption disclosure appear in document flow before approval. Agreement actions sit on a cobalt-tinted region beneath the proposal.

### Inputs / Fields

Editable fields are white, ink-colored, and outlined with the field border. AI-generated fields use `ai-field` typography and an observed minimum height of (48px). A hovered field border darkens; invalid fields use error red. The free-reply composer places a resizable textarea and cobalt send control inside a broader rounded border, which turns cobalt on focus within.

### Navigation

Desktop workspace navigation is an icon-plus-label column on a white sidebar. Items have broad rounded corners; inactive text is slate, hover uses the cool ground, and active navigation uses cobalt tint with cobalt text. Standalone onboarding has a brand toolbar and reset action in place of workspace navigation.

### Conversation and Vi

Assistant speech uses the cool bubble fill; user speech uses cobalt and white. Messages wrap long text and retain the asymmetric silhouette. Questions, options, and text entry share the conversation surface. Errors appear in text with a retry control. Live BTC Gateway requests currently return HTTP400; this design documentation does not assert a successful live AI response.

Vi repeats the brand palette in a rounded sports character against a pale blue stage. Wave and pause controls are visible, and a text/SVG fallback keeps the companion region usable when WebGL is unavailable. The stage starts directly with Vi's greeting; the former availability eyebrow has been removed.

## Do's and Don'ts

### Do:
- **Do** use cobalt for the next action and selected states.
- **Do** keep Vietnamese text in Be Vietnam Pro, with a bold heading hierarchy.
- **Do** separate working surfaces with borders, tonal fills, and whitespace.
- **Do** preserve editable answers, visible error copy, and the full proposal with source/assumption disclosure before the explicit agreement action.
- **Do** expose pause controls and honor reduced motion for the 3D companion.

### Don't:
- **Don't** replace the confirmed cobalt, orange, and white sports identity with another app's visual system.
- **Don't** introduce card shadows as a new default in this flat interface.
- **Don't** treat orange energy markers as the canonical primary action color.
- **Don't** place source/assumption disclosure after the agreement action or constrain the proposal to an inner scrolling region.
- **Don't** present a source-code review of the AI conversation as proof of a successful live service response.
