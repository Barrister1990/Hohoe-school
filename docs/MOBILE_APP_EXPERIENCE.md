# Mobile App Experience Specifications

## Overview

The mobile experience should feel like a native mobile application, not a responsive website. Users should be able to install the PWA and use it as if it were a native app from the app store.

## Key Mobile Experience Principles

1. **No Traditional Navigation**: No hamburger menu or sidebar on mobile
2. **Bottom Tab Navigation**: Native app-style bottom navigation
3. **Touch-Optimized**: All interactions designed for touch
4. **App-Like Animations**: Smooth, native-feeling transitions
5. **Offline-First**: Full functionality without internet
6. **Fast Loading**: Instant perceived performance

## Navigation Structure

### Bottom Tab Bar (Mobile)

**Always visible at bottom of screen**

#### Tab Items (4-5 main sections)

1. **Home/Dashboard**
   - Icon: Home
   - Label: "Home"
   - Shows: Overview, quick stats, recent activity

2. **Classes/Students** (Context-dependent)
   - For Class Teachers: "My Class"
   - For Subject Teachers: "Classes"
   - For Admin: "Classes"
   - Icon: Users or BookOpen
   - Label: Contextual

3. **Grades/Assessment**
   - Icon: ClipboardList or FileText
   - Label: "Grades"
   - Shows: Grading interface, assessments

4. **Analytics/Reports**
   - Icon: BarChart or TrendingUp
   - Label: "Analytics"
   - Shows: Charts, reports, insights

5. **Profile/Settings**
   - Icon: User or Settings
   - Label: "More"
   - Shows: Profile, settings, logout

