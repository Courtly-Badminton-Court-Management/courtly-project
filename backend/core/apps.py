# core/apps.py
from django.apps import AppConfig

class CoreConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "core"

    def ready(self):
        from django.conf import settings
        from django.core.files.storage import default_storage
        from django.core.files import storage as storage_module
        from storages.backends.s3boto3 import S3Boto3Storage

        # ✅ Force rebind default_storage instance
        if not isinstance(default_storage, S3Boto3Storage):
            print("[Storage] 🔄 Forcing S3Boto3Storage as default & rebinding instance")
            settings.DEFAULT_FILE_STORAGE = "storages.backends.s3boto3.S3Boto3Storage"
            storage_module.default_storage = S3Boto3Storage()
