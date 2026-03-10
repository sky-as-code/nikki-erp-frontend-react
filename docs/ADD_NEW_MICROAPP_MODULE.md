# Thêm một Micro-App Module mới

Khi muốn thêm một module (micro-app) mới vào hệ thống, cần tạo các phần sau.

---

## 1. Tạo package module trong `modules/`

Tạo thư mục mới, ví dụ: `modules/myModule/`.

### 1.1. `modules/myModule/package.json`

- **name**: `@nikkierp/microapp-<tênModule>` (camelCase, ví dụ `@nikkierp/microapp-inventory`).
- **exports**: entry point bundle, thường `".": "./src/index.tsx"`.
- **dependencies**: ít nhất `@nikkierp/ui`, `@nikkierp/common`; nếu dùng menu/guard/shell thì thêm `@nikkierp/shell`.
- **peerDependencies**: `react`, `react-dom`, `react-router`, `react-router-dom`, `@reduxjs/toolkit` (đúng version với webapp).

Có thể copy từ `modules/essential/package.json` rồi đổi `name` và bỏ bớt dependency không dùng.

### 1.2. Entry bundle: `modules/myModule/src/index.tsx`

Bundle phải export **default** một object đúng type **MicroAppBundle**:

```ts
const bundle: MicroAppBundle = {
  init({ htmlTag, config, registerReducer }) {
    const domType = MicroAppDomType.SHARED; // hoặc ISOLATED

    // 1) Đăng ký Custom Element
    defineWebComponent(Main, { htmlTag, domType });

    // 2) Đăng ký reducer với Shell và khởi tạo context state cho micro-app
    const result = registerReducer(reducer);
    initMicroAppStateContext(result);

    return { domType };
  },
};

export default bundle;
```

- **Main**: React component gốc của micro-app, nhận `MicroAppProps` (api, config, domType, routing, slug, widgetName, widgetProps).
- **reducer**: Redux reducer của module (slice), dùng cho state riêng của micro-app trong store Shell.

### 1.3. Root component (ví dụ `Main`)

- Nhận `props: MicroAppProps`.
- Bọc toàn bộ nội dung bằng:
  - `MicroAppProvider {...props}` (cung cấp api, routing, state context).
  - Bên trong: layout/theme (MantineProvider, v.v.) rồi **MicroAppRouter**.
- **MicroAppRouter** nhận `domType`, `basePath={props.routing.basePath}`, `widgetName`, `widgetProps`.
  - **Chế độ app** (có routing): bên trong dùng `<AppRoutes>` và các `<AppRoute path="..." element={...} />` (từ `@nikkierp/ui/microApp`).
  - **Chế độ widget** (nếu cần): thêm `<WidgetRoutes>` và các `<WidgetRoute name="..." Component={...} />`.

Trong module, dùng:
- `useMicroAppDispatch`, `useMicroAppSelector`, `useRootSelector` (từ `@nikkierp/ui/microApp`) thay cho `useDispatch`/`useSelector` trực tiếp.
- `useMicroAppContext()` để lấy `api`, `routing`.

### 1.4. Reducer (Redux slice)

- Tạo slice (ví dụ `modules/myModule/src/appState/myModuleSlice.ts`) với `createSlice`; export `reducer` và (nếu cần) `actions`.
- Export trong `appState/index.ts`: `export { reducer, actions } from './myModuleSlice';`.
- Trong `init()` gọi `registerReducer(reducer)` với reducer đó; key trong store sẽ là **slug** của micro-app (do Shell quyết định).

### 1.5. (Tùy chọn) Config

- Nếu cần config từ server: trong **Shell** khi đăng ký metadata khai báo `configUrl`. Shell sẽ fetch và truyền `config` vào `init()` và vào `MicroAppProps`.
- Trong module dùng `props.config` (vd. `config?.apiBaseUrl`).

---

## 2. Đăng ký module với Shell (webapp)

### 2.1. Thêm dependency trong `apps/webapp/package.json`

