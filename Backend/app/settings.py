"""
Django settings for app project.

Generated by 'django-admin startproject' using Django 3.2.23.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/3.2/ref/settings/
"""

from pathlib import Path
import environ
import os
env = environ.Env()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('JWT_SECRET')

# SECURITY WARNING: don't run with debug turned on in production!
is_debug = env('IS_DEV', default=True)
DEBUG = is_debug


# Ajoutez les noms d'hôte (domaines) autorisés pour votre application
# ALLOWED_HOSTS = ['domaine.com', 'autre_domaine.com']
ALLOWED_HOSTS = ['localhost', '127.0.0.1', os.environ.get('HOST'), os.environ.get('HOST').split('.')[0]]


# Application definition

INSTALLED_APPS = [
    'channels',
    'controller.apps.ControllerConfig',
    'features.apps.FeaturesConfig',
    'social.apps.SocialConfig',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_otp',
    'django_otp.plugins.otp_totp',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'app.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'app.wsgi.application'


# Database
# https://docs.djangoproject.com/en/3.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'HOST': os.environ.get('DB_HOST'),
        'NAME': os.environ.get('DB_NAME'),
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASS'),
    }
}

# Password validation
# https://docs.djangoproject.com/en/3.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/3.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'CET'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/3.2/howto/static-files/

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static')

# Default primary key field type
# https://docs.djangoproject.com/en/3.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

MEDIA_URL = '/api/media/'
MEDIA_ROOT = BASE_DIR / 'api/media'

SESSION_ENGINE = 'django.contrib.sessions.backends.db'

# Définit la durée de vie du cookie de session
SESSION_COOKIE_AGE = 2 * 60 * 60 # 2 heures en secondes
# SESSION_COOKIE_AGE = 7 * 24 * 60 * 60  # 7 jours en secondes

# Définition du nom du cookie CSRF
CSRF_COOKIE_NAME = 'teapot'

# Définition de la durée de validité du cookie CSRF en secondes
CSRF_COOKIE_AGE = 3600 * 24 * 7

# Activation de l'option Secure (envoi du cookie uniquement via HTTPS)
CSRF_COOKIE_SECURE = True

# Activation de l'option HttpOnly (le cookie n'est pas accessible via JavaScript)
CSRF_COOKIE_HTTPONLY = True

# Activation de l'option SameSite (Strict pour n'autoriser que les requêtes provenant du même site)
CSRF_COOKIE_SAMESITE = 'None'

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer',
    },
}

ASGI_APPLICATION = "app.asgi.application"

DATA_UPLOAD_MAX_MEMORY_SIZE = 1024 * 1024 * 10  # 10 Mo
FILE_UPLOAD_MAX_MEMORY_SIZE = 1024 * 1024 * 10  # 10 Mo

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True

EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD')