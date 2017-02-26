from django.conf.urls import include, url
from views import *

urlpatterns = [

    # dealer login url.
    url(r'^login/?$', view=dashboard_login, name='dashboard_login'),

    # dealer signup url.
    url(r'^signup/?$', view=dashboard_signup, name='dashboard_signup'),

    url(r'^signup/verify/(?P<email_verification_token>[-\w]+)/?$', view=dashboard_signup_verification,
        name='dashboard_signup_verification'),

    # dealer signup successful
    url(r'^signup/successful/?$', view=dashboard_signup_successful, name='dashboard_signup_successful'),

    # when dealer change email address. We need to verify the new email.
    url(r'^email/verify/(?P<email_verification_token>[-\w]+)/?$', view=dashboard_email_change_verification,
        name='dashboard_email_change_verification'),

    # when dealer requests new password.
    url(r'^reset/?$', view=dashboard_reset, name='dashboard_reset'),

    # when password reset successful
    url(r'^reset/successful/?$', view=dashboard_reset_successful, name='dashboard_reset_successful'),

    # password reset url.
    url(r'^reset/(?P<password_reset_token>[-\w]+)/?$', view=dashboard_reset_verification,
        name='dashboard_reset_verification'),

    # logout url
    url(r'^logout/?$', view=dashboard_logout, name='dashboard_logout'),

]