Trong `dependencies` thêm:

```json
"@nikkierp/microapp-myModule": "workspace:*"
```

(Tên package phải trùng với `name` trong `modules/myModule/package.json`.)

### 2.2. Thêm entry trong danh sách micro-apps: `apps/webapp/src/main.tsx`

Trong mảng `microApps` thêm một object **MicroAppMetadata**:

```ts
{
  slug: 'nikkierp.myModule',           // unique, camelCase, dùng làm key reducer
  basePath: 'my-module',                // segment URL (phải trùng với route :moduleSlug nếu dùng LazyModule)
  bundleUrl: () => import('@nikkierp/microapp-myModule'),
  htmlTag: 'nikkiapp-my-module',        // tên custom element, không trùng module khác
  // configUrl: 'https://...',          // tùy chọn
  // dependsOn: ['nikkierp.other'],    // tùy chọn: tải module khác trước
},
```

- **slug**: Dùng làm key inject reducer vào store; nên dạng namespace (vd. `nikkierp.myModule`).
- **basePath**: Đoạn path trong URL. Trong `LazyModule`, Shell so `app.basePath === moduleSlug` (từ route `:moduleSlug`). Nếu route là `/org/xyz/my-module/...` thì `moduleSlug` = `my-module` → `basePath` phải là `'my-module'`.
- **bundleUrl**: Function trả về `import('@nikkierp/microapp-myModule')` (dynamic import).
- **htmlTag**: Tên thẻ custom element khi mount (vd. `nikkiapp-my-module`).

Sau khi thêm, chạy `pnpm install` ở root để link workspace.

---

## 3. Route Shell (đã có sẵn)

Shell đã có route dạng `:moduleSlug/*` và dùng `LazyModule` với `microApps`. Khi user vào URL có `moduleSlug` (vd. `my-module`), Shell sẽ:

- Tìm `microApps.find(app => app.basePath === moduleSlug)` → được `foundApp`.
- Render `<LazyMicroApp slug={foundApp.slug} basePath={foundApp.basePath} ... />`.

Không cần tạo route mới trong Shell; chỉ cần **basePath** trong metadata trùng với **moduleSlug** trong URL.

---

## 4. Tóm tắt checklist

| Bước | Việc cần làm |
|------|-------------------------------|
| 1 | Tạo `modules/<myModule>/` với `package.json` (name: `@nikkierp/microapp-<myModule>`) |
| 2 | Tạo reducer (slice) và export trong `appState/index.ts` |
| 3 | Tạo `src/index.tsx`: export default `MicroAppBundle` với `init()` gọi `defineWebComponent`, `registerReducer`, `initMicroAppStateContext` |
| 4 | Root component: `MicroAppProvider` → (theme) → `MicroAppRouter` với `AppRoutes` / `AppRoute` (và nếu cần `WidgetRoutes` / `WidgetRoute`) |
| 5 | Trong `apps/webapp/package.json`: thêm dependency `@nikkierp/microapp-<myModule>: "workspace:*"` |
| 6 | Trong `apps/webapp/src/main.tsx`: thêm object vào mảng `microApps` (slug, basePath, bundleUrl, htmlTag) |
| 7 | `pnpm install` tại root; chạy webapp và truy cập URL có segment tương ứng `basePath` (vd. `/.../my-module/`) |

---

## 5. Ví dụ cấu trúc thư mục module tối thiểu

```
modules/myModule/
├── package.json
└── src/
    ├── index.tsx              # bundle default export + Main component
    ├── appState/
    │   ├── index.ts           # export reducer (và actions)
    │   └── myModuleSlice.ts   # createSlice
    └── pages/
        └── HomePage.tsx       # trang mẫu
```

Sau khi tạo xong, URL vào module sẽ có dạng (tùy cách Shell định nghĩa route):  
`/global/my-module` hoặc `/:orgSlug/my-module/*` tương ứng với `basePath: 'my-module'`.
