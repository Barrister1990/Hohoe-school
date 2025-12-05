# UI Design Reference & Mockups

## Design Philosophy

**Clean, Modern, Functional** - A design that prioritizes clarity and usability over visual flair. Minimal gradients, clear typography, and intuitive navigation that feels native on mobile devices.

## Visual Style

### Color Usage

#### Primary Actions
- **Buttons**: Solid blue (#2563EB) background, white text
- **Links**: Blue text (#2563EB), underline on hover
- **Active States**: Darker blue (#1E40AF)

#### Backgrounds
- **Main Background**: White (#FFFFFF)
- **Card Background**: White (#FFFFFF)
- **Section Background**: Light gray (#F9FAFB)
- **Hover States**: Very light gray (#F3F4F6)

#### Text Hierarchy
- **Primary Text**: Dark gray (#111827) - Headings, important content
- **Secondary Text**: Medium gray (#4B5563) - Body text
- **Muted Text**: Light gray (#9CA3AF) - Labels, hints

#### Status Colors
- **Success**: Green (#10B981) - Success messages, positive indicators
- **Warning**: Amber (#F59E0B) - Warnings, attention needed
- **Error**: Red (#EF4444) - Errors, critical actions
- **Info**: Blue (#3B82F6) - Information, tips

### Typography Scale

#### Mobile
- **Page Title**: 28px, Semibold (600)
- **Section Header**: 24px, Semibold (600)
- **Card Title**: 18px, Medium (500)
- **Body Text**: 16px, Regular (400)
- **Small Text**: 14px, Regular (400)
- **Labels**: 12px, Medium (500)

#### Desktop
- **Page Title**: 36px, Semibold (600)
- **Section Header**: 32px, Semibold (600)
- **Card Title**: 20px, Medium (500)
- **Body Text**: 16px, Regular (400)
- **Small Text**: 14px, Regular (400)
- **Labels**: 12px, Medium (500)

## Layout Patterns

### Mobile Layout

#### Dashboard Screen
```
┌─────────────────────────────┐
│  [←] Dashboard        [⚙️]  │ ← Header (56px)
├─────────────────────────────┤
│                             │
│  ┌───────────────────────┐  │
│  │  📊 Statistics Card   │  │
│  │  Total Students: 450  │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │  📈 Quick Stats       │  │
│  │  [Card Grid]          │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │  📋 Recent Activity   │  │
│  │  [Activity List]      │  │
│  └───────────────────────┘  │
│                             │
│                             │
│                             │
├─────────────────────────────┤
│ [🏠] [👥] [📝] [📊] [⚙️]  │ ← Bottom Nav (64px)
└─────────────────────────────┘
```

#### List Screen (Students/Classes)
```
┌─────────────────────────────┐
│  [←] Students          [🔍]  │ ← Header
├─────────────────────────────┤
│  [All] [P1] [P2] [P3] ...   │ ← Filter Tabs
├─────────────────────────────┤
│  ┌───────────────────────┐  │
│  │  👤 John Doe          │  │
│  │  P1A • ID: ST001      │  │ ← List Item
│  │  ───────────────────   │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │  👤 Jane Smith        │  │
│  │  P1A • ID: ST002      │  │
│  │  ───────────────────   │  │
│  └───────────────────────┘  │
│                             │
│                             │
├─────────────────────────────┤
│ [🏠] [👥] [📝] [📊] [⚙️]  │
└─────────────────────────────┘
```

#### Form Screen
```
┌─────────────────────────────┐
│  [←] Add Student            │ ← Header
├─────────────────────────────┤
│                             │
│  First Name *               │
│  ┌───────────────────────┐  │
│  │                       │  │ ← Input Field
│  └───────────────────────┘  │
│                             │
│  Last Name *                │
│  ┌───────────────────────┐  │
│  │                       │  │
│  └───────────────────────┘  │
│                             │
│  Class *                    │
│  ┌───────────────────────┐  │
│  │  Select Class    [▼]  │  │ ← Select
│  └───────────────────────┘  │
│                             │
│                             │
│                             │
│  ┌───────────────────────┐  │
│  │    Save Student       │  │ ← Sticky Button
│  └───────────────────────┘  │
│                             │
├─────────────────────────────┤
│ [🏠] [👥] [📝] [📊] [⚙️]  │
└─────────────────────────────┘
```

### Desktop Layout

#### Dashboard with Sidebar
```
┌──────┬──────────────────────────────────────┐
│      │  Dashboard                    [⚙️]  │
│ Side │  ─────────────────────────────────  │
│ bar  │                                      │
│ (240)│  ┌──────────┐  ┌──────────┐        │
│      │  │  Stats   │  │  Stats   │        │
│ [🏠] │  │  Card    │  │  Card    │        │
│ [👥] │  └──────────┘  └──────────┘        │
│ [📝] │                                      │
│ [📊] │  ┌──────────────────────────┐      │
│ [⚙️] │  │    Chart/Graph           │      │
│      │  │                          │      │
│      │  └──────────────────────────┘      │
│      │                                      │
└──────┴──────────────────────────────────────┘
```

## Component Specifications

### Buttons

#### Primary Button
```
┌─────────────────────┐
│   Save Changes      │  Height: 48px
└─────────────────────┘  Padding: 12px 24px
                         Border Radius: 8px
                         Font: 16px, Medium
                         Background: #2563EB
                         Text: White
```

#### Secondary Button
```
┌─────────────────────┐
│   Cancel            │  Height: 48px
└─────────────────────┘  Padding: 12px 24px
                         Border: 1px #E5E7EB
                         Background: Transparent
                         Text: #2563EB
```

#### Icon Button
```
┌──┐
│⚙️│  40px × 40px (mobile)
└──┘  44px × 44px (desktop)
      Icon: 20px (mobile), 24px (desktop)
```

### Cards

#### Standard Card
```
┌─────────────────────────────┐
│  Card Title                 │  Padding: 16px (mobile)
│  ───────────────────────    │  20px (desktop)
│                             │  Border Radius: 12px
│  Card content goes here.    │  Border: 1px #E5E7EB
│  Multiple lines of text.    │  Shadow: Subtle
│                             │
└─────────────────────────────┘
```

#### Stat Card
```
┌─────────────────────────────┐
│  📊 Total Students          │
│                             │
│       450                   │  Large number: 32px
│                             │  Bold
│  +12% from last term        │  Small text: 14px
│                             │  Muted
└─────────────────────────────┘
```

### Input Fields

#### Text Input
```
┌─────────────────────────────┐
│  Label                      │  Label: 12px, Medium
│  ┌─────────────────────────┐│  Input: 48px height
│  │  Placeholder text       ││  16px font (prevents zoom)
│  └─────────────────────────┘│  Border: 1px #D1D5DB
│                             │  Focus: 2px #2563EB
└─────────────────────────────┘
```

#### Select Dropdown
```
┌─────────────────────────────┐
│  Select Class               │
│  ┌─────────────────────────┐│
│  │  Primary 1A        [▼]  ││
│  └─────────────────────────┘│
└─────────────────────────────┘
```

### Navigation

#### Mobile Bottom Nav
```
┌─────────────────────────────────┐
│  [🏠]  [👥]  [📝]  [📊]  [⚙️]  │  Height: 64px
│  Home  Class Grade  Data  More  │  Icon: 24px
│                                 │  Label: 12px
│  Active: Blue (#2563EB)         │  Inactive: Gray (#9CA3AF)
│  Inactive: Gray (#9CA3AF)       │
└─────────────────────────────────┘
```

#### Desktop Sidebar
```
┌──────────────┐
│  🏠 Home     │  Width: 240px
│  ──────────  │  Item Height: 44px
│  👥 Classes  │  Padding: 12px 16px
│  📝 Grades   │  Font: 14px
│  📊 Analytics│  Icon: 20px
│  ⚙️ Settings │  Hover: #F3F4F6
│              │  Active: #EFF6FF
└──────────────┘
```

## Screen Mockups

### Login Screen

**Mobile:**
- Centered form
- Logo at top
- Email and password inputs
- "Remember me" checkbox
- Full-width login button
- "Forgot password?" link

**Desktop:**
- Centered card (max-width: 400px)
- Same elements, better spacing

### Dashboard Screen

**Admin Dashboard:**
- Header: "Dashboard" + Settings icon
- Quick stats row (4 cards):
  - Total Students
  - Total Teachers
  - Active Classes
  - Pending Tasks
- Chart section: Enrollment trends
- Recent activity feed
- Quick actions: Add Student, Add Teacher, etc.

**Teacher Dashboard:**
- Header: "My Dashboard"
- Assigned class card (if class teacher)
- Assigned subjects list (if subject teacher)
- Pending grading tasks
- Recent activity

### Student List Screen

- Header: "Students" + Search icon + Add button
- Filter tabs: All, P1, P2, P3, P4, P5, P6
- Search bar (expandable)
- Student cards:
  - Photo (or placeholder)
  - Name
  - Student ID
  - Class
  - Status indicator
- Pull to refresh
- Infinite scroll or pagination

### Grade Entry Screen

- Header: "Enter Grades" + Assessment name
- Class and subject selector
- Student list with grade inputs:
  ```
  ┌─────────────────────────────┐
  │  John Doe          [____]  │  Score input
  │  Max: 100           / 100   │
  └─────────────────────────────┘
  ```
- Bulk actions: "Fill all", "Clear all"
- Save button (sticky at bottom on mobile)

### Analytics Screen

- Header: "Analytics" + Date range selector
- Filter chips: Class, Subject, Term
- Chart section:
  - Line chart: Performance over time
  - Bar chart: Class comparison
  - Pie chart: Grade distribution
- Summary cards: Averages, totals
- Export button

## Interaction Patterns

### Loading States

**Skeleton Loaders:**
```
┌─────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░░░░░░░  │  Animated shimmer
│  ░░░░░░░░░░░░░░░░░░░░░░░░  │
│  ░░░░░░░░░░░░░░░░░░░░░░░░  │
└─────────────────────────────┘
```

**Spinners:**
- Circular spinner for actions
- Size: 24px (mobile), 32px (desktop)
- Color: Primary blue

### Empty States

```
┌─────────────────────────────┐
│                             │
│          📭                 │  Large icon (64px)
│                             │
│    No students yet          │  Heading: 18px
│                             │
│  Add your first student to  │  Body: 14px, muted
│  get started.               │
│                             │
│  ┌───────────────────────┐  │
│  │   Add Student        │  │  CTA Button
│  └───────────────────────┘  │
│                             │
└─────────────────────────────┘
```

### Error States

```
┌─────────────────────────────┐
│          ⚠️                  │
│                             │
│    Something went wrong     │
│                             │
│  We couldn't load the data. │
│  Please try again.          │
│                             │
│  ┌───────────────────────┐  │
│  │      Try Again       │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

### Success States

- Toast notification (bottom on mobile, top-right on desktop)
- Green checkmark icon
- Message: "Student added successfully"
- Auto-dismiss after 3 seconds

## Animations

### Page Transitions
- **Duration**: 200-300ms
- **Easing**: Ease-out
- **Type**: Fade + slight slide

### Button Press
- **Scale**: 0.98 (slight shrink)
- **Duration**: 100ms
- **Feedback**: Immediate visual response

### Card Hover (Desktop)
- **Elevation**: Slight shadow increase
- **Duration**: 150ms
- **Transform**: Slight lift (translateY -2px)

### List Item Tap
- **Background**: Brief highlight
- **Duration**: 200ms
- **Color**: Light gray (#F3F4F6)

## Responsive Breakpoints

- **Mobile**: < 768px (default)
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Layout Changes by Breakpoint

**Mobile (< 768px):**
- Bottom navigation
- Single column layout
- Full-width cards
- Stacked forms

**Tablet (768px - 1024px):**
- Bottom navigation (or sidebar option)
- 2-column grid for cards
- Side-by-side form fields where appropriate

**Desktop (> 1024px):**
- Sidebar navigation
- Multi-column layouts
- Hover states
- More spacing

## Accessibility Considerations

### Color Contrast
- All text meets WCAG AA (4.5:1)
- Interactive elements clearly visible
- Focus indicators: 2px blue outline

### Touch Targets
- Minimum 44px × 44px
- Adequate spacing (8px minimum)
- Clear visual feedback

### Screen Readers
- Semantic HTML
- ARIA labels where needed
- Alt text for images
- Proper heading hierarchy

## Design Assets

### Icons
- **Library**: Lucide React
- **Size**: 20px (mobile), 24px (desktop)
- **Stroke**: 2px
- **Style**: Outline (not filled)

### Images
- **Student Photos**: 64px × 64px (circular)
- **Teacher Avatars**: 40px × 40px (circular)
- **Placeholders**: Simple illustrations or initials

### Spacing
- **Card Padding**: 16px (mobile), 20px (desktop)
- **Section Spacing**: 24px (mobile), 32px (desktop)
- **Element Spacing**: 16px standard

## Implementation Notes

### Shadcn UI Components
- Use Shadcn components as base
- Customize with Tailwind classes
- Maintain consistency with design system

### Tailwind Classes
- Use design tokens from config
- Prefer utility classes
- Custom components for repeated patterns

### Mobile Optimization
- Font size: 16px minimum (prevents iOS zoom)
- Touch targets: 44px minimum
- Bottom navigation: Always visible
- Sticky buttons: Important actions at bottom

---

This design reference should be used alongside the [Design System](./DESIGN_SYSTEM.md) documentation for complete UI/UX guidelines.

