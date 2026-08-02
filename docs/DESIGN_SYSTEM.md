# Movely - Design System

**Last Updated:** 2026-05-01  
**Phase:** 7.5 - Visual Consolidation  

---

## Overview

This document defines Movely's visual design system - a consistent set of design tokens, components, and patterns used across the entire application.

### Design Principles

- **Clean**: Minimal visual noise, clear hierarchy
- **Modern**: Contemporary aesthetics without being trendy
- **Trustworthy**: Professional and reliable appearance
- **Accessible**: Mobile-first, readable, WCAG compliant
- **Subtle**: Smooth transitions, gentle animations

---

## Design Tokens

### Colors

**Core Colors:**
```css
--background: 40 20% 97%          /* Warm off-white */
--foreground: 220 15% 12%         /* Deep charcoal */
--card: 0 0% 100%                 /* Pure white cards */
--card-foreground: 220 15% 12%    /* Card text */
```

**Brand Colors - Sage Green Primary:**
```css
--primary: 150 25% 45%            /* Sage green - trustworthy & natural */
--primary-foreground: 0 0% 100%   /* White text on primary */
--primary-hover: 150 30% 38%      /* Darker sage on hover */
--secondary: 150 20% 92%          /* Light sage tint */
--secondary-foreground: 150 25% 25%  /* Dark sage text */
--accent: 45 90% 55%              /* Warm yellow accent */
--accent-foreground: 220 15% 12% /* Dark text on accent */
```

**Utility Colors:**
```css
--muted: 40 15% 93%               /* Warm light gray */
--muted-foreground: 220 10% 45%   /* Medium gray text */
--destructive: 0 72% 55%          /* Vibrant red */
--success: 142 70% 45%            /* Fresh green */
--warning: 38 95% 55%             /* Bright yellow */
```

**UI Elements:**
```css
--border: 240 5.9% 90%            /* Borders */
--input: 240 5.9% 90%             /* Input borders */
--ring: 240 5.9% 10%              /* Focus rings */
```

### Typography

**Scale:**
- `h1`: 2.25rem (36px) / 3rem (48px) on desktop, bold, tight tracking
- `h2`: 1.875rem (30px), semibold, tight tracking
- `h3`: 1.5rem (24px), semibold, tight tracking
- `h4`: 1.25rem (20px), semibold, tight tracking
- `p`: 1rem (16px), leading-7 (28px line height)

**Font Family:**
- Sans: Geist (system fallback: -apple-system, sans-serif)
- Mono: Geist Mono (for code)

### Spacing Scale

**Layout Spacing:**
```css
--space-page-x: 1rem              /* Horizontal page padding */
--space-page-y: 2rem              /* Vertical page padding */
--space-section: 3rem             /* Between major sections */
--space-content: 1.5rem           /* Within content blocks */
```

**Component Spacing:**
- `space-y-4`: 1rem (16px)
- `space-y-6`: 1.5rem (24px)
- `space-y-8`: 2rem (32px)

### Border Radius

```css
--radius: 0.5rem (8px)            /* Base radius */
```

- `rounded-lg`: var(--radius)
- `rounded-md`: calc(var(--radius) - 2px)
- `rounded-sm`: calc(var(--radius) - 4px)
- `rounded-full`: 9999px (full circle)

### Shadows

```css
--shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.08)
--shadow-md: 0 4px 12px -2px rgb(0 0 0 / 0.12), 0 2px 6px -1px rgb(0 0 0 / 0.06)
--shadow-lg: 0 12px 24px -4px rgb(0 0 0 / 0.14), 0 6px 12px -2px rgb(0 0 0 / 0.08)
--shadow-brand: 0 4px 16px -2px rgb(150 25% 45% / 0.15)  /* Green-tinted shadow */
```

**Utility Classes:**
- `.shadow-soft`: Minimal shadow for subtle elevation
- `.shadow-card`: Enhanced medium shadow for cards
- `.shadow-elevated`: Large shadow for modals/dropdowns/hover
- `.shadow-brand`: Green-tinted shadow for primary buttons

---

## Layout Components

### PageContainer

**Purpose:** Consistent max-width container with responsive padding

**Usage:**
```tsx
import { PageContainer } from '@/components/layout/page-container'

<PageContainer size="md">
  {/* Page content */}
</PageContainer>
```

**Props:**
- `size`: `'sm' | 'md' | 'lg' | 'xl' | 'full'`
  - sm: 640px (2xl)
  - md: 768px (4xl)
  - lg: 1024px (6xl)
  - xl: 1280px (7xl)
  - full: 100%
- `className`: Additional classes

**Features:**
- Auto-centering with `mx-auto`
- Responsive horizontal padding: 1rem (mobile), 1.5rem (tablet), 2rem (desktop)
- Vertical padding: 2rem

### Section

