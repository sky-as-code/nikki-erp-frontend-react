# Kiến trúc chung của một module trong `modules/`

Trong `modules/` có **hai loại**: **Shell** (1 cái) và **Micro-app** (nhiều cái). Kiến trúc mỗi loại khác nhau.

---

## Hai loại module

| Loại | Ví dụ | Vai trò |
|------|--------|--------|
| **Shell** | `modules/shell` | App bao ngoài: layout, route Shell, mount micro-app qua `LazyModule`. Không phải micro-app, không có bundle `init`. |
| **Micro-app** | `identity`, `essential`, `authorize`, `vendingMachine` | App con: export bundle có `init`, đăng ký reducer, định nghĩa web component, có routing nội bộ. |

---

## Kiến trúc chung của một Micro-app

Một micro-app thường có cấu trúc sau (thư mục tùy quy mô, có thể bớt hoặc thêm).

```
modules/<tên-module>/
├── package.json                 # name: @nikkierp/microapp-<tên>
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── index.tsx                 # ★ Entry: export default MicroAppBundle + component Main
    ├── appState/                 # Redux: reducer (1 slice hoặc combineReducers) cho state của module
    │   ├── index.ts              # export reducer (+ actions/selectors)
    │   └── ...Slice.ts           # (hoặc từng file slice rồi combine)
    ├── routes/                   # (tùy chọn) Route config — có thể inline trong index.tsx
    ├── pages/                    # Mỗi route → một (vài) page component
    ├── features/                 # (tùy chọn) Domain: slice, hooks, components — dùng khi module lớn
    ├── hooks/                    # Hook dùng chung: menu bar, permissions, ...
    └── components/               # (tùy chọn) Component dùng chung
```

### 1. `src/index.tsx` — Entry

- Export **default** một object **MicroAppBundle**:
  - Hàm **init**(opts): gọi `defineWebComponent(Main, { htmlTag, domType })`, `registerReducer(reducer)`, `initMicroAppStateContext(result)`, return `{ domType }`.
- Component **Main**(props: MicroAppProps):
  - Bọc: `MicroAppProvider` → (theme nếu cần) → **MicroAppRouter** (domType, basePath, widgetName, widgetProps).
  - Bên trong Router: **AppRoutes** + các **AppRoute** (path, element); nếu có widget thì thêm **WidgetRoutes** + **WidgetRoute**.

Luồng: Shell load bundle → gọi `init` → đăng ký reducer + web component → khi mount thì render Main với props (api, routing, config).

### 2. `appState/`

- Export **một** `reducer` (một slice hoặc `combineReducers` của nhiều slice).
- Trong `init()` micro-app gọi `registerReducer(reducer)` → Shell inject reducer vào store với key = slug của module.
- Có thể export thêm actions, selectors để dùng trong module (dùng `useMicroAppDispatch`, `useMicroAppSelector` từ `@nikkierp/ui/microApp`).

### 3. Routes

- **App mode:** Trong Main dùng `<AppRoutes>` và các `<AppRoute path="..." element={...} />` (từ `@nikkierp/ui/microApp`). Có thể viết inline trong `index.tsx` hoặc tách ra file (vd. `routes/index.tsx` export các element).
- **Widget mode (nếu cần):** Thêm `<WidgetRoutes>` và `<WidgetRoute name="..." Component={...} />`.

### 4. `pages/`

- Mỗi màn hình tương ứng route thường là một (hoặc vài) component trong `pages/`. Có thể nhóm theo domain: `pages/user/`, `pages/group/`, ...

### 5. `features/` (khi module lớn)

- Mỗi **domain** (vd. user, role, kiosk): slice (hoặc đóng góp vào `appState`), service gọi API, hooks, components (form, table, …). Pages gọi hooks/components từ features.

### 6. `hooks/`, `components/`

- **hooks:** Logic dùng chung (menu bar items, permissions, scope) — thường dùng trong Main.
- **components:** Component UI dùng chung giữa nhiều trang/feature.

---

## Kiến trúc Shell (khác với micro-app)

- **Không có** `appState` (state Shell nằm ở `libs/shell`).
- **Không export** MicroAppBundle; export **MicroAppShell**(microApps) → ShellProviders, ShellRoutes.
- Cấu trúc điển hình: **layouts/** (Public, Private, Sub), **routes/** (ShellRoutes với `:moduleSlug`), **pages/** (SignIn, NotFound, ModuleHome, …), **components/** (LazyModule, MenuBar, …), **features/** (vd. moduleHome cho trang chọn module).

---

Tóm lại: **một module** trong repo này hoặc là **Shell** (UI bao, route, mount micro-app), hoặc là **micro-app** (bundle + init + reducer + Main với MicroAppProvider/MicroAppRouter + AppRoutes + pages, tùy chọn features/hooks/components). Kiến trúc chung của “một module” chính là hai mô hình đó.
