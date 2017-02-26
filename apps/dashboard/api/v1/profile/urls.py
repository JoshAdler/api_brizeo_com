from django.conf.urls import url

from views import *

urlpatterns = [
    url(r'^profile/?$', APIProfile.as_view()),
    url(r'^profile/password/?$', APIProfilePassword.as_view()),
    url(r'^profile/api/?$', APIProfileAPI.as_view()),
]
