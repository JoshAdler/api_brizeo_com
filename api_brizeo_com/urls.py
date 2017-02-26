from django.conf import settings
from django.conf.urls import include, url
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.staticfiles import views

admin.autodiscover()

"""
All the routing logic goes here.
"""

urlpatterns = [
	              url(r'^django-admin', include(admin.site.urls)),

	              url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),

	              # url(r'^docs/', include('rest_framework_swagger.urls')),

	              url(r'', include('apps.dashboard.urls')),

              ] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
