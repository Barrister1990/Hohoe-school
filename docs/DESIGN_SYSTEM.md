# Design System & UI Guidelines

## Design Philosophy

**Modern, Clean, Functional** - A design system that prioritizes usability and clarity over flashy aesthetics. Minimal use of gradients, focusing on solid colors, clear typography, and intuitive navigation.

## Color Palette

### Primary Colors
- **Primary**: Blue (#2563EB) - Actions, links, primary buttons
- **Primary Dark**: Blue (#1E40AF) - Hover states, active states
- **Primary Light**: Blue (#3B82F6) - Subtle highlights

### Neutral Colors
- **Background**: White (#FFFFFF) - Main background
- **Surface**: Gray-50 (#F9FAFB) - Card backgrounds, sections
- **Border**: Gray-200 (#E5E7EB) - Dividers, borders
- **Text Primary**: Gray-900 (#111827) - Main text
- **Text Secondary**: Gray-600 (#4B5563) - Secondary text
- **Text Muted**: Gray-400 (#9CA3AF) - Placeholder, disabled text

### Semantic Colors
- **Success**: Green (#10B981) - Success messages, positive indicators
- **Warning**: Amber (#F59E0B) - Warnings, attention needed
- **Error**: Red (#EF4444) - Errors, critical actions
- **Info**: Blue (#3B82F6) - Information, tips

### Usage Rules
- **No gradients** unless absolutely necessary (e.g., subtle card shadows)
- Use solid colors for buttons and backgrounds
- Maintain high contrast for accessibility
- Dark mode support (future consideration)

## Typography

### Font Family
- **Primary**: System fonts (San Francisco on iOS, Segoe UI on Windows, Roboto on Android)
- **Fallback**: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif

### Font Sizes (Mobile-First)

#### Mobile (< 768px)
- **Display**: 28px (2rem) - Page titles
- **H1**: 24px (1.5rem) - Section headers
- **H2**: 20px (1.25rem) - Subsection headers
- **H3**: 18px (1.125rem) - Card titles
- **Body**: 16px (1rem) - Main content
- **Small**: 14px (0.875rem) - Secondary text
- **XSmall**: 12px (0.75rem) - Labels, captions

#### Tablet (768px - 1024px)
- **Display**: 32px (2rem)
- **H1**: 28px (1.75rem)
- **H2**: 24px (1.5rem)
- **H3**: 20px (1.25rem)
- **Body**: 16px (1rem)
- **Small**: 14px (0.875rem)
- **XSmall**: 12px (0.75rem)

#### Desktop (> 1024px)
- **Display**: 36px (2.25rem)
- **H1**: 32px (2rem)
- **H2**: 28px (1.75rem)
- **H3**: 24px (1.5rem)
- **Body**: 16px (1rem)
- **Small**: 14px (0.875rem)
- **XSmall**: 12px (0.75rem)

### Font Weights
- **Light**: 300
- **Regular**: 400 (default)
- **Medium**: 500 (emphasis)
- **Semibold**: 600 (headings)
- **Bold**: 700 (strong emphasis)

### Line Heights
- **Tight**: 1.25 (headings)
- **Normal**: 1.5 (body text)
- **Relaxed**: 1.75 (long-form content)

## Spacing System

Based on 4px grid system:
- **xs**: 4px (0.25rem)
- **sm**: 8px (0.5rem)
- **md**: 16px (1rem)
- **lg**: 24px (1.5rem)
- **xl**: 32px (2rem)
- **2xl**: 48px (3rem)
- **3xl**: 64px (4rem)

## Component Guidelines

### Buttons

#### Primary Button
- Background: Primary blue
- Text: White
- Padding: 12px 24px (mobile), 14px 28px (desktop)
- Border radius: 8px
- Font size: 16px (mobile), 16px (desktop)
- Font weight: 500

#### Secondary Button
- Background: Transparent
- Border: 1px solid gray-300
- Text: Primary blue
- Same padding and radius as primary

#### Icon Button
- Square: 40px × 40px (mobile), 44px × 44px (desktop)
- Icon size: 20px (mobile), 24px (desktop)

### Cards
- Background: White
- Border: 1px solid gray-200
- Border radius: 12px
- Padding: 16px (mobile), 20px (desktop)
- Shadow: Subtle (0 1px 3px rgba(0,0,0,0.1))

### Input Fields
- Height: 44px (mobile), 48px (desktop)
- Border: 1px solid gray-300
- Border radius: 8px
- Padding: 12px 16px
- Font size: 16px (prevents zoom on iOS)
- Focus: 2px solid primary blue outline

### Navigation (Mobile)
- Bottom navigation bar (not sidebar)
- Height: 64px
- Icon size: 24px
- Label font size: 12px
- Active state: Primary blue
- Inactive state: Gray-400

### Navigation (Desktop)
- Sidebar navigation
- Width: 240px (collapsed: 64px)
- Font size: 14px
- Icon size: 20px
- Hover: Gray-100 background

## Mobile App Experience

### Touch Targets
- Minimum: 44px × 44px (iOS standard)
- Recommended: 48px × 48px
- Spacing between targets: 8px minimum

### Gestures
- Swipe to navigate (where applicable)
- Pull to refresh
- Long press for context menus
- Native-like animations

### Mobile-Specific UI Patterns

#### Bottom Sheet
- Slides up from bottom
- Rounded top corners (16px)
- Max height: 90vh
- Backdrop blur

#### Floating Action Button (FAB)
- Position: Bottom right
- Size: 56px × 56px
- Shadow: Elevated (0 4px 12px rgba(0,0,0,0.15))
- Icon size: 24px

#### Mobile Navigation
- Bottom tab bar (always visible)
- 4-5 main navigation items
- Badge indicators for notifications
- Active state clearly visible

## Responsive Breakpoints

```css
/* Mobile First Approach */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Small desktops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large desktops */
```

## Animation Guidelines

### Principles
- Subtle and purposeful
- Fast (200-300ms for most interactions)
- Ease-out timing function
- No excessive animations

### Common Animations
- **Fade in**: 200ms ease-out
- **Slide**: 300ms ease-out
- **Scale**: 200ms ease-out
- **Hover**: 150ms ease-out

### Reduced Motion
- Respect `prefers-reduced-motion`
- Provide static alternatives

## Accessibility

### WCAG 2.1 AA Compliance
- Color contrast ratio: 4.5:1 (text), 3:1 (UI components)
- Keyboard navigation support
- Screen reader compatibility
- Focus indicators visible
- Alt text for images
- ARIA labels where needed

### Touch Accessibility
- Large touch targets
- Clear visual feedback
- Error prevention
- Clear error messages

## Icon System

- **Library**: Lucide React
- **Size**: 20px (mobile), 24px (desktop)
- **Stroke width**: 2px
- **Color**: Inherit from parent (gray-600 default)

## Layout Patterns

### Mobile Layout
- Single column
- Full-width cards
- Bottom navigation
- Stacked content

### Desktop Layout
- Sidebar + main content
- Multi-column grids
- Hover states
- Keyboard shortcuts

## Design Tokens

All design tokens should be defined in Tailwind config:
- Colors
- Spacing
- Typography scales
- Border radius
- Shadows
- Transitions