#### Tab Bar Specifications
- **Height**: 64px (includes safe area on iOS)
- **Background**: White with subtle border-top
- **Position**: Fixed at bottom
- **Z-index**: 1000
- **Active State**: 
  - Icon: Primary blue (#2563EB)
  - Label: Primary blue, font-weight 600
- **Inactive State**:
  - Icon: Gray-400 (#9CA3AF)
  - Label: Gray-500, font-weight 400
- **Badge Support**: Red dot or number badge for notifications

### Navigation Patterns

#### Stack Navigation
- Push new screens onto stack
- Back button in header (or swipe back)
- Smooth slide transitions

#### Modal Presentation
- Full-screen modals for forms
- Bottom sheets for quick actions
- Dismissible with swipe down or backdrop tap

## Mobile UI Components

### Header Bar

**Specifications:**
- **Height**: 56px (mobile)
- **Background**: White
- **Border**: Bottom border (1px gray-200)
- **Content**: 
  - Left: Back button (if applicable) or menu icon
  - Center: Page title (truncated if long)
  - Right: Action button(s) or profile icon
- **Sticky**: Yes, scrolls with content but stays visible
- **Font size**: 18px (semibold)

### Content Area

**Specifications:**
- **Padding**: 16px horizontal, 16px top
- **Bottom padding**: 80px (to account for tab bar)
- **Background**: Gray-50 (#F9FAFB)
- **Scroll behavior**: Smooth, native-like

### Cards

**Mobile Card Specifications:**
- **Margin**: 0 16px 16px 16px
- **Padding**: 16px
- **Border radius**: 12px
- **Shadow**: Subtle elevation
- **Touch feedback**: Ripple or highlight on tap

### Lists

**Mobile List Specifications:**
- **Item height**: Minimum 64px
- **Padding**: 16px horizontal
- **Divider**: 1px gray-200 between items
- **Touch target**: Full width, minimum 44px height
- **Swipe actions**: Optional (e.g., swipe to delete)

### Forms

**Mobile Form Specifications:**
- **Input height**: 48px (prevents iOS zoom)
- **Font size**: 16px minimum
- **Spacing**: 16px between fields
- **Labels**: Above inputs (not floating)
- **Error messages**: Below inputs, red text
- **Submit button**: Full width, sticky at bottom

### Buttons

**Mobile Button Specifications:**
- **Height**: 48px minimum
- **Padding**: 12px 24px
- **Font size**: 16px
- **Border radius**: 8px
- **Full width**: Primary actions
- **Touch feedback**: Visual feedback on press

## Mobile-Specific Features

### Pull to Refresh

- **Trigger**: Pull down on scrollable lists
- **Indicator**: Native spinner or custom loader
- **Action**: Refresh data from server (when online) or local cache

### Infinite Scroll / Pagination

- **Pattern**: Load more on scroll (infinite scroll) or "Load More" button
- **Loading state**: Skeleton loaders or spinner
- **Threshold**: Load when 200px from bottom

### Search

- **Placement**: Top of relevant screens
- **Behavior**: 
  - Expandable search bar
  - Real-time filtering
  - Clear button
  - Cancel button

### Filters

- **Pattern**: Bottom sheet or inline
- **Apply button**: Sticky at bottom
- **Clear filters**: Always visible

### Empty States

- **Icon**: Large, contextual icon
- **Message**: Clear, helpful text
- **Action**: Primary CTA button
- **Illustration**: Optional, simple

### Loading States

- **Skeleton screens**: For initial load
- **Spinners**: For actions
- **Progress bars**: For long operations
- **Optimistic updates**: Show changes immediately

### Error States

- **Message**: Clear, actionable error message
- **Icon**: Error icon
- **Action**: Retry button
- **Offline indicator**: When offline

## Offline Experience

### Offline Indicator

- **Position**: Top of screen (banner or bar)
- **Color**: Amber/Warning
- **Message**: "You're offline. Changes will sync when connected."
- **Dismissible**: Yes, but reappears when action taken

### Offline Capabilities

- **View**: All previously loaded data
- **Create**: New records (stored locally)
- **Edit**: Existing records (queued for sync)
- **Delete**: Marked for deletion (queued)
- **Search**: Local data only
- **Filter**: Local data only

### Sync Status

- **Indicator**: Small icon in header or tab bar
- **States**:
  - ✅ Synced (green check)
  - ⏳ Syncing (spinner)
  - ⚠️ Pending (amber dot)
  - ❌ Error (red X)

### Conflict Resolution

- **Strategy**: Last write wins (with timestamp)
- **Notification**: Alert user of conflicts
- **Manual resolution**: Admin can review conflicts

## Touch Interactions

### Tap

- **Feedback**: Visual highlight (150ms)
- **Target size**: Minimum 44px × 44px
- **Spacing**: 8px between targets

### Long Press

- **Use cases**: Context menu, drag handle
- **Feedback**: Haptic (if available) + visual
- **Duration**: 500ms

### Swipe

- **Left swipe**: Actions (delete, archive)
- **Right swipe**: Actions (edit, view)
- **Threshold**: 50px minimum

### Pull to Refresh

- **Trigger zone**: Top 100px
- **Feedback**: Visual indicator
- **Threshold**: 60px pull distance

### Pinch to Zoom

- **Use cases**: Images, charts
- **Limits**: Min 100%, Max 300%

## Performance Targets

### Load Times

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Largest Contentful Paint**: < 2.5s

### Animations

- **Frame rate**: 60fps
- **Duration**: 200-300ms
- **Easing**: Ease-out

### Bundle Size

- **Initial load**: < 200KB (gzipped)
- **Code splitting**: Route-based
- **Lazy loading**: Images, heavy components

## PWA Features

### App Manifest

- **Name**: "Hohoe LMS"
- **Short name**: "Hohoe LMS"
- **Theme color**: Primary blue
- **Background color**: White
- **Display**: "standalone" (no browser UI)
- **Icons**: 192px, 512px (and iOS sizes)

### Service Worker

- **Caching strategy**: 
  - Static assets: Cache first
  - API data: Network first, fallback to cache
  - Images: Cache first
- **Offline page**: Custom offline page
- **Update strategy**: Background sync

### Install Prompt

- **Trigger**: After user engagement (2+ visits)
- **Design**: Custom install banner
- **Benefits**: Highlight offline capabilities

## iOS-Specific Considerations

### Safe Area

- **Bottom tab bar**: Respects safe area (home indicator)
- **Notches**: Content avoids notch area
- **Status bar**: Customizable color

### iOS Gestures

- **Swipe back**: Native iOS back gesture
- **Pull to refresh**: Native iOS style
- **Bounce scroll**: Subtle bounce effect

### iOS Safari

- **Viewport**: Proper viewport meta tag
- **Status bar**: Theme color
- **Full screen**: Standalone mode

## Android-Specific Considerations

### Material Design

- **Elevation**: Subtle shadows
- **Ripple effects**: Touch feedback
- **FAB**: Floating action button where appropriate

### Android Gestures

- **Back button**: Handle hardware back button
- **Swipe gestures**: Material Design patterns

### Chrome

- **Add to home screen**: Custom prompt
- **Theme color**: Matches app theme

## Testing Checklist

### Mobile Devices

- [ ] iPhone SE (small screen)
- [ ] iPhone 12/13/14 (standard)
- [ ] iPhone 14 Pro Max (large)
- [ ] Android phones (various sizes)
- [ ] iPad/Tablets

### Browsers

- [ ] Safari iOS
- [ ] Chrome Android
- [ ] Chrome iOS
- [ ] Firefox Mobile

### Features

- [ ] Bottom navigation works
- [ ] Touch targets adequate
- [ ] Offline mode functional
- [ ] Sync works correctly
- [ ] PWA installable
- [ ] Performance acceptable
- [ ] Animations smooth

## Accessibility on Mobile

### Screen Readers

- **Labels**: All interactive elements labeled
- **Announcements**: Important state changes
- **Navigation**: Logical tab order

### Touch Accessibility

- **Target size**: Minimum 44px
- **Spacing**: Adequate between targets
- **Feedback**: Clear visual/haptic feedback

### Font Scaling

- **Support**: System font size preferences
- **Minimum**: 12px (readable)
- **Maximum**: No hard limit (responsive layout)

