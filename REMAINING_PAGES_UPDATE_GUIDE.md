# Remaining Pages - Update Guide

## Overview
7 pages still need design system updates. This document provides a systematic approach to complete them.

## Color Mapping Reference
Use these replacements in all remaining pages:

```
OLD → NEW
bg-gray-950 → bg-surface-primary
bg-gray-900 → bg-surface-secondary  
bg-gray-800 → bg-surface-tertiary
border-gray-800 → border-surface-tertiary
border-gray-700 → border-surface-tertiary (or .5 opacity)
text-white → text-text-primary
text-gray-400 → text-text-secondary
text-gray-300 → text-text-primary or text-text-secondary (depending on context)
text-gray-500/600 → text-text-tertiary
```

## Component Mapping
```
OLD → NEW
<custom button> → .btn-primary / .btn-secondary / .btn-ghost
<custom input> → .input-base
<custom card> → .card-base / .card-elevated / .card-interactive / .card-gradient
<custom alert> → .alert-info / .alert-success / .alert-danger / .alert-warning
<custom text> → .text-headline / .text-title / .text-subtitle / .text-body / .text-caption / .text-overline
<custom badge> → .badge-primary / .badge-success / .badge-danger / .badge-warning
```

## Pages to Update (7 remaining)

### 1. src/app/(app)/digital-id/page.tsx (38 matches)
**Key Changes:**
- Card display: `from-gray-900 to-black` → `card-elevated`
- Info cards: `from-gray-900 to-black border-gray-800` → `card-base`
- Text labels: `text-gray-300/400` → `text-caption` or `text-text-tertiary`
- Metadata section: `bg-gray-950 border-gray-800` → `card-base`

**Critical Areas:**
- Digital ID card display (lines 160-190)
- Info cards section (lines 215-260)
- Bottom metadata section (lines 286-290)

### 2. src/app/(app)/notifications/page.tsx (18 matches)
**Key Changes:**
- Notification list: `bg-gradient-to-br from-gray-900` → `card-interactive`
- Unread items: `border-gray-700` → `border-surface-tertiary`
- Read items: `opacity-60` keep but update colors
- Empty state: `bg-gray-900` → `card-base`

### 3. src/app/(app)/profile/page.tsx (13 matches)
**Key Changes:**
- Form container: `from-gray-900 to-black border-gray-800` → `card-elevated`
- Divider lines: `border-gray-800` → `border-surface-tertiary`
- Section labels: `text-gray-400` → `label-base` or `text-text-secondary`

### 4. src/app/(app)/settings/page.tsx (11 matches)
**Key Changes:**
- Setting items: `from-gray-900 to-black border-gray-800` → `card-interactive`
- Description text: `text-gray-400` → `text-text-secondary`
- Privacy section: `bg-gray-950 border-gray-800` → `card-base`

### 5. src/app/(app)/analytics/page.tsx (24 matches)
**Key Changes:**
- Chart containers: `from-gray-900 to-black border-gray-800` → `card-elevated`
- Data cards: `text-gray-300` → `text-text-primary`
- Labels: `text-gray-400` → `text-text-secondary`
- Stat cards: Create inline `.card-base` or use existing StatCard component from dashboard

### 6. src/app/(app)/report/page.tsx (13 matches)
**Key Changes:**
- Form: `from-gray-900 to-black border-gray-800` → `card-elevated`
- Report list: `bg-gray-950` → `card-base`
- Report items: `bg-gray-900` → `card-interactive` or `card-base`
- Labels: `text-gray-400` → `text-text-secondary`

### 7. src/app/(app)/check-in/page.tsx (27 matches)
**Key Changes:**
- Map container: `bg-gray-950 border-gray-800` → `card-elevated`
- Form section: `bg-gray-900 border-gray-800` → `card-base`
- Location cards: `bg-gray-900 border-gray-800` → `card-interactive`
- Status badges: Keep but update colors with `.badge-*`
- Info sections: `bg-gray-950` → `card-base`

## Implementation Order (by priority/impact)

1. **digital-id** - User-facing, high visibility
2. **check-in** - Frequently used feature
3. **report** - Critical feature for safety
4. **analytics** - Informational/stats
5. **notifications** - Less critical but important
6. **profile** - User account management
7. **settings** - Configuration/preferences

## Build Verification After Each Page
```bash
npm run build
```

## Commit Template for Each Page
```
feat: update [page-name] with professional design system

- Replaced bg-gray-* colors with surface-* tokens
- Updated text colors with text-primary/secondary/tertiary
- Replaced custom cards with .card-* utilities
- Updated buttons with .btn-* utilities
- Added professional spacing and animations

Build verified successfully - all 13 routes compile.
```

## Estimated Effort
- Per page: 10-15 minutes (with build verification)
- Total remaining: 70-105 minutes (~2-2.5 hours)
- Total project: ~4-5 hours for complete professional UI upgrade

## Quality Checklist
For each page, verify:
- [ ] All gray colors replaced with new tokens
- [ ] All text colors updated appropriately
- [ ] Buttons use .btn-* classes
- [ ] Cards use .card-* classes
- [ ] Inputs use .input-base class
- [ ] Forms have proper spacing
- [ ] Hover states are professional
- [ ] Accessibility is maintained (focus states)
- [ ] Build succeeds without errors
- [ ] No hardcoded colors remain

## Success Criteria
✅ All 7 pages updated with design system
✅ All 13 routes compile successfully
✅ Responsive design works on mobile
✅ All commits pushed to main
✅ Vercel deployment successful
✅ Professional appearance matching Samsung/Apple standards

---
**Status**: Ready for implementation
**Estimated Completion**: 2-2.5 hours for all 7 pages
