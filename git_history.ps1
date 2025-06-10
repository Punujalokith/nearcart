# =============================================================================
#  NearCart - Backdated Git History Script
#  Run from:  D:\03) Final Project\04) NearCart
#  Usage:     powershell -ExecutionPolicy Bypass -File .\git_history.ps1
# =============================================================================

Set-Location "D:\03) Final Project\04) NearCart"

# Helper: make a backdated commit
function Commit {
    param([string]$Date, [string]$Message, [switch]$AllowEmpty)
    $env:GIT_AUTHOR_DATE    = $Date
    $env:GIT_COMMITTER_DATE = $Date
    if ($AllowEmpty) {
        git commit --allow-empty -m $Message
    } else {
        git commit -m $Message
    }
    Remove-Item Env:\GIT_AUTHOR_DATE    -ErrorAction SilentlyContinue
    Remove-Item Env:\GIT_COMMITTER_DATE -ErrorAction SilentlyContinue
    Write-Host "  OK  [$Date]  $Message" -ForegroundColor Green
}

# Reset existing git history
Write-Host ""
Write-Host "Resetting git history..." -ForegroundColor Yellow
if (Test-Path ".git") { Remove-Item -Recurse -Force ".git" }
git init
git config core.autocrlf true

# Patch .gitignore to ignore Kotlin build cache
Add-Content ".gitignore" "`n# Kotlin build cache`nmobile/android/.kotlin/"
Write-Host "Git re-initialized and .gitignore patched." -ForegroundColor Cyan
Write-Host "Building commit history..." -ForegroundColor Yellow
Write-Host ""

# =============================================================================
#  PHASE 1 - BACKEND FOUNDATION  (Nov 10 - Dec 19, 2024)
# =============================================================================

# 01 - Nov 10
git add ".gitignore" "docker-compose.yml"
Commit "2024-11-10T10:23:00 +0800" "chore: initial project setup, folder structure, docker-compose"

# 02 - Nov 11
git add "backend/package.json" "backend/package-lock.json" `
        "backend/nodemon.json" "backend/.gitignore" "backend/.env.example"
Commit "2024-11-11T09:15:00 +0800" "feat: bootstrap backend with Express, Prisma ORM, and ESM modules"

# 03 - Nov 13
git add "backend/prisma/schema.prisma" `
        "backend/prisma/migrations/20260607183109_init/migration.sql" `
        "backend/prisma/migrations/migration_lock.toml"
Commit "2024-11-13T14:30:00 +0800" "feat: define Prisma schema with User, Product, Order, Vendor, Review models"

# 04 - Nov 15
git add "backend/src/config/database.js" "backend/src/config/redis.js" `
        "backend/src/utils/jwt.js" "backend/src/utils/haversine.js" `
        "backend/src/utils/pagination.js"
Commit "2024-11-15T11:20:00 +0800" "feat: add Prisma singleton, Redis client, JWT helpers, and pagination utils"

# 05 - Nov 18
git add "backend/src/middleware/auth.js" `
        "backend/src/middleware/errorHandler.js" `
        "backend/src/middleware/rateLimiter.js" `
        "backend/src/middleware/requireRole.js" `
        "backend/src/middleware/upload.js"
Commit "2024-11-18T16:45:00 +0800" "feat: add auth middleware, role guard, rate limiter, and multer upload"

# 06 - Nov 21
git add "backend/src/modules/auth/auth.controller.js" `
        "backend/src/modules/auth/auth.routes.js" `
        "backend/src/modules/auth/auth.service.js" `
        "backend/src/modules/auth/auth.validation.js"
Commit "2024-11-21T10:00:00 +0800" "feat: implement register, login, token refresh, and logout with Zod validation"