**Purpose:** Consistent vertical spacing between content sections

**Usage:**
```tsx
import { Section } from '@/components/layout/section'

<Section spacing="lg">
  {/* Section content */}
</Section>
```

**Props:**
- `spacing`: `'sm' | 'md' | 'lg'`
  - sm: space-y-4 (1rem)
  - md: space-y-6 (1.5rem / default)
  - lg: space-y-8 (2rem)
- `className`: Additional classes

---

## UI Components

### Button

**Variants:**
- `default`: Primary action (black background, white text)
- `secondary`: Secondary action (light gray background)
- `outline`: Outlined button (border only)
- `ghost`: Minimal button (no background until hover)
- `destructive`: Dangerous action (red)

**Sizes:**
- `sm`: Small
- `default`: Medium
- `lg`: Large

**Usage:**
```tsx
<Button variant="default" size="lg">
  Primary Action
</Button>
```

**Features:**
- Smooth transitions (`.transition-smooth`)
- Focus ring on keyboard navigation
- Disabled state
- Loading state support

### Card

**Purpose:** Content container with elevation

**Components:**
- `Card`: Main container
- `CardHeader`: Top section
- `CardTitle`: Card title
- `CardDescription`: Subtitle/description
- `CardContent`: Main content area
- `CardFooter`: Bottom section

**Usage:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

**Features:**
- Subtle shadow by default
- White background
- Rounded corners
- Hover effects optional

### Badge

**Variants:**
- `default`: Primary (black)
- `secondary`: Gray
- `outline`: Bordered
- `destructive`: Red
- `success`: Green
- `warning`: Yellow

**Usage:**
```tsx
<Badge variant="success">Approved</Badge>
```

**Features:**
- Small, rounded-full design
- Uppercase text
- Appropriate semantic colors

### Input & Label

**Input:**
- Consistent height
- Border focus states
- Disabled styles
- Error states

**Label:**
- Associated with form controls
- Consistent sizing
- Required indicator support

**Usage:**
```tsx
<div>
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="you@example.com" />
</div>
```

---

## Transitions & Animations

### Smooth Transitions

**Utility Class:**
```css
.transition-smooth {
  transition: all 200ms ease-in-out;
}
```

**Usage:**
```tsx
<Button className="transition-smooth hover:shadow-card">
  Hover Me
</Button>
```

**When to Use:**
- Button hover states
- Card hover effects
- Link color changes
- Background changes

**When NOT to Use:**
- Layout shifts
- Mount/unmount (use proper animation libraries)
- Complex multi-step animations

---

## Backgrounds & Surfaces

### Page Backgrounds

**Standard Pages:**
```tsx
<div className="min-h-screen bg-muted/30">
  {/* Subtle gray background */}
</div>
```

**Hero/Landing:**
```tsx
<div className="bg-gradient-to-b from-background to-muted/20">
  {/* Subtle gradient */}
</div>
```

### Surface Levels

1. **Base**: `bg-background` (white)
2. **Elevated**: `bg-card` with shadow
3. **Muted**: `bg-muted` (light gray)

---

## Responsive Design

### Breakpoints

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Mobile-First Approach

Always design for mobile first, then enhance for larger screens:

```tsx
<h1 className="text-4xl sm:text-5xl">
  Responsive Heading
</h1>

<div className="flex flex-col sm:flex-row gap-3">
  {/* Stacks on mobile, row on tablet+ */}
</div>
```

---

## Usage Guidelines

### Do's

✅ Use PageContainer for consistent page width
✅ Use Section for consistent vertical rhythm
✅ Apply transition-smooth to interactive elements
✅ Use semantic color variants (success, destructive, etc.)
✅ Follow mobile-first responsive patterns
✅ Use design tokens (CSS variables) over hardcoded values

### Don'ts

❌ Don't use arbitrary colors outside the palette
❌ Don't mix spacing scales inconsistently
❌ Don't create one-off component variants
❌ Don't use heavy animations
❌ Don't ignore mobile breakpoints
❌ Don't override component styles excessively

---

## Component Checklist

When creating new components:

- [ ] Uses design tokens from globals.css
- [ ] Responsive (mobile-first)
- [ ] Accessible (keyboard nav, ARIA labels)
- [ ] Consistent with existing components
- [ ] Includes hover/focus states
- [ ] Uses transition-smooth for interactions
- [ ] TypeScript typed properly
- [ ] Documented if reusable

---

## Examples

### Page Structure

```tsx
import { PageContainer } from '@/components/layout/page-container'
import { Section } from '@/components/layout/section'

export default function ExamplePage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <PageContainer size="lg">
        <Section spacing="lg">
          <h1>Page Title</h1>
          <p className="text-muted-foreground">Description</p>
        </Section>
        
        <Section spacing="md">
          {/* Content */}
        </Section>
      </PageContainer>
    </div>
  )
}
```

