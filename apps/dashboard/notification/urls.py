from django.conf.urls import url, include
from views import *

urlpatterns = [
        url(r'^notification/?$', view=dashboard_notification, name='dashboard_notification'),
]