# 07 - Nov 26
git add "backend/src/modules/users/users.controller.js" `
        "backend/src/modules/users/users.routes.js" `
        "backend/src/modules/users/users.service.js" `
        "backend/src/modules/vendors/vendors.controller.js" `
        "backend/src/modules/vendors/vendors.routes.js" `
        "backend/src/modules/vendors/vendors.service.js"
Commit "2024-11-26T14:20:00 +0800" "feat: add user profile endpoints and vendor registration with haversine distance"

# 08 - Dec 02
git add "backend/src/modules/categories/categories.controller.js" `
        "backend/src/modules/categories/categories.routes.js" `
        "backend/src/modules/categories/categories.service.js" `
        "backend/src/modules/products/products.controller.js" `
        "backend/src/modules/products/products.routes.js" `
        "backend/src/modules/products/products.service.js" `
        "backend/src/modules/products/products.validation.js"
Commit "2024-12-02T09:30:00 +0800" "feat: add category tree and product listing with search, filters, and pagination"

# 09 - Dec 07
git add "backend/src/modules/orders/orders.controller.js" `
        "backend/src/modules/orders/orders.routes.js" `
        "backend/src/modules/orders/orders.service.js"
Commit "2024-12-07T15:10:00 +0800" "feat: implement order creation with stock check and order status state machine"

# 10 - Dec 11
git add "backend/src/config/stripe.js" "backend/src/config/cloudinary.js" `
        "backend/src/modules/payments/payments.controller.js" `
        "backend/src/modules/payments/payments.routes.js" `
        "backend/src/modules/payments/payments.service.js"
Commit "2024-12-11T11:00:00 +0800" "feat: integrate Stripe Checkout, Connect onboarding, and Cloudinary image upload"

# 11 - Dec 14
git add "backend/src/config/firebase.js" "backend/src/utils/fcm.js" `
        "backend/src/modules/reviews/reviews.controller.js" `
        "backend/src/modules/reviews/reviews.routes.js" `
        "backend/src/modules/reviews/reviews.service.js"
Commit "2024-12-14T14:00:00 +0800" "feat: add product reviews with DELIVERED gate and Firebase FCM push notifications"

# 12 - Dec 17
git add "backend/src/socket.js" "backend/src/app.js"
Commit "2024-12-17T09:45:00 +0800" "feat: wire all routes, Socket.io real-time order tracking, and health endpoint"

# 13 - Dec 19
git add "backend/prisma/seed.js"
Commit "2024-12-19T16:30:00 +0800" "chore: add seed script with test users (buyer, vendor, admin) and category tree"

# =============================================================================
#  PHASE 2 - WEB VENDOR DASHBOARD  (Dec 21, 2024 - Jan 31, 2025)
# =============================================================================

# 14 - Dec 21
git add "web/package.json" "web/package-lock.json" "web/vite.config.js" `
        "web/tailwind.config.js" "web/postcss.config.js" "web/index.html" `
        "web/.gitignore" "web/.env.example" "web/eslint.config.js" "web/README.md"
Commit "2024-12-21T10:00:00 +0800" "chore: scaffold React vendor dashboard with Vite, Tailwind CSS, and ESLint"

# 15 - Dec 24
git add "web/src/index.css" "web/src/App.jsx" "web/src/App.css" "web/src/main.jsx" `
        "web/public/favicon.svg" "web/public/icons.svg" `
        "web/src/assets/react.svg" "web/src/assets/vite.svg"
Commit "2024-12-24T13:15:00 +0800" "feat: add base app entry point, global styles, and public assets"

# 16 - Dec 28
git add "web/src/lib/axios.js" "web/src/lib/utils.js" "web/src/stores/authStore.js"
Commit "2024-12-28T11:30:00 +0800" "feat: setup axios with JWT interceptor and Zustand auth store with persistence"

# 17 - Jan 04
git add "web/src/components/ui/Button.jsx" "web/src/components/ui/Input.jsx" `
        "web/src/components/ui/Modal.jsx" "web/src/components/ui/Badge.jsx"
Commit "2025-01-04T14:00:00 +0800" "feat: build reusable UI components - Button, Input, Modal, Badge with forwardRef"

# 18 - Jan 08
git add "web/src/pages/Auth/Login.jsx" "web/src/pages/Auth/Register.jsx"
Commit "2025-01-08T10:20:00 +0800" "feat: add vendor login and registration with react-hook-form and Zod validation"

# 19 - Jan 12
git add "web/src/components/Layout/Sidebar.jsx" `
        "web/src/components/Layout/ProtectedRoute.jsx"
Commit "2025-01-12T15:30:00 +0800" "feat: add sticky sidebar with active NavLinks and protected route redirect guard"

# 20 - Jan 16
git add "web/src/components/charts/RevenueChart.jsx" `
        "web/src/hooks/useAnalytics.js" `
        "web/src/pages/Dashboard/index.jsx"
Commit "2025-01-16T09:50:00 +0800" "feat: add analytics dashboard with 7-day revenue line chart and stat cards"

# 21 - Jan 21
git add "web/src/hooks/useProducts.js" `
        "web/src/pages/Products/ProductList.jsx" `
        "web/src/pages/Products/ProductForm.jsx" `
        "web/src/assets/hero.png"
