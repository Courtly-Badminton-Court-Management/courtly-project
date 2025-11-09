"""
Django settings for courtly project (Courtly MVP).
"""

from pathlib import Path
import os
import environ
import dj_database_url  # ===== Database =====

# ===== Paths =====
BASE_DIR = Path(__file__).resolve().parent.parent

# ===== Load environment variables =====
env = environ.Env()
environ.Env.read_env(BASE_DIR / ".env")

# ===== Security / Debug =====
SECRET_KEY = env("DJANGO_SECRET_KEY", default="dev-secret-key-not-for-prod")
DEBUG = env.bool("DJANGO_DEBUG", default=True)
ALLOWED_HOSTS = env.list("DJANGO_ALLOWED_HOSTS", default=[])

CSRF_TRUSTED_ORIGINS = env.list("DJANGO_CSRF_TRUSTED", default=[])

# ============================================================
# 🧩 Installed Apps
# ============================================================
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
    "storages",  # ✅ ต้องอยู่ตรงนี้ (ก่อน Local apps)

    # Local apps
    "accounts",   # Custom User
    "core",       # Club, Court
    "ops",        # BusinessHour, Closure, Maintenance, Audit
    "booking",    # Slot, Booking, BookingSlot
    "wallet",     # CoinLedger, TopupRequest

    # OPENAPI DOCS
    "drf_spectacular",
]

# ===== Custom User =====
AUTH_USER_MODEL = "accounts.User"

# ============================================================
# 🧩 Middleware
# ============================================================
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "courtly.urls"

# ============================================================
# 🧩 Templates
# ============================================================
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

# ============================================================
# 🧩 Database
# ============================================================
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": env("POSTGRES_DB"),
        "USER": env("POSTGRES_USER"),
        "PASSWORD": env("POSTGRES_PASSWORD"),
        "HOST": env("POSTGRES_HOST"),
        "PORT": env("POSTGRES_PORT", default="5432"),
        "OPTIONS": {"sslmode": env("POSTGRES_SSL_MODE", default="require")},
        "CONN_MAX_AGE": 60,
    }
}

# ============================================================
# 🧩 Password validation
# ============================================================
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ============================================================
# 🕒 Internationalization
# ============================================================
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Bangkok"
USE_TZ = True
USE_I18N = True

# ============================================================
# 🧩 Static & Media
# ============================================================
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = [BASE_DIR / "static"] if (BASE_DIR / "static").exists() else []

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ============================================================
# 🧩 REST Framework
# ============================================================
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}

# ============================================================
# 🧩 CORS
# ============================================================
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
] + env.list("DJANGO_CORS_ORIGINS", default=[])

CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
] + env.list("DJANGO_CSRF_TRUSTED", default=[])

# ============================================================
# 🧩 OpenAPI Docs (DRF Spectacular)
# ============================================================
SPECTACULAR_SETTINGS = {
    "TITLE": "Courtly API",
    "DESCRIPTION": "Badminton Court Management & Booking System",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
}

# ============================================================
# 🌩️ DigitalOcean Spaces Storage (S3-compatible)
# ============================================================
AWS_ACCESS_KEY_ID = env("SPACES_KEY", default=None)
AWS_SECRET_ACCESS_KEY = env("SPACES_SECRET", default=None)
AWS_STORAGE_BUCKET_NAME = env("SPACES_BUCKET", default="courtly-bucket")
AWS_S3_REGION_NAME = env("SPACES_REGION", default="sgp1")
AWS_S3_ENDPOINT_URL = env("SPACES_ENDPOINT", default="https://sgp1.digitaloceanspaces.com")

# ✅ ใช้ DigitalOcean Spaces เป็น media storage หลัก
DEFAULT_FILE_STORAGE = "storages.backends.s3boto3.S3Boto3Storage"
AWS_DEFAULT_ACL = "public-read"

# ✅ ใช้ URL ของ Spaces แทน /media/
MEDIA_URL = f"{AWS_S3_ENDPOINT_URL}/{AWS_STORAGE_BUCKET_NAME}/"
MEDIA_ROOT = BASE_DIR / "media"  # สำหรับ fallback เฉพาะ dev

print(f"[Storage] Using DigitalOcean Spaces bucket: {AWS_STORAGE_BUCKET_NAME}")


# ============================================================
# ✅ Force import S3Boto3Storage for Django 5.2+
# ============================================================
try:
    from storages.backends.s3boto3 import S3Boto3Storage
    DEFAULT_FILE_STORAGE = "storages.backends.s3boto3.S3Boto3Storage"
    print("[Storage] ✅ Using S3Boto3Storage (DigitalOcean Spaces active)")
except Exception as e:
    print(f"[Storage] ⚠️ Fallback to local FileSystemStorage: {e}")
    DEFAULT_FILE_STORAGE = "django.core.files.storage.FileSystemStorage"