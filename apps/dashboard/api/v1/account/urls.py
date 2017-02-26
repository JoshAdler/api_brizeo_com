from django.conf.urls import url

from views import *

urlpatterns = [
    url(r'^account/?$', APIAccount.as_view()),
    url(r'^account/business_logo/?$', APIAccountBusinessLogo.as_view()),
    url(r'^account/store_logo/?$', APIAccountStoreLogo.as_view()),
]
