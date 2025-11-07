# 🔐 PHÂN TÍCH & SỬA LỖI AUTH FLOW

## 📊 TỔNG QUAN

Đã kiểm tra toàn bộ authentication flow, đặc biệt là **register**, và tìm thấy 4 vấn đề chính.

---

## ❌ CÁC VẤN ĐỀ ĐÃ TÌM THẤY

### **1. Trùng lặp RegisterRequest interface**

**Vấn đề:**

- `auth.api.ts` và `types/index.ts` đều định nghĩa `RegisterRequest`
- `types/index.ts` có thêm field `is_admin` không cần thiết

**Trước:**

```typescript
// types/index.ts
export interface RegisterRequest {
  fullname: string;
  email: string;
  phone?: string;
  password: string;
  is_admin?: boolean; // ❌ THỪA
}

// auth.api.ts
export interface RegisterRequest {
  fullname: string;
  email: string;
  phone?: string;
  password: string;
}
```

**✅ Đã sửa:** Xóa `is_admin` khỏi `types/index.ts`

---

### **2. authStore không lưu user vào localStorage**

**Vấn đề:**

- Zustand persist chỉ lưu `isAuthenticated`
- Không lưu `user` object
- Khi refresh page → mất thông tin user

**Trước:**

```typescript
partialize: (state) => ({
  isAuthenticated: state.isAuthenticated  // ❌ Thiếu user
}),
```

**✅ Đã sửa:**

```typescript
partialize: (state) => ({
  user: state.user,                        // ✅ Thêm user
  isAuthenticated: state.isAuthenticated
}),
```

---

### **3. authService.ts có logic duplicate**

**Vấn đề:**

- `authService.ts` có `is_admin` parameter không cần thiết
- Code bị duplicate với `authStore`

**Trước:**

```typescript
export const register = async (
  fullname: string,
  email: string,
  password: string,
  phone?: string,
  is_admin?: boolean // ❌ Không cần
): Promise<{ user?: User; error?: string }> => {
  const registerData: RegisterRequest = {
    fullname,
    email,
    password,
    phone,
    is_admin: false, // ❌ Hard-coded
  };
  // ...
};
```

**✅ Đã sửa:**

- Xóa `is_admin` parameter
- Thêm `@deprecated` comment để khuyên dùng `authStore`

---

### **4. Thiếu phone field trong AuthModal**

**Vấn đề:**

- AuthModal chỉ có: name, email, password
- Không có field phone (mặc dù API hỗ trợ)

**✅ Đã sửa:**

- Thêm phone field (optional)
- Cập nhật interface và handler

---

## ✅ NHỮNG GÌ ĐÃ SỬA

### **1. types/index.ts**

```typescript
// Xóa is_admin khỏi RegisterRequest
export interface RegisterRequest {
  fullname: string;
  email: string;
  phone?: string;
  password: string;
}
```

### **2. stores/authStore.ts**

```typescript
// Lưu user vào localStorage
partialize: (state) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated
}),
```

### **3. services/authService.ts**

```typescript
// Xóa is_admin, thêm @deprecated
export const register = async (
  fullname: string,
  email: string,
  password: string,
  phone?: string
): Promise<{ user?: User; error?: string }> => {
  const registerData: RegisterRequest = {
    fullname,
    email,
    password,
    phone,
  };
  // ...
};
```

### **4. components/AuthModal.tsx**

```typescript
// Thêm phone field
const [phone, setPhone] = useState("");

// Thêm phone input trong form
<div>
  <label>Số điện thoại (tùy chọn)</label>
  <input
    type="tel"
    value={phone}
    onChange={(e) => setPhone(e.target.value)}
    placeholder="0123456789"
  />
</div>;

// Cập nhật onRegister
onRegister: (name: string, email: string, password: string, phone?: string) =>
  Promise<void>;
```

### **5. layouts/MainLayout.tsx**

```typescript
// Cập nhật handleRegister để nhận phone
const handleRegister = async (
  name: string,
  email: string,
  password: string,
  phone?: string
) => {
  const success = await register(name, email, password, phone);
  // ...
};
```

---

## 🔄 FLOW ĐĂNG KÝ HOÀN CHỈNH

