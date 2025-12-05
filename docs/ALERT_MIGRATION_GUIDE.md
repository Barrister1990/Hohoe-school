# Alert Migration Guide

This guide explains how to replace native `alert()` calls with the new universal Alert component.

## Overview

The app now uses a custom Alert system built on Shadcn UI's Alert Dialog component. This provides:
- Better UX with styled dialogs
- Consistent design across the app
- Support for different alert types (success, error, warning, info)
- Customizable buttons and callbacks

## Usage

### Basic Usage

1. **Import the hook:**
```typescript
import { useAlert } from '@/components/shared/AlertProvider';
```

2. **Get the alert functions:**
```typescript
const { showSuccess, showError, showWarning, showInfo, showAlert } = useAlert();
```

3. **Replace `alert()` calls:**

**Before:**
```typescript
alert('Student added successfully!');
alert(error.message || 'Failed to add student. Please try again.');
```

**After:**
```typescript
showSuccess('Student added successfully!');
showError(error.message || 'Failed to add student. Please try again.');
```

### Available Methods

- `showSuccess(message, title?)` - Green success alert
- `showError(message, title?)` - Red error alert
- `showWarning(message, title?)` - Amber warning alert
- `showInfo(message, title?)` - Blue info alert
- `showAlert(options)` - Advanced alert with custom options

### Advanced Usage

For alerts with custom buttons or callbacks:

```typescript
showAlert({
  title: 'Confirm Action',
  message: 'Are you sure you want to delete this student?',
  type: 'warning',
  confirmText: 'Delete',
  cancelText: 'Cancel',
  showCancel: true,
  onConfirm: () => {
    // Handle confirmation
  },
  onCancel: () => {
    // Handle cancellation
  },
});
```

## Migration Pattern

### Pattern 1: Simple Success/Error Messages

**Before:**
```typescript
try {
  // ... operation
  alert('Operation successful!');
} catch (error: any) {
  alert(error.message || 'Operation failed.');
}
```

**After:**
```typescript
const { showSuccess, showError } = useAlert();

try {
  // ... operation
  showSuccess('Operation successful!');
} catch (error: any) {
  showError(error.message || 'Operation failed.');
}
```

### Pattern 2: Error Messages Only

**Before:**
```typescript
if (error) {
  alert(error.message || 'Failed to load data. Please try again.');
}
```

**After:**
```typescript
const { showError } = useAlert();

if (error) {
  showError(error.message || 'Failed to load data. Please try again.');
}
```

### Pattern 3: Info/Warning Messages

**Before:**
```typescript
alert('Please allow pop-ups to generate the report card.');
alert('This feature will be implemented soon.');
```

**After:**
```typescript
const { showInfo, showWarning } = useAlert();

showInfo('Please allow pop-ups to generate the report card.');
showWarning('This feature will be implemented soon.');
```

## Files to Update

The following files contain `alert()` calls that should be migrated:

### Admin Pages
- `app/admin/students/**/*.tsx` (multiple files)
- `app/admin/teachers/**/*.tsx` (multiple files)
- `app/admin/classes/**/*.tsx` (multiple files)
- `app/admin/academics/**/*.tsx` (multiple files)
- `app/admin/reports/**/*.tsx` (multiple files)
- `app/admin/settings/**/*.tsx` (multiple files)
- `app/admin/analytics/**/*.tsx`
- `app/admin/graduated/**/*.tsx`

### Teacher Pages
- `app/teacher/students/**/*.tsx` (multiple files)
- `app/teacher/grades/**/*.tsx` (multiple files)
- `app/teacher/my-class/**/*.tsx` (multiple files)
- `app/teacher/analytics/**/*.tsx`

### Components
- `components/reports/**/*.tsx` (multiple files)

## Quick Migration Steps

1. Add import: `import { useAlert } from '@/components/shared/AlertProvider';`
2. Add hook: `const { showSuccess, showError, showWarning, showInfo } = useAlert();`
3. Replace `alert()` calls:
   - Success messages → `showSuccess()`
   - Error messages → `showError()`
   - Warning messages → `showWarning()`
   - Info messages → `showInfo()`

## Example: Complete File Migration

**Before:**
```typescript
'use client';

export default function MyPage() {
  const handleSubmit = async () => {
    try {
      // ... operation
      alert('Success!');
    } catch (error: any) {
      alert(error.message);
    }
  };
}
```

**After:**
```typescript
'use client';

import { useAlert } from '@/components/shared/AlertProvider';

export default function MyPage() {
  const { showSuccess, showError } = useAlert();

  const handleSubmit = async () => {
    try {
      // ... operation
      showSuccess('Success!');
    } catch (error: any) {
      showError(error.message);
    }
  };
}
```

## Notes

- The AlertProvider is already added to the root layout, so you can use `useAlert()` in any component
- Alerts are automatically styled based on type (success=green, error=red, warning=amber, info=blue)
- Alerts are non-blocking and can be dismissed by clicking OK
- For confirmation dialogs, use `showAlert()` with `showCancel: true`

