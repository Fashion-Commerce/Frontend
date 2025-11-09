# 🚀 React + Vite Frontend Template (Scalable Pattern)

## 🧩 Giới thiệu

Đây là **template cấu trúc dự án React dùng Vite** được thiết kế hướng tới **quy mô lớn**, **dễ mở rộng**, và **dễ duy trì**.  
Mục tiêu là cung cấp một chuẩn thống nhất cho tất cả các project frontend bạn phát triển — giúp bạn và Copilot code theo cùng một pattern rõ ràng.

---

## 🏗️ Cấu Trúc Thư Mục

```
📦 my-react-vite-app
├── 📁 public/                # Tệp tĩnh (favicon, ảnh, manifest, index.html,...)
├── 📁 src/
│   ├── 📁 assets/            # Hình ảnh, icon, font, css global
│   ├── 📁 components/        # Các component tái sử dụng (Button, Card, Navbar,...)
│   ├── 📁 layouts/           # Layout tổng (MainLayout, AuthLayout,...)
│   ├── 📁 pages/             # Các trang chính (Home, About, Dashboard,...)
│   ├── 📁 hooks/             # Custom hook dùng lại (useAuth, useFetch,...)
│   ├── 📁 context/           # React Context cho global state (AuthContext,...)
│   ├── 📁 services/          # Giao tiếp API (axios client, endpoint,...)
│   ├── 📁 store/             # State management (Zustand, Redux,...)
│   ├── 📁 utils/             # Hàm tiện ích (formatDate, validateForm,...)
│   ├── 📁 constants/         # Hằng số, enum, config
│   ├── App.jsx               # Root component
│   ├── main.jsx              # Điểm khởi chạy (ReactDOM.createRoot)
│   └── index.css             # CSS gốc, global style
├── .env                      # Biến môi trường
├── .gitignore                # Bỏ qua tệp/thư mục không cần thiết khi commit
├── package.json              # Thông tin project, scripts, dependencies
├── vite.config.js            # Cấu hình build và dev server cho Vite
├── README.md                 # Tài liệu dự án
└── jsconfig.json / tsconfig.json  # Alias và IntelliSense nếu dùng TypeScript
```

---

## ⚙️ Cài Đặt & Chạy Dự Án

```bash
# 1. Cài dependencies
npm install
# hoặc
yarn install

# 2. Chạy môi trường dev
npm run dev
# hoặc
yarn dev

# 3. Build cho production
npm run build

# 4. Preview bản build
npm run preview
```

---

## 🧠 Tư Duy Kiến Trúc (High-level Architecture)

### 1️⃣ Atomic Design (Gợi ý)

Chia nhỏ UI thành:

- **Atoms**: Thành phần cơ bản (Button, Input, Icon)
- **Molecules**: Kết hợp nhiều atom (SearchBar, Card)
- **Organisms**: Thành phần phức tạp (Header, Sidebar)
- **Pages**: Trang cụ thể (HomePage, LoginPage)

👉 Giúp Copilot hiểu context khi code UI.

---

### 2️⃣ Separation of Concerns

- **UI logic** nằm trong `components/`
- **Business logic** nằm trong `services/`, `hooks/`
- **Global state** tách biệt trong `context/` hoặc `store/`
- **Routing** (React Router) tách riêng tại `src/router/`

---

### 3️⃣ Environment Management

Sử dụng `.env` để tách biệt cấu hình môi trường:

```bash
VITE_API_BASE_URL=https://api.example.com
VITE_APP_NAME=MyViteApp
```

> Vite tự động load biến bắt đầu bằng `VITE_`.

---

### 4️⃣ Coding Convention

- **Tên component**: PascalCase (`UserCard.jsx`)
- **Tên hook**: camelCase, bắt đầu bằng `use` (`useAuth.js`)
- **Tên file CSS**: giống tên component (`UserCard.css`)
- **Import alias**: Dùng `@` để trỏ vào `src/`
  (_Cấu hình trong `vite.config.js` và `jsconfig.json`_)

Ví dụ:

```js
import Button from "@/components/Button";
import useAuth from "@/hooks/useAuth";
```

---

### 5️⃣ Folder-by-Feature (Khi dự án lớn)

Nếu app phát triển lớn, bạn có thể **tổ chức theo tính năng**:

```
src/
 ├── features/
 │    ├── auth/
 │    │   ├── components/
 │    │   ├── pages/
 │    │   ├── hooks/
 │    │   ├── services/
 │    │   └── store/
 │    └── product/
 │        ├── ...
```

> Giúp scale dự án dễ hơn, tránh xung đột giữa các module.

---

## 🧰 Tools & Libraries Đề Xuất

| Mục đích         | Thư viện khuyên dùng                   |
| ---------------- | -------------------------------------- |
| UI Framework     | TailwindCSS / Material UI / Ant Design |
| Routing          | React Router DOM                       |
| State Management | Zustand / Redux Toolkit                |
| HTTP Client      | Axios                                  |
| Form             | React Hook Form / Formik               |
| Validation       | Yup                                    |
| Animation        | Framer Motion                          |
| Chart            | Recharts / Chart.js                    |
| Icon             | Lucide-react / React Icons             |

---

## 🧪 Testing (Tùy chọn)

- Jest + React Testing Library
- Vitest (tích hợp tốt hơn với Vite)

---

## 💡 Copilot Code Style Guide

Để Copilot hiểu rõ pattern và sinh code đúng hướng:

1. **Luôn ghi chú rõ ràng trước khi viết code**

   ```js
   // Tạo component Button tái sử dụng có 2 style: primary và outline
   ```

2. **Giữ comment nhất quán** giữa các file, Copilot sẽ tự "bắt pattern".
3. **Không code trong App.jsx trực tiếp**, mà chia component rõ ràng trong `src/components/`.
4. **Khi tạo trang mới**, luôn tạo folder trong `pages/` và file theo dạng PascalCase.
5. **Viết mô tả chi tiết trong README.md**, Copilot sẽ dùng làm ngữ cảnh cho code gợi ý.

---

## 📦 Deployment

Build ra thư mục `dist/`:

```bash
npm run build
```

Upload thư mục `dist` lên bất kỳ hosting tĩnh nào:

- Netlify
- Vercel
- GitHub Pages
- Cloudflare Pages

---

## 👨‍💻 Tác giả

**Tên:** Trương Ngọc Cường
**Template:** React + Vite Scalable Pattern
**Version:** 1.0.0
**Mục tiêu:** Làm chuẩn frontend cho các dự án AI, thương mại điện tử, multi-agent,...

---

✅ **Gợi ý:** Bạn có thể lưu file này vào thư mục gốc mỗi project, để Copilot và dev khác đều "bắt" pattern chung của bạn.
