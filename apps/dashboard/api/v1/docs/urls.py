from django.conf.urls import url, include

from views import *

urlpatterns = [

    # Dealer API Docs
    url(r'^docs/?$', view=schema_view, name='schema_view'),

]
