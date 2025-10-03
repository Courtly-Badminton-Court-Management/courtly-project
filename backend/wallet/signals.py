# accounts/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from django.contrib.auth import get_user_model
from wallet.models import CoinLedger

User = get_user_model()


@receiver(post_save, sender=User)
def create_user_initial_coins(sender, instance, created, **kwargs):
    if created:
        # ให้ user ทุกคนที่สมัครใหม่มี 1000 coins
        CoinLedger.objects.create(
            user=instance,
            type="initial",
            amount=1000,
            ref_booking=None
        )
