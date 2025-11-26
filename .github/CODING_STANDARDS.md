# 📋 Coding Standards & Best Practices

## 🎯 Mục tiêu

Đây là **bộ quy chuẩn code** cho tất cả các dự án frontend React + Vite, giúp đảm bảo **tính nhất quán**, **chất lượng code**, và **khả năng mở rộng**.

---

## 🏛️ Cấu Trúc Component

### ✅ Component Structure (Chuẩn)

```jsx
// src/components/Button/Button.jsx
import React from "react";
import PropTypes from "prop-types";
import "./Button.css";

/**
 * Button component tái sử dụng
 * @param {string} variant - primary | secondary | outline
 * @param {string} size - sm | md | lg
 * @param {boolean} disabled - Trạng thái vô hiệu hóa
 * @param {function} onClick - Callback khi click
 * @param {ReactNode} children - Nội dung bên trong button
 */
const Button = ({
  variant = "primary",
  size = "md",
  disabled = false,
  onClick,
  children,
  ...props
}) => {
  const baseClass = "btn";
  const variantClass = `btn--${variant}`;
  const sizeClass = `btn--${size}`;

  return (
    <button
      className={`${baseClass} ${variantClass} ${sizeClass}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  variant: PropTypes.oneOf(["primary", "secondary", "outline"]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
};

