# Quick Guide: Adding New Features

This is a quick reference guide for adding new features to the Hohoe LMS system. For detailed information, see the [Architecture](./ARCHITECTURE.md) and [Implementation Plan](./IMPLEMENTATION_PLAN.md) documents.

## Quick Checklist

- [ ] Plan the feature (requirements, UI/UX, data model)
- [ ] Create TypeScript types (`types/`)
- [ ] Add service methods (`lib/services/`)
- [ ] Create/update Zustand store (`lib/stores/`)
- [ ] Build UI components (`components/features/`)
- [ ] Add routes (`app/`)
- [ ] Update navigation (mobile nav or sidebar)
- [ ] Add offline support (IndexedDB, sync queue)
- [ ] Update database schema (if needed)
- [ ] Write tests
- [ ] Update documentation

## Step-by-Step Process

### 1. Define Types

```typescript
// types/your-feature.ts
export interface YourFeature {
  id: string;
  // ... other fields
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. Create Service

```typescript
// lib/services/your-feature-service.ts
import { YourFeature } from '@/types/your-feature';

class YourFeatureService {
  async getAll(): Promise<YourFeature[]> {
    // Mock implementation first
    // Then replace with Supabase
  }
  
  async create(data: Omit<YourFeature, 'id'>): Promise<YourFeature> {
    // Implementation
  }
  
  // ... other methods
}

export const yourFeatureService = new YourFeatureService();
```

### 3. Create Store

```typescript
// lib/stores/your-feature-store.ts
import { create } from 'zustand';
import { YourFeature } from '@/types/your-feature';
import { yourFeatureService } from '@/lib/services/your-feature-service';

interface YourFeatureStore {
  items: YourFeature[];
  isLoading: boolean;
  fetchAll: () => Promise<void>;
  create: (data: Omit<YourFeature, 'id'>) => Promise<void>;
  // ... other actions
}

export const useYourFeatureStore = create<YourFeatureStore>((set) => ({
  items: [],
  isLoading: false,
  fetchAll: async () => {
    set({ isLoading: true });
    const items = await yourFeatureService.getAll();
    set({ items, isLoading: false });
  },
  create: async (data) => {
    const item = await yourFeatureService.create(data);
    set((state) => ({ items: [...state.items, item] }));
  },
  // ... other actions
}));
```

### 4. Build Components

```typescript
// components/features/your-feature/YourFeatureList.tsx
'use client';

import { useYourFeatureStore } from '@/lib/stores/your-feature-store';

export function YourFeatureList() {
  const { items, fetchAll, isLoading } = useYourFeatureStore();
  
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);
  
  // ... render list
}
```

### 5. Add Routes

```typescript
// app/(admin)/your-feature/page.tsx
import { YourFeatureList } from '@/components/features/your-feature/YourFeatureList';

export default function YourFeaturePage() {
  return <YourFeatureList />;
}
```

### 6. Update Navigation

**Mobile Bottom Nav:**
```typescript
// components/layout/MobileNav.tsx
{
  icon: YourIcon,
  label: 'Your Feature',
  href: '/your-feature',
}
```

**Desktop Sidebar:**
```typescript
// components/layout/Sidebar.tsx
{
  icon: YourIcon,
  label: 'Your Feature',
  href: '/your-feature',
}
```

### 7. Add Offline Support

```typescript
// lib/services/sync-service.ts
// Add to sync queue types
export type SyncEntity = 
  | 'student' 
  | 'grade' 
  | 'attendance'
  | 'your-feature'; // Add here

// Add sync logic
async function syncYourFeature(item: SyncItem) {
  // Sync implementation
}
```

### 8. Database Schema (if needed)

```sql
-- Add table
CREATE TABLE your_feature (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- ... columns
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS
ALTER TABLE your_feature ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can view their items" ON your_feature
FOR SELECT USING (user_id = auth.uid());
```

## Common Patterns

### Form with Validation

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  // ... other fields
});

export function YourFeatureForm() {
  const form = useForm({
    resolver: zodResolver(schema),
  });
  
  // ... form implementation
}
```

### List with Search/Filter

```typescript
export function YourFeatureList() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  
  const filtered = items.filter(item => {
    // Filter logic
  });
  
  // ... render
}
```

### Offline-Aware Component

```typescript
import { useOffline } from '@/hooks/use-offline';

export function YourFeatureComponent() {
  const isOnline = useOffline();
  
  return (
    <>
      {!isOnline && (
        <OfflineBanner />
      )}
      {/* ... rest of component */}
    </>
  );
}
```

## File Structure Template

When adding a new feature, follow this structure:

```
components/features/your-feature/
├── YourFeatureList.tsx      # List view
├── YourFeatureForm.tsx       # Create/edit form
├── YourFeatureCard.tsx       # Card component
├── YourFeatureDetail.tsx     # Detail view
└── index.ts                  # Exports

lib/services/
└── your-feature-service.ts   # Service layer

lib/stores/
└── your-feature-store.ts     # State management

types/
└── your-feature.ts            # TypeScript types

app/(admin)/your-feature/     # or (teacher)
├── page.tsx                  # List page
└── [id]/
    └── page.tsx              # Detail page
```

## Testing Checklist

- [ ] Service methods work correctly
- [ ] Store actions update state properly
- [ ] Components render correctly
- [ ] Forms validate properly
- [ ] Routes are protected (if needed)
- [ ] Offline mode works
- [ ] Sync works when online
- [ ] All user roles can access (if applicable)
- [ ] Mobile layout works
- [ ] Desktop layout works

## Documentation Updates

When adding a feature, update:

1. **Project Overview** - Add to feature list
2. **Architecture** - Document new patterns (if any)
3. **Database Schema** - Add tables/columns
4. **Implementation Plan** - Add to roadmap
5. **This Guide** - Add common patterns (if reusable)

## Need Help?

- See [Architecture - Extensibility](./ARCHITECTURE.md#extensibility--adding-new-features) for detailed patterns
- See [Implementation Plan](./IMPLEMENTATION_PLAN.md#adding-new-features-post-launch) for workflow
- Check existing features for examples
- Review [Design System](./DESIGN_SYSTEM.md) for UI guidelines

---

**Remember**: Start with mock data, then integrate Supabase. Always ensure offline support!

