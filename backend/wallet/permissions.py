from rest_framework.permissions import BasePermission


class IsManager(BasePermission):
    """
    Grants access to staff users or those with role == 'manager'.
    Adjust field names to match your project if needed.
    """
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        return getattr(user, "role", None) == "manager" or user.is_staff
