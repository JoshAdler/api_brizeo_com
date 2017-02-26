from django.conf.urls import url, include
from views import *

urlpatterns = [
        url(r'^account/?$', view=dashboard_account, name='dashboard_account'),
]