export default Button;
```

### ✅ Index Export Pattern

```jsx
// src/components/Button/index.js
export { default } from "./Button";
```

---

## 🎨 CSS/Styling Standards

### ✅ BEM Methodology

```css
/* Button.css */
.btn {
  /* Base styles */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* Variants */
.btn--primary {
  background-color: #3b82f6;
  color: white;
}

.btn--secondary {
  background-color: #6b7280;
  color: white;
}

.btn--outline {
  background-color: transparent;
  border: 1px solid #3b82f6;
  color: #3b82f6;
}

/* Sizes */
.btn--sm {
  padding: 8px 16px;
  font-size: 14px;
}

.btn--md {
  padding: 12px 24px;
  font-size: 16px;
}

.btn--lg {
  padding: 16px 32px;
  font-size: 18px;
}

/* States */
.btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

---

## 🔧 Hooks Pattern

### ✅ Custom Hook Structure

```jsx
// src/hooks/useAuth.js
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { authService } from "@/services/authService";

/**
 * Hook xử lý authentication logic
 * @returns {Object} { user, login, logout, loading, error }
 */
export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, setUser } = useContext(AuthContext);

  const login = async (credentials) => {
    setLoading(true);
    setError(null);

    try {
      const userData = await authService.login(credentials);
      setUser(userData);
      localStorage.setItem("token", userData.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  return {
    user,
    login,
    logout,
    loading,
    error,
  };
};
```

---

## 🌐 API Service Pattern

### ✅ API Service Structure

```jsx
// src/services/apiClient.js
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
```

```jsx
// src/services/userService.js
import { apiClient } from "./apiClient";

export const userService = {
  // Lấy danh sách users
  getUsers: async (params = {}) => {
    const response = await apiClient.get("/users", { params });
    return response;
  },

  // Lấy thông tin user theo ID
  getUserById: async (id) => {
    const response = await apiClient.get(`/users/${id}`);
    return response;
  },

  // Tạo user mới
  createUser: async (userData) => {
    const response = await apiClient.post("/users", userData);
    return response;
  },

  // Cập nhật user
  updateUser: async (id, userData) => {
    const response = await apiClient.put(`/users/${id}`, userData);
    return response;
  },

  // Xóa user
  deleteUser: async (id) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response;
  },
};
```

---

## 🗂️ Folder Naming Convention

### ✅ File & Folder Names

```
✅ ĐÚNG:
- UserCard.jsx (component)
- userService.js (service)
- useAuth.js (hook)
- AUTH_TYPES.js (constants)
- UserCard.css (style)

❌ SAI:
- usercard.jsx
- UserService.js
- UseAuth.js
- authTypes.js
- userCard.css
```

### ✅ Import/Export Pattern

```jsx
// ✅ ĐÚNG - Named exports cho utilities
export const formatDate = (date) => { ... };
export const validateEmail = (email) => { ... };

// ✅ ĐÚNG - Default export cho components
export default Button;

// ✅ ĐÚNG - Import pattern
import Button from '@/components/Button';
import { formatDate, validateEmail } from '@/utils/helpers';
```

---

## 🎯 State Management Pattern

### ✅ Context Pattern

```jsx
// src/context/AuthContext.jsx
import React, { createContext, useReducer, useContext } from "react";

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_USER: "SET_USER",
  SET_ERROR: "SET_ERROR",
  LOGOUT: "LOGOUT",
};

// Initial state
const initialState = {
  user: null,
  loading: false,
  error: null,
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case AUTH_ACTIONS.SET_USER:
      return { ...state, user: action.payload, error: null };
    case AUTH_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case AUTH_ACTIONS.LOGOUT:
      return { ...state, user: null };
    default:
      return state;
  }
};

// Context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const value = {
    ...state,
    dispatch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
};
```

---

## 🧪 Error Handling Pattern

### ✅ Error Boundary

```jsx
// src/components/ErrorBoundary/ErrorBoundary.jsx
import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Đã xảy ra lỗi</h2>
          <p>Vui lòng thử lại sau hoặc liên hệ hỗ trợ.</p>
          <button onClick={() => window.location.reload()}>
            Tải lại trang
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

---

## 📝 Comment & Documentation

### ✅ Component Documentation

```jsx
/**
 * Modal component với backdrop và animation
 *
 * @component
 * @example
 * <Modal isOpen={true} onClose={() => {}}>
 *   <p>Nội dung modal</p>
 * </Modal>
 *
 * @param {boolean} isOpen - Trạng thái hiển thị modal
 * @param {function} onClose - Callback khi đóng modal
 * @param {ReactNode} children - Nội dung bên trong modal
 * @param {string} size - Kích thước modal: sm | md | lg | xl
 * @param {boolean} closeOnBackdrop - Đóng modal khi click backdrop
 */
```

### ✅ Function Documentation

```jsx
/**
 * Format số tiền theo định dạng VNĐ
 * @param {number} amount - Số tiền cần format
 * @param {string} currency - Loại tiền tệ (VNĐ, USD)
 * @returns {string} Số tiền đã được format
 * @example formatCurrency(1000000) // "1.000.000 VNĐ"
 */
export const formatCurrency = (amount, currency = "VNĐ") => {
  return new Intl.NumberFormat("vi-VN").format(amount) + ` ${currency}`;
};
```

---

## 🔍 Performance Best Practices

### ✅ React.memo & useCallback

```jsx
import React, { memo, useCallback } from "react";

const UserCard = memo(({ user, onEdit, onDelete }) => {
  // Memoize callbacks để tránh re-render không cần thiết
  const handleEdit = useCallback(() => {
    onEdit(user.id);
  }, [user.id, onEdit]);

  const handleDelete = useCallback(() => {
    onDelete(user.id);
  }, [user.id, onDelete]);

  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <button onClick={handleEdit}>Sửa</button>
      <button onClick={handleDelete}>Xóa</button>
    </div>
  );
});

UserCard.displayName = "UserCard";
export default UserCard;
```

### ✅ Lazy Loading

```jsx
import { lazy, Suspense } from "react";

// Lazy load components
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Settings = lazy(() => import("@/pages/Settings"));

// Usage with Suspense
<Suspense fallback={<div>Đang tải...</div>}>
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/settings" element={<Settings />} />
  </Routes>
</Suspense>;
```

---

## ✅ Git Commit Convention

```bash
# Format: type(scope): description

✅ ĐÚNG:
feat(auth): add login functionality
fix(button): resolve hover state issue
docs(readme): update installation guide
style(header): improve responsive design
refactor(api): optimize user service calls

❌ SAI:
add login
fix bug
update docs
```

---

**📚 Tài liệu tham khảo:**

- [React Best Practices](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