```
1. User điền form trong AuthModal
   ├─ Họ tên (required)
   ├─ Email (required)
   ├─ Số điện thoại (optional)
   └─ Mật khẩu (required)

2. AuthModal.onRegister(name, email, password, phone)

3. MainLayout.handleRegister()

4. authStore.register(name, email, password, phone)
   ├─ Gọi authApi.register({ fullname, email, password, phone })
   ├─ Tạo user mới trên backend
   └─ Tự động gọi authStore.login(email, password)
       ├─ Gọi authApi.login({ username: email, password })
       ├─ Nhận access_token
       ├─ Set token vào apiClient
       ├─ Gọi authApi.getCurrentUser()
       ├─ Lưu user vào authStore
       └─ Zustand persist lưu vào localStorage

5. MainLayout đóng modal và fetch cart
```

---

## 📋 CHECKLIST ĐẦY ĐỦ

### **Auth API Layer** ✅

- [x] `LoginRequest` - username, password
- [x] `RegisterRequest` - fullname, email, phone?, password
- [x] `AuthResponse` - access_token, token_type
- [x] `User` - user_id?, id?, fullname, email, phone?, user_type, ...

### **Auth Store** ✅

- [x] Lưu user vào state
- [x] Lưu isAuthenticated vào state
- [x] Persist user và isAuthenticated vào localStorage
- [x] login() - đăng nhập
- [x] register() - đăng ký + auto login
- [x] logout() - đăng xuất
- [x] fetchCurrentUser() - lấy user hiện tại

### **Auth UI** ✅

- [x] AuthModal - login/register form
- [x] Login form - email, password
- [x] Register form - name, email, phone (optional), password
- [x] Error handling
- [x] Loading state

### **Integration** ✅

- [x] MainLayout tích hợp authStore
- [x] Header hiển thị user info
- [x] Protected routes cho admin
- [x] Auto fetch cart sau login

---

## 🎯 KẾT QUẢ

### **Trước khi sửa:**

- ❌ Register có field thừa (is_admin)
- ❌ User không được persist sau reload
- ❌ Thiếu phone field trong form
- ❌ Code duplicate giữa authService và authStore

### **Sau khi sửa:**

- ✅ RegisterRequest đồng nhất giữa các files
- ✅ User được lưu vào localStorage
- ✅ Phone field trong register form
- ✅ Code clean, không duplicate
- ✅ Flow đăng ký hoàn chỉnh và nhất quán

---

## 🧪 TESTING

### **Test Register Flow:**

1. Mở app → Click "Đăng ký"
2. Điền form:
   - Họ tên: "Nguyễn Văn A"
   - Email: "test@example.com"
   - Số điện thoại: "0123456789" (optional)
   - Mật khẩu: "password123"
3. Click "Đăng ký"
4. Kiểm tra:
   - ✅ Modal đóng
   - ✅ Header hiển thị tên user
   - ✅ Cart được fetch
   - ✅ Reload page → vẫn logged in

### **Test Login Flow:**

1. Logout
2. Click "Đăng nhập"
3. Điền email + password
4. Click "Đăng nhập"
5. Kiểm tra:
   - ✅ Modal đóng
   - ✅ Header hiển thị tên user
   - ✅ Cart được fetch
   - ✅ Reload page → vẫn logged in

---

## 💡 LƯU Ý

### **Về authService.ts**

- File này được giữ lại cho backward compatibility
- Được đánh dấu `@deprecated`
- Khuyến khích dùng `authStore` thay vì `authService`

### **Về phone field**

- Phone là **optional** trong cả API và UI
- User có thể bỏ trống khi đăng ký
- Có thể cập nhật sau trong profile

### **Về localStorage**

- Token lưu trong `apiClient`
- User + isAuthenticated lưu bởi Zustand persist
- Tự động restore sau reload page

---

## 🚀 NEXT STEPS

Để improve auth flow hơn nữa:

1. **Thêm validation:**

   - Email format validation
   - Password strength meter
   - Phone number format validation

2. **Thêm features:**

   - Forgot password
   - Email verification
   - Remember me checkbox
   - Social login (Google, Facebook)

3. **Security:**

   - Rate limiting cho login attempts
   - Token refresh mechanism
   - Secure password requirements

4. **UX improvements:**
   - Show/hide password toggle
   - Auto-focus first field
   - Better error messages
   - Success notifications

Chúc bạn thành công! 🎉
