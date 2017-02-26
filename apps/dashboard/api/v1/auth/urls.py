from django.conf.urls import url, include

from views import *

urlpatterns = [

    # Dealer API URLs
    url(r'^auth/', include([

        url(r'^login/?$', APIAuthLogin.as_view()),

        url(r'^logout/?$', APIAuthLogout.as_view()),

        url(r'^signup/?$', APIAuthSignup.as_view()),

        url(r'^invite/?$', APIAuthInvite.as_view()),

        url(r'^reset/?$', APIAuthReset.as_view()),

        url(r'^reset/save/?$', APIAuthResetSave.as_view()),

        url(r'^resend/email/?$', APIAuthResendEmail.as_view()),

    ])),
]
