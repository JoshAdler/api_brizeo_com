from django.conf.urls import include, url

urlpatterns = [
    # Dashboard UI
    url(r'^dashboard/', include([

        # Dashboard APIs
        url(r'', include('apps.dashboard.api.urls')),

        url(r'', include('apps.dashboard.auth.urls')),

        url(r'', include('apps.dashboard.home.urls')),

        url(r'', include('apps.dashboard.account.urls')),

        url(r'', include('apps.dashboard.notification.urls')),

        url(r'', include('apps.dashboard.billing.urls')),
    ])),
]
