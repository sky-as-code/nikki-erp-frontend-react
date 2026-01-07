# Assets Directory

Thư mục này chứa các file assets (ảnh, icon) được chia sẻ giữa các module.

## Cấu trúc

```
assets/
├── images/     # Các file ảnh (PNG, JPG, etc.)
└── icons/      # Các file icon (SVG, PNG, etc.)
```

## Cách sử dụng

### Import ảnh từ các module khác:

```typescript
// Import ảnh
import logo from '@nikkierp/ui/assets/images/logo.png';
import banner from '@nikkierp/ui/assets/images/banner.jpg';

// Import icon
import icon from '@nikkierp/ui/assets/icons/icon.svg';

// Sử dụng trong component
function MyComponent() {
  return (
    <img src={logo} alt="Logo" />
  );
}
```

### Lưu ý:

1. **Vite tự động xử lý**: Vite sẽ tự động xử lý các file assets khi import, không cần cấu hình thêm.

2. **TypeScript types**: Để TypeScript nhận diện các file ảnh, đảm bảo có file `vite-env.d.ts` với:
   ```typescript
   /// <reference types="vite/client" />
   ```

3. **Build**: Khi build, Vite sẽ tự động copy và optimize các assets này.

4. **Path resolution**: Các module khác có thể import trực tiếp từ `@nikkierp/ui/assets/...` nhờ vào workspace package configuration.

## Thêm assets mới

1. Thêm file vào thư mục `images/` hoặc `icons/`
2. Import và sử dụng như ví dụ trên
3. Không cần cập nhật file index.ts (chỉ dùng cho constants nếu cần)

