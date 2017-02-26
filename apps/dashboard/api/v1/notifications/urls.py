from django.conf.urls import url
from views import *

urlpatterns = [
    url(r'^notifications/?$', APINotifications.as_view()),
]
