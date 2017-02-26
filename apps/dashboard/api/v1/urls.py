from django.conf.urls import url, include

urlpatterns = [

    # Dealer API URLs
    url(r'^v1/', include([

        # Authentication API
        url(r'', include('apps.dashboard.api.v1.auth.urls')),

        # Profile API
        url(r'', include('apps.dashboard.api.v1.profile.urls')),

        # Notifications API
        url(r'', include('apps.dashboard.api.v1.notifications.urls')),

        # Account API
        url(r'', include('apps.dashboard.api.v1.account.urls')),

        # Utilities API
        url(r'', include('apps.dashboard.api.v1.utils.urls')),

        # API Documentation
        url(r'', include('apps.dashboard.api.v1.docs.urls')),

    ])),

]
