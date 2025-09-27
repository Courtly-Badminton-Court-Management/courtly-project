"""
Django settings for courtly project (Courtly MVP).
"""

from pathlib import Path
import os
import environ
# ===== Database =====
import dj_database_url

# ===== Paths =====
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from .env
env = environ.Env()
environ.Env.read_env(BASE_DIR / ".env")

# ===== Security / Debug =====
SECRET_KEY = env("DJANGO_SECRET_KEY", default="dev-secret-key-not-for-prod")
DEBUG = env.bool("DJANGO_DEBUG", default=True)
ALLOWED_HOSTS = env.list("DJANGO_ALLOWED_HOSTS", default=[])

CSRF_TRUSTED_ORIGINS = env.list("DJANGO_CSRF_TRUSTED", default=[])

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

    # OPENAPI DOCS
    'drf_spectacular',
]

# Custom User
AUTH_USER_MODEL = "accounts.User"

# ===== Middleware =====
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


# Prefer DATABASE_URL if set
database_url = env("DATABASE_URL", default=None)

if database_url:
    DATABASES = {
        "default": dj_database_url.parse(database_url, conn_max_age=60),
    }
else:
    # Fall back to explicit POSTGRES_* variables
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": env("POSTGRES_DB", default="postgres"),
            "USER": env("POSTGRES_USER", default="postgres"),
            "PASSWORD": env("POSTGRES_PASSWORD", default=""),
            "HOST": env("POSTGRES_HOST", default="db"),
            "PORT": env("POSTGRES_PORT", default="5432"),
            "CONN_MAX_AGE": 60,
        }
    }

# ===== Password validation =====
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ===== Internationalization =====
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"   # store as UTC; display with Club tz (e.g., Asia/Bangkok)
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
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# ===== CORS =====
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]


SPECTACULAR_SETTINGS = {
    'TITLE': 'Your Project API',
    'DESCRIPTION': 'Your project description',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    # OTHER SETTINGS
}