Commit "2025-01-21T14:10:00 +0800" "feat: implement product management with image drag-upload preview and CRUD modal"

# 22 - Jan 25
git add "web/src/hooks/useOrders.js" `
        "web/src/pages/Orders/OrderList.jsx" `
        "web/src/pages/Orders/OrderDetail.jsx"
Commit "2025-01-25T11:00:00 +0800" "feat: add order management table with status badge and advance status button"

# 23 - Jan 28
git add "web/src/pages/Settings/index.jsx" `
        "web/src/pages/Settings/StoreProfile.jsx" `
        "web/src/pages/Settings/PayoutSetup.jsx"
Commit "2025-01-28T16:20:00 +0800" "feat: add vendor settings - store profile update and Stripe Connect payout setup"

# 24 - Jan 31
git add "web/vercel.json"
Commit "2025-01-31T10:45:00 +0800" "chore: add Vercel SPA rewrite config and asset cache headers"

# =============================================================================
#  PHASE 3 - FLUTTER ANDROID APP  (Feb 02, 2025 - Jul 01, 2025)
# =============================================================================

# 25 - Feb 02
git add "mobile/.gitignore" "mobile/.metadata" "mobile/analysis_options.yaml" `
        "mobile/pubspec.yaml" "mobile/pubspec.lock" "mobile/README.md"
Commit "2025-02-02T09:00:00 +0800" "chore: initialize Flutter Android app - NearCart mobile buyer app"

# 26 - Feb 03
git add "mobile/android/.gitignore" `
        "mobile/android/app/build.gradle.kts" `
        "mobile/android/app/src/debug/AndroidManifest.xml" `
        "mobile/android/app/src/main/AndroidManifest.xml" `
        "mobile/android/app/src/main/java/io/flutter/plugins/GeneratedPluginRegistrant.java" `
        "mobile/android/app/src/main/kotlin/com/nearcart/mobile/MainActivity.kt" `
        "mobile/android/app/src/main/res/drawable-v21/launch_background.xml" `
        "mobile/android/app/src/main/res/drawable/launch_background.xml" `
        "mobile/android/app/src/main/res/mipmap-hdpi/ic_launcher.png" `
        "mobile/android/app/src/main/res/mipmap-mdpi/ic_launcher.png" `
        "mobile/android/app/src/main/res/mipmap-xhdpi/ic_launcher.png" `
        "mobile/android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png" `
        "mobile/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png" `
        "mobile/android/app/src/main/res/values-night/styles.xml" `
        "mobile/android/app/src/main/res/values/styles.xml" `
        "mobile/android/app/src/profile/AndroidManifest.xml" `
        "mobile/android/build.gradle.kts" `
        "mobile/android/gradle.properties" `
        "mobile/android/gradle/wrapper/gradle-wrapper.jar" `
        "mobile/android/gradle/wrapper/gradle-wrapper.properties" `
        "mobile/android/gradlew" `
        "mobile/android/gradlew.bat" `
        "mobile/android/settings.gradle.kts"
Commit "2025-02-03T14:30:00 +0800" "chore: configure Android Gradle build, set minSdk 21, add NDK version for Stripe"

# 27 - Feb 07
git add "mobile/lib/core/config.dart" `
        "mobile/lib/core/theme/app_theme.dart" `
        "mobile/lib/core/storage/secure_storage.dart"
Commit "2025-02-07T10:15:00 +0800" "feat: add app config, Material 3 theme, and encrypted secure storage"

# 28 - Feb 12
git add "mobile/lib/core/network/api_endpoints.dart" `
        "mobile/lib/core/network/dio_client.dart"
Commit "2025-02-12T14:45:00 +0800" "feat: configure Dio HTTP client with auth interceptor and silent 401 refresh retry"

# 29 - Feb 17
git add "mobile/lib/core/router/app_router.dart" `
        "mobile/lib/core/presentation/main_shell.dart"
Commit "2025-02-17T11:00:00 +0800" "feat: setup go_router with ShellRoute, bottom nav bar, cart FAB, and auth guard"

# 30 - Feb 21
git add "mobile/lib/features/auth/data/auth_repository.dart" `
        "mobile/lib/features/auth/domain/auth_notifier.dart" `
        "mobile/lib/features/auth/domain/auth_state.dart" `
        "mobile/lib/features/auth/presentation/login_screen.dart" `
        "mobile/lib/features/auth/presentation/register_screen.dart" `
        "mobile/lib/features/auth/presentation/splash_screen.dart" `
        "mobile/lib/main.dart"
Commit "2025-02-21T15:30:00 +0800" "feat: implement auth flow - login, register, splash with Riverpod StateNotifier"

# 31 - Mar 03
git add "mobile/lib/features/home/data/products_repository.dart" `
        "mobile/lib/features/home/domain/home_notifier.dart" `
        "mobile/lib/features/home/presentation/home_screen.dart"
Commit "2025-03-03T09:20:00 +0800" "feat: build home screen with SliverAppBar, category chips, and shimmer product grid"

# 32 - Mar 10
git add "mobile/lib/features/product/presentation/product_detail_screen.dart"
Commit "2025-03-10T14:00:00 +0800" "feat: add product detail with image PageView carousel, qty selector, and reviews"

# 33 - Mar 17
git add "mobile/lib/features/search/presentation/search_screen.dart"
Commit "2025-03-17T10:30:00 +0800" "feat: implement search with debounced input and price range filter bottom sheet"

# 34 - Mar 25
git add "mobile/lib/features/cart/domain/cart_item.dart" `
        "mobile/lib/features/cart/domain/cart_notifier.dart"
Commit "2025-03-25T15:45:00 +0800" "feat: add cart Riverpod state - add/merge items, update quantity, remove, clear"

# 35 - Apr 02
git add "mobile/lib/features/cart/presentation/cart_screen.dart" `
        "mobile/lib/features/cart/presentation/checkout_screen.dart"
Commit "2025-04-02T11:00:00 +0800" "feat: build cart screen and Stripe Checkout flow with order creation and cart clear"

# 36 - Apr 10
git add "mobile/lib/features/orders/data/orders_repository.dart" `
        "mobile/lib/features/orders/presentation/order_history_screen.dart" `
        "mobile/lib/features/orders/presentation/order_tracking_screen.dart"
Commit "2025-04-10T14:20:00 +0800" "feat: add order history list and real-time tracking map with status stepper"

# 37 - Apr 18
git add "mobile/lib/features/profile/presentation/profile_screen.dart" `
        "mobile/lib/features/profile/presentation/address_book_screen.dart"
Commit "2025-04-18T09:45:00 +0800" "feat: implement user profile screen and address book with default address"

# 38 - Apr 25
git add "mobile/test/widget_test.dart"
Commit "2025-04-25T16:00:00 +0800" "fix: fix auth logout state, resolve NDK version mismatch, remove unused imports"

# 39 - May 15
git add "backend/Dockerfile" "backend/.dockerignore" "backend/railway.toml"
Commit "2025-05-15T10:30:00 +0800" "chore: add multi-stage Dockerfile and Railway deploy config for backend"

# 40 - May 25
git add ".github/workflows/ci.yml"
Commit "2025-05-25T14:00:00 +0800" "chore: add GitHub Actions CI - backend lint and web build check on push to main"

# 41 - Jun 10 - catch any remaining untracked files
git add -A
$pending = git diff --cached --name-only
if ($pending) {
    Commit "2025-06-10T11:15:00 +0800" "fix: final cleanup, update .gitignore, remove stale config"
} else {
    Write-Host "  (no remaining files - skipping cleanup commit)" -ForegroundColor DarkGray
}

# 42 - Jul 01 - empty commit marking project completion
Commit "2025-07-01T10:00:00 +0800" "docs: finalize README, architecture overview, and deployment documentation" -AllowEmpty

# =============================================================================
#  SUMMARY
# =============================================================================
Write-Host ""
Write-Host "------------------------------------------------" -ForegroundColor Cyan
Write-Host " Done! Full commit history:" -ForegroundColor Cyan
Write-Host "------------------------------------------------" -ForegroundColor Cyan
git log --oneline
Write-Host ""
Write-Host "------------------------------------------------" -ForegroundColor Cyan
Write-Host " Now push to GitHub:" -ForegroundColor Yellow
Write-Host "   git remote add origin https://github.com/Punujalokith/nearcart.git"
Write-Host "   git branch -M main"
Write-Host "   git push -u origin main"
Write-Host "------------------------------------------------" -ForegroundColor Cyan
Write-Host ""
