"""
Django settings for courtly project (Courtly MVP).
"""

from pathlib import Path
import os
import environ

# ===== Paths =====
BASE_DIR = Path(__file__).resolve().parent.parent

# ===== Env loader =====
env = environ.Env()
# โหลดไฟล์ .env ที่โฟลเดอร์โปรเจกต์ (ถ้าไม่มี ก็จะข้ามไปและใช้ตัวแปร ENV ที่ถูก inject จาก docker-compose)
environ.Env.read_env(BASE_DIR / ".env")

# ===== Security / Debug =====
SECRET_KEY = env("DJANGO_SECRET_KEY", default="dev-secret-key-not-for-prod")
DEBUG = env.bool("DJANGO_DEBUG", default=True)

# ใช้ค่าจาก ENV ได้ แต่ตั้งค่า default ให้ครอบคลุม dev/docker
ALLOWED_HOSTS = env.list("DJANGO_ALLOWED_HOSTS", default=["*", "backend", "localhost", "127.0.0.1"])
CSRF_TRUSTED_ORIGINS = env.list(
    "DJANGO_CSRF_TRUSTED",
    default=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://frontend:3000",
    ],
)

# ===== Installed apps =====
INSTALLED_APPS = [
    # Django
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # 3rd-party
    "rest_framework",
    "corsheaders",

    # Local apps
    "accounts",   # Custom User
    "core",       # Club, Court
    "ops",        # BusinessHour, Closure, Maintenance, Audit
    "booking",    # Slot, Booking, BookingSlot
    "wallet",     # CoinLedger, TopupRequest
]

# Custom User
AUTH_USER_MODEL = "accounts.User"

# ===== Middleware =====
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",           # ต้องมาก่อน Common/CSRF
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "courtly.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "courtly.wsgi.application"

# ===== Database =====
# ลำดับความสำคัญ:
# 1) DATABASE_URL (เช่น postgres://user:pass@db:5432/name)
# 2) ชุดตัวแปร POSTGRES_* หรือ DB_* โดย host ดีฟอลต์ = 'db'
# 3) ตกลง sqlite (dev)
db_url = env("DATABASE_URL", default=None)

if db_url:
    # django-environ รองรับ parse DATABASE_URL โดยตรง
    default_db = env.db("DATABASE_URL")
    default_db["CONN_MAX_AGE"] = env.int("DB_CONN_MAX_AGE", default=60)
else:
    # รองรับทั้ง POSTGRES_* และ DB_* (ใส่อะไรก็ได้อย่างน้อย NAME/USER/PASS)
    name = env("POSTGRES_DB", default=env("DB_NAME", default=None))
    if name:
        default_db = {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": name,
            "USER": env("POSTGRES_USER", default=env("DB_USER", default="postgres")),
            "PASSWORD": env("POSTGRES_PASSWORD", default=env("DB_PASSWORD", default="")),
            "HOST": env("POSTGRES_HOST", default=env("DB_HOST", default="db")),  # สำคัญ: default = 'db'
            "PORT": env("POSTGRES_PORT", default=env("DB_PORT", default="5432")),
            "CONN_MAX_AGE": env.int("DB_CONN_MAX_AGE", default=60),
        }
    else:
        # fallback: sqlite (dev)
        default_db = {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": env("SQLITE_NAME", default=str(BASE_DIR / "db.sqlite3")),
        }

DATABASES = {"default": default_db}

# ===== Password validation =====
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ===== Internationalization =====
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"   # เก็บเป็น UTC; เวลาแสดงผลค่อยแปลงเป็น Asia/Bangkok ฝั่ง UI/serializer
USE_I18N = True
USE_TZ = True

# ===== Static / Media =====
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = [BASE_DIR / "static"] if (BASE_DIR / "static").exists() else []

MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ===== DRF =====
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
}

# ===== CORS =====
CORS_ALLOWED_ORIGINS = env.list(
    "CORS_ALLOWED_ORIGINS",
    default=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://frontend:3000",
    ],
)
CORS_ALLOW_ALL_ORIGINS = False