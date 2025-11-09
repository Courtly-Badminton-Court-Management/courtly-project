from django.apps import AppConfig

class WalletConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "wallet"

    def ready(self):
        # ✅ Force rebind slip_path field to current default_storage
        from django.core.files.storage import default_storage
        from .models import TopupRequest

        field = TopupRequest._meta.get_field("slip_path")
        field.storage = default_storage
        print("[Storage] 🔄 Rebound TopupRequest.slip_path storage to", default_storage.__class__)

