"""
Django settings for app_brizeo_com project.

For more information on this file, see
https://docs.djangoproject.com/en/1.6/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.6/ref/settings/
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os
import environ
import sys


reload(sys)
sys.setdefaultencoding('utf-8')

env = environ.Env(
	DJANGO_DEBUG=(bool, False),
	DJANGO_ALLOWED_HOSTS=(list, []),
)  # set default values and casting

environ.Env.read_env('../.env')

ROOT_PATH = os.path.dirname(os.path.abspath(__file__))

BASE_DIR = os.path.dirname(os.path.dirname(__file__))

SECRET_KEY = env('DJANGO_SECRET_KEY')

DEBUG = env('DJANGO_DEBUG')

ALLOWED_HOSTS = env('DJANGO_ALLOWED_HOSTS')

HTTPS_ENABLED = False

# Password for SMTP
EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD')
EMAIL_HOST_USER = env('EMAIL_HOST_USER')

# AWS Settings
AWS_BUCKET_NAME = env('AWS_BUCKET_NAME')
AWS_ACCESS_KEY = env('AWS_ACCESS_KEY')
AWS_SECRET_KEY = env('AWS_SECRET_KEY')

# Store setting
STORE_DOMAIN = env('STORE_DOMAIN')

DATABASES = {
	'default': {
		'ENGINE': 'django.db.backends.mysql',
		'NAME': env('DB_NAME'),
		'USER': env('DB_USER'),
		'PASSWORD': env('DB_PASSWORD'),
		'HOST': env('DB_HOST'),
		'PORT': '3306',
	}
}

# Application definition
INSTALLED_APPS = (
	'django.contrib.admin',
	'django.contrib.auth',
	'django.contrib.contenttypes',
	'django.contrib.sessions',
	'django.contrib.messages',
	'django.contrib.staticfiles',
	'django.contrib.postgres',
	'post_office',
	'django_crontab',
	'rest_framework',
	'rest_framework.authtoken',
	'rest_framework_swagger',
	'apps',
)

MIDDLEWARE_CLASSES = (
	'django.middleware.csrf.CsrfViewMiddleware',
	'django.contrib.sessions.middleware.SessionMiddleware',
	'django.middleware.common.CommonMiddleware',
	'django.contrib.auth.middleware.AuthenticationMiddleware',
	'django.contrib.messages.middleware.MessageMiddleware',
	'django.middleware.clickjacking.XFrameOptionsMiddleware',
	'apps.utils.middleware.RedirectMiddleware',
	'apps.dashboard.utils.middleware.DashboardAuthMiddleware',
)

AUTHENTICATION_BACKENDS = (
	'django.contrib.auth.backends.ModelBackend',
)

PASSWORD_HASHERS = (
	'django.contrib.auth.hashers.PBKDF2PasswordHasher',
	'django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher',
	'django.contrib.auth.hashers.BCryptPasswordHasher',
	'django.contrib.auth.hashers.SHA1PasswordHasher',
	'django.contrib.auth.hashers.MD5PasswordHasher',
	'django.contrib.auth.hashers.CryptPasswordHasher',
)

REST_FRAMEWORK = {

	'EXCEPTION_HANDLER': 'apps.utils.api_exceptions.custom_exception_handler',

	'DEFAULT_PERMISSION_CLASSES': (
		'rest_framework.permissions.IsAuthenticated',
	),
	'DEFAULT_PARSER_CLASSES': (
		'rest_framework.parsers.JSONParser',
	),
	'DEFAULT_RENDERER_CLASSES': (
		'rest_framework.renderers.JSONRenderer',
	),
	'DEFAULT_AUTHENTICATION_CLASSES': (
		'apps.utils.api_authentication.CsrfExemptSessionAuthentication',
		'rest_framework.authentication.TokenAuthentication',
	)
}

STATICFILES_FINDERS = (
	'django.contrib.staticfiles.finders.FileSystemFinder',
	'django.contrib.staticfiles.finders.AppDirectoriesFinder',
)

MIGRATION_MODULES = {'apps': 'apps._migrations'}

ROOT_URLCONF = 'app_brizeo_com.urls'

WSGI_APPLICATION = 'app_brizeo_com.wsgi.application'

# Internationalization
LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True

STATIC_URL = '/static/'

STATIC_ROOT = BASE_DIR + '/static/'

# Additional locations of static files
STATICFILES_DIRS = (
	("dashboard", BASE_DIR + '/apps/dashboard/_static/dashboard/_lib'),
)

FILE_UPLOAD_HANDLERS = [
	'django.core.files.uploadhandler.MemoryFileUploadHandler',
	'django.core.files.uploadhandler.TemporaryFileUploadHandler',
]

TEMPLATES = [
	{
		'BACKEND': 'django.template.backends.django.DjangoTemplates',
		'APP_DIRS': True,
		'DIRS': [
			BASE_DIR + '/apps/dashboard/_templates/',
		],

		'OPTIONS': {
			'debug': True,
			'context_processors': [
				"django.contrib.auth.context_processors.auth",
				"django.template.context_processors.debug",
				"django.template.context_processors.i18n",
				"django.template.context_processors.media",
				"django.template.context_processors.static",
				"django.template.context_processors.tz",
				# "apps.dealer.utils.context_processors.is_admin",
				"django.template.context_processors.request",
			],
		},
	},
]

# Email settings
DEFAULT_FROM_EMAIL = 'Brizeo<noreply@daltonbain.co>'

EMAIL_BACKEND = 'post_office.EmailBackend'

EMAIL_HOST = 'smtp.mailgun.org'

EMAIL_PORT = '587'

EMAIL_SUBJECT_PREFIX = 'Brizeo - '

EMAIL_USE_TLS = True

HOME_URL = "/"

LOGIN_URL = "/login"

INVITE_URL = "/invite"

SIGNUP_URL = "/signup"

DASHBOARD_URL = "/dashboard"

PASSWORD_RESET_URL = "/reset"

NOT_ALLOWED = "/error"

API_PATH = '/api/'

DOMAIN_NOT_FOUND = "/domain_not_found"

SECURE_PATHS = (
	'/',
)

USE_CDN = False

SECURE_PROXY_SSL_HEADER = (' HTTP_X_FORWARDED_PROTO ', ' https ')

# Logging
LOGGING = {
	'version': 1,
	'disable_existing_loggers': False,
	'root': {
		'level': 'WARNING',
		'handlers': ['file'],
	},
	'formatters': {
		'verbose': {
			'format': '%(levelname)s %(asctime)s %(module)s %(process)d %(thread)d %(message)s'
		},
	},
	'handlers': {
		'file': {
			'level': 'DEBUG',
			'class': 'logging.FileHandler',
			'filename': BASE_DIR + '/static/django/debug.log',
		},
	},
	'loggers': {
		'django.db.backends': {
			'level': 'ERROR',
			'handlers': ['file'],
			'propagate': False,
		},
		'django.request': {
			'handlers': ['file'],
			'level': 'DEBUG',
			'propagate': True,
		},

		'django_crontab': {
			'handlers': ['file'],
			'level': 'DEBUG',
		}
	},
}

CRONJOBS = []
