"""
Django settings for courtly project (Courtly MVP).
"""

from pathlib import Path
import os
import environ

# ===== Paths =====
BASE_DIR = Path(__file__).resolve().parent.parent
# Load .env so os.getenv works locally
environ.Env.read_env(BASE_DIR / '.env')


# ===== Security / Debug =====
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "dev-secret-key-not-for-prod")
DEBUG = os.getenv("DJANGO_DEBUG", "1") == "1"
ALLOWED_HOSTS = os.getenv("DJANGO_ALLOWED_HOSTS", "").split(",") if os.getenv("DJANGO_ALLOWED_HOSTS") else []

# (ถ้าใช้ dev ผ่าน ngrok/Domain ให้เพิ่มที่นี่ด้วย)
CSRF_TRUSTED_ORIGINS = [u for u in os.getenv("DJANGO_CSRF_TRUSTED", "").split(",") if u]

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

    # Local apps
    "accounts",   # Custom User
    "core",       # Club, Court
    "ops",        # BusinessHour, Closure, Maintenance, Audit
    "booking",    # Slot, Booking, BookingSlot
    "wallet",     # CoinLedger, TopupRequest
]

# # ใช้ Custom User ตามที่เราสร้าง
AUTH_USER_MODEL = "accounts.User"

# ===== Middleware =====
MIDDLEWARE = [
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

## ===== Database =====
# Use Postgres if DB_* vars exist; fallback to SQLite
if os.getenv("DB_NAME"):
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.getenv("DB_NAME"),
            "USER": os.getenv("DB_USER", "postgres"),
            "PASSWORD": os.getenv("DB_PASSWORD", ""),
            "HOST": os.getenv("DB_HOST", "db"),  # 'db' matches docker-compose service
            "PORT": os.getenv("DB_PORT", "5432"),
            "CONN_MAX_AGE": 60,
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

# ===== Password validation =====
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ===== i18n / tz =====
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"   # เก็บเป็น UTC; เวลาแสดงผลใช้ tz ของ Club (เช่น Asia/Bangkok)
USE_I18N = True
USE_TZ = True

# ===== Static / Media =====
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = [BASE_DIR / "static"] if (BASE_DIR / "static").exists() else []

MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ===== DRF (พื้นฐาน) =====
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
        # ถ้าจะใช้ JWT ค่อยเพิ่ม simplejwt ภายหลัง
        # "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
}

