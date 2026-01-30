# FilterDropdown Component

Component filter dropdown tùy chỉnh với 5 loại chính: search, filter, groupBy, sort và favorites.

## Tính năng

- **Search**: Tìm kiếm với nhiều trường, hỗ trợ các operator như `~` (contains), `^` (starts with), `$` (ends with)
- **Filter**: Lọc dữ liệu với nhiều loại: select, multiselect, date, daterange, boolean, number, custom
- **GroupBy**: Nhóm dữ liệu theo các trường
- **Sort**: Sắp xếp dữ liệu theo nhiều trường với asc/desc
- **Favorites**: Lưu và tải các bộ lọc đã lưu

## Cấu trúc dữ liệu

### SearchGraph Format (Backend API)

```typescript
{
  "if": ["field", "operator", "value"],
  "and": SearchNode[],
  "or": SearchNode[],
  "order": SearchOrder[],
  "groupBy": string[]
}
```

Ví dụ:
```json
{
  "or": [
    { "if": ["display_name", "^", "Nikki"] },
    { "if": ["display_name", "$", "ERP"] }
  ],
  "order": [
    { "field": "createdAt", "direction": "asc" }
  ],
  "groupBy": ["name", "status"]
}
```

## Cách sử dụng

### 1. Tạo Filter Config

```typescript
import { FilterDropdownConfig } from '@/components/FilterDropdown';

const myFilterConfig: FilterDropdownConfig = {
  search: [
    {
      key: 'code',
      label: 'Mã',
      placeholder: 'Tìm kiếm theo mã...',
      operator: '~', // ~ = contains, ^ = starts with, $ = ends with
    },
  ],
  filter: [
    {
      key: 'status',
      label: 'Trạng thái',
      type: 'select',
      options: [
        { value: 'active', label: 'Hoạt động' },
        { value: 'inactive', label: 'Không hoạt động' },
      ],
      operator: '=',
    },
  ],
  groupBy: [
    { key: 'status', label: 'Trạng thái' },
  ],
  sort: [
    { key: 'createdAt', label: 'Ngày tạo', defaultDirection: 'desc' },
  ],
  favorites: {
    onSave: (name, graph) => {
      // Lưu vào localStorage hoặc backend
      localStorage.setItem(`filter_${name}`, JSON.stringify(graph));
    },
    onLoad: (name) => {
      // Tải từ localStorage hoặc backend
      const saved = localStorage.getItem(`filter_${name}`);
      return saved ? JSON.parse(saved) : null;
    },
    onDelete: (name) => {
      // Xóa từ localStorage hoặc backend
      localStorage.removeItem(`filter_${name}`);
    },
    savedFilters: [], // Danh sách filters đã lưu
  },
};
```

### 2. Sử dụng với useFilterState hook

```typescript
import { FilterDropdown, SearchInputWithTags, useFilterState } from '@/components/FilterDropdown';

function MyComponent() {
  const { state, updateState, resetState, searchGraph } = useFilterState({
    onSearchGraphChange: (graph) => {
      // Gửi graph xuống backend
      console.log('SearchGraph:', graph);
    },
  });

  // Generate tags từ state
  const tags = useMemo(() => {
    // ... logic để tạo tags từ state
  }, [state]);

  return (
    <>
      <SearchInputWithTags
        tags={tags}
        onTagRemove={(tag) => tag.onRemove()}
        onSearchChange={(value) => {
          // Handle search change
        }}
        searchValue={currentSearchValue}
        placeholder="Tìm kiếm..."
      />
      <FilterDropdown
        config={myFilterConfig}
        state={state}
        onStateChange={updateState}
        onSearchGraphChange={(graph) => {
          // Gửi graph xuống backend
        }}
      />
    </>
  );
}
```

### 3. Sử dụng component có sẵn (KioskListActionsWithFilter)

```typescript
import { KioskListActionsWithFilter } from '@/features/kiosks';

function KioskListPage() {
  const handleSearchGraphChange = (graph: any) => {
    // Gửi graph xuống backend API
    kioskService.listKiosks(graph);
  };

  return (
    <KioskListActionsWithFilter
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      onCreate={handleCreate}
      onRefresh={handleRefresh}
      onSearchGraphChange={handleSearchGraphChange}
    />
  );
}
```

## Tags trên Search Input

Khi filter/search thay đổi, các tags sẽ xuất hiện trên ô search:
- `filter: value1 or value2` - cho filter với nhiều giá trị
- `searchKey1: value1` - cho search field

## Operators hỗ trợ

- `^` - Starts with
- `$` - Ends with
- `=` - Equals
- `!=` - Not equals
- `>` - Greater than
- `<` - Less than
- `>=` - Greater than or equal
- `<=` - Less than or equal
- `~` - Contains (default cho search)
- `!~` - Not contains
