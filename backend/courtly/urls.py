"""
URL configuration for courtly project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from accounts.views import RegisterView, LoginView, MeView
from rest_framework_simplejwt.views import TokenRefreshView
from core.views import PlayerHomeData, ManagerDashboardData



urlpatterns = [
    path("admin/", admin.site.urls),

    # Auth
    path("api/auth/register/", RegisterView.as_view(), name="register"),
    path("api/auth/login/",    LoginView.as_view(),    name="login"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("api/auth/me/",       MeView.as_view(),       name="me"),

    # Neutral app paths
    path("api/app/home/", PlayerHomeData.as_view(), name="app-home"),
    path("api/app/dashboard/", ManagerDashboardData.as_view(), name="app-dashboard"), # vain manager
]