### Card Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => (
    <Card key={item.id} className="transition-smooth hover:shadow-card">
      <CardHeader>
        <CardTitle>{item.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {item.content}
      </CardContent>
    </Card>
  ))}
</div>
```

### Form Pattern

```tsx
<Card>
  <CardHeader>
    <CardTitle>Form Title</CardTitle>
    <CardDescription>Form description</CardDescription>
  </CardHeader>
  <CardContent>
    <form className="space-y-4">
      <div>
        <Label htmlFor="field">Field Label</Label>
        <Input id="field" />
      </div>
      
      <Button type="submit" className="w-full">
        Submit
      </Button>
    </form>
  </CardContent>
</Card>
```

---

## Future Enhancements

**Phase 8+:**
- Additional component variants (tabs, dialog, dropdown)
- Advanced animations (page transitions)
- Dark mode refinement
- Accessibility audit
- Component documentation site

---

## Actual Color Tokens (Phase 7.5)

These are the actual hardcoded values in use across the codebase (Tailwind utility-first approach):

| Purpose | Value | Usage |
|---|---|---|
| Primary Navy | `#0B1F3D` | Buttons, admin header, CTA |
| Primary Hover | `#001F3F` | Button hover states |
| Amber Accent | `amber-400` | Badges, hero CTA button |
| Background | `gray-50` | Page backgrounds |
| Card | `white` + `border-gray-200` | All cards |
| Card Border | `rounded-xl` + `shadow-sm` | Admin cards |
| Card Large | `rounded-2xl` + `shadow-xl` | Auth forms |
| Text Primary | `gray-900` | Headings |
| Text Secondary | `gray-600` | Subtitles, descriptions |
| Text Muted | `gray-500` / `gray-400` | Labels, captions |

## Status Badge Colors

| Status | Background | Text |
|---|---|---|
| AVAILABLE | `green-100` | `green-800` |
| BUSY | `amber-100` | `amber-800` |
| OFFLINE | `gray-100` | `gray-600` |
| PENDING | `amber-100` | `amber-800` |
| APPROVED | `blue-100` | `blue-800` |
| REJECTED | `red-100` | `red-800` |
| SUSPENDED | `red-100` | `red-800` |

## Reusable Components (Phase 7.5)

| Component | Path | Purpose |
|---|---|---|
| `<StatusPill>` | `components/ui/status-pill.tsx` | Availability + driver status badges |
| `<EmptyState>` | `components/ui/empty-state.tsx` | Empty content placeholder |
| `<SectionHeader>` | `components/ui/section-header.tsx` | Admin page header (title + subtitle) |

## Quick Reference

**Actual admin page pattern:**
```tsx
<div className="bg-white border-b border-gray-200">
  <div className="px-8 py-6">
    <h1 className="text-3xl font-bold text-gray-900">Page Title</h1>
    <p className="text-gray-600 mt-1">Subtitle</p>
  </div>
</div>
<div className="p-8">
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
    <div className="px-6 py-4 border-b border-gray-200">
      <h2 className="text-lg font-bold text-gray-900">Section</h2>
    </div>
    <div className="p-6">...</div>
  </div>
</div>
```

**Auth form pattern (Phase 10.5):**

All auth pages render their form inside the shared `<AuthCard>` component. The previous oversized navy gradient header has been replaced with a quiet, compact card. Inter-page links go in the `footer` slot.

```tsx
import { AuthCard } from '@/components/auth/auth-card'

<AuthCard
  title="Welcome back"
  subtitle="Sign in to manage your driver profile."
  footer={
    <>
      New to Movely?{' '}
      <Link href="/register" className="font-semibold text-[#0B1F3D] hover:underline">
        Create an account
      </Link>
    </>
  }
>
  <form action={formAction} className="space-y-4">
    {/* fields */}
  </form>
</AuthCard>
```

**Dashboard shell pattern (Phase 10.5):**

The `(dashboard)` route group has a real authenticated shell. Pages render their content directly — the shell already provides the brand, navigation, account dropdown, and footer. Never render a per-page sign-out button.

```tsx
// app/(dashboard)/something/page.tsx
export default function Page() {
  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Page title</h1>
        {/* content */}
      </div>
    </div>
  )
}
```

**Legacy auth pattern (deprecated, kept for reference):**
```tsx
<div className="bg-white rounded-2xl shadow-xl border border-gray-200">
  <div className="bg-gradient-to-br from-[#0B1F3D] to-[#001F3F] px-8 py-10 text-center">
    <h1 className="text-3xl font-bold text-white">Title</h1>
  </div>
  <div className="p-8">...</div>
</div>
```

---

**Status:** ✅ Phase 7.5 Complete  
**Next:** Phase 8 - Driver Dashboard Redesign
