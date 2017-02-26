from django.conf.urls import url

from views import *

urlpatterns = [
    url(r'^utils/countries/?$', APIUtilsCountries.as_view()),
]
