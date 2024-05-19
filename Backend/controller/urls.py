# urls.py
from django.urls import path
from .views import create_user, login_user, disconnect_user, is_login, edit_password, get_csrf_token, get_42_uri, SignInWith42, forgot_password, delete_account, is_recover_code, change_password, bypass_a2f, is_connection_code, is_in_game

urlpatterns = [
    path('up/', create_user, name='create_user'),
    path('in/', login_user, name='login_user'),
    path('out/', disconnect_user, name='disconnect_user'),
    path('del/', delete_account, name='delete_account'),
    path('is/', is_login, name='is_login'),
    path('tp/', get_csrf_token, name='get_csrf_token'),
    path('42/', get_42_uri, name='get_42_uri'),
    path('in42/', SignInWith42, name='SignInWith42'),
    path('forgot_password/', forgot_password, name='forgot_password'),
    path('is_recover_code/', is_recover_code, name='is_recover_code'),
    path('change_password/', change_password, name='change_password'),
    path('edit_password/', edit_password, name='edit_password'),
    path('bypass_a2f/', bypass_a2f, name='bypass_a2f'),
    path('is_connection_code/', is_connection_code, name='is_connection_code'),
    path('is_in_game/', is_in_game, name='is_in_game'),
]
