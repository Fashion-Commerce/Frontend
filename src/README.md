# 📁 Source Code Structure

Cấu trúc này tuân theo **coding standards** định nghĩa trong `.github/CODING_STANDARDS.md`.

## 📂 Thư mục

```
src/
├── api/           # API services & endpoints
├── assets/        # CSS, images, fonts, static files
├── components/    # React components (UI)
├── constants/     # Hằng số, enums, config
├── hooks/         # Custom React hooks
├── layouts/       # Layout components (MainLayout, AuthLayout, etc.)
├── lib/           # Third-party integrations (API client, etc.)
├── pages/         # Page components (Home, Dashboard, etc.)
├── services/      # Business logic services
├── stores/        # State management (Zustand)
├── types/         # TypeScript type definitions
├── utils/         # Helper functions, utilities
├── App.tsx        # Root component
└── index.tsx      # Entry point
```

## 📝 Quy tắc

### Import Pattern
Sử dụng `@/` alias thay vì relative paths:

```tsx
// ✅ ĐÚNG
import { Button } from '@/components/Button';
import { useAuth } from '@/hooks';
import type { User } from '@/types';

// ❌ SAI
import { Button } from '../components/Button';
import { useAuth } from '../../hooks';
```

### Component Structure
Mỗi component nên có:
- File component (`.tsx`)
- Props interface
- JSDoc comments

```tsx
/**
 * Button component tái sử dụng
 * @param variant - primary | secondary | outline
 * @param size - sm | md | lg
 */
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ ... }) => {
  // implementation
};
```

### Naming Convention
- **Components**: PascalCase (`UserCard.tsx`)
- **Hooks**: camelCase, prefix `use` (`useAuth.ts`)
- **Services**: camelCase (`authService.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Types**: PascalCase (`User`, `Product`)

## 🔧 Các thư mục chi tiết

### `/api`
Chứa tất cả API calls, endpoint definitions, và API-related types.

### `/components`
UI components tái sử dụng. Có thể tổ chức theo:
- Atomic design (atoms, molecules, organisms)
- Feature-based (auth/, products/, etc.)

### `/hooks`
Custom React hooks để tái sử dụng logic.

### `/services`
Business logic, không phụ thuộc vào React.

### `/stores`
Global state management (Zustand, Redux, etc.)

### `/types`
Tất cả TypeScript types tập trung ở đây.

### `/utils`
Pure functions, helpers, formatters.

---

Xem thêm: `.github/CODING_STANDARDS.md` và `.github/FRONTEND_PATTERN_GUIDE.md`
