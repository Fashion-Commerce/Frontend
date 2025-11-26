# 🚀 Deploy lên Vercel - Hướng dẫn nhanh

## Bước 1: Đăng ký Vercel (1 phút)
1. Truy cập: https://vercel.com/signup
2. Click **"Continue with GitHub"**
3. Authorize Vercel truy cập GitHub

✅ **Private repo vẫn deploy được, web sẽ public**

---

## Bước 2: Deploy (3 phút)

### Cách 1: Qua Web (Đơn giản nhất)

1. **Import Project**: https://vercel.com/new
2. Chọn repository `Fashion-Commerce/Frontend`
3. **Configure**:
   - Framework: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   
4. **Environment Variables** (QUAN TRỌNG):
   ```
   VITE_API_URL_1=https://your-backend-api.com/v1
   VITE_API_URL_2=https://your-backend-api.com/v1
   ```
   
5. Click **"Deploy"** → Đợi 2-3 phút

### Cách 2: Dùng CLI (Nhanh hơn)

```bash
# Đã cài Vercel CLI rồi
vercel login

# Deploy
vercel

# Lần đầu sẽ hỏi:
# - Setup project? Y
# - Link to existing project? N
# - Project name? agentfashion
# - Directory? ./
# - Override settings? N

# Deploy production
vercel --prod
```

---

## Bước 3: Setup CI/CD Tự động (Optional)

### Vercel Auto Deploy (Khuyến nghị - Không cần làm gì)

Vercel tự động deploy khi bạn push code:
- Push lên `main` → **Production**
- Push lên `dev` → **Preview**
- Mở PR → **Preview URL** tự động

**Bật trong Vercel Dashboard**:
Settings → Git → ✅ Enable all

### GitHub Actions (Nâng cao)

File `.github/workflows/deploy-vercel.yml` đã có.

**Setup Secrets**:
1. Lấy tokens:
   ```bash
   vercel link
   cat .vercel/project.json
   ```

2. GitHub repo → Settings → Secrets → Add:
   - `VERCEL_TOKEN` (lấy từ https://vercel.com/account/tokens)
   - `VERCEL_ORG_ID` (từ .vercel/project.json)
   - `VERCEL_PROJECT_ID` (từ .vercel/project.json)

---

## Bước 4: Cấu hình Environment Variables

**Vào Vercel Dashboard** → Project → Settings → Environment Variables

### Production (Main branch):
```bash
VITE_API_URL_1=https://your-production-api.com/v1
VITE_API_URL_2=https://your-production-api.com/v1
```

### Preview (Dev branch):
```bash
VITE_API_URL_1=https://your-dev-api.com/v1
VITE_API_URL_2=https://your-dev-api.com/v1
```

---

## Bước 5: Deploy & Test

```bash
# Push code lên GitHub
git add .
git commit -m "chore: setup Vercel deployment"
git push origin dev

# Hoặc deploy trực tiếp
vercel --prod
```

**Kiểm tra**:
- Vào https://vercel.com/dashboard
- Xem deployment URL
- Test website: Login, Cart, Chatbot

---

## ⚠️ Backend CORS (QUAN TRỌNG)

Backend phải cho phép Vercel domain:

```python
# FastAPI backend
allow_origins=[
    "https://agentfashion.vercel.app",
    "https://*.vercel.app",
    "http://localhost:3000"
]
```

---

## 🔧 Commands

```bash
# Build local
npm run build

# Deploy preview
vercel

# Deploy production
vercel --prod

# View logs
vercel logs
```

---

**Xong! 🎉**
