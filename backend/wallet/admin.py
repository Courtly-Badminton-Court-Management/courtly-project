from django.contrib import admin
from .models import CoinLedger, TopupRequest


@admin.register(CoinLedger)
class CoinLedgerAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "type", "amount", "ref_booking", "created_at")
    list_filter = ("type", "created_at")
    search_fields = ("user__username",)


@admin.register(TopupRequest)
class TopupRequestAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "amount_thb", "coins", "status", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("user__username",)



