from django.conf import settings
from apps.dealer.models import *


def is_super_admin(request):
    if request.user.is_authenticated():
        if request.user.is_superuser is False:
            if request.user.member.role.code == 'super_admin':
                IS_SUPER_ADMIN = True
            else:
                IS_SUPER_ADMIN = False

            return {'IS_SUPER_ADMIN': IS_SUPER_ADMIN}
        else:
            return {'IS_SUPER_ADMIN': False}
    else:
        return {'IS_SUPER_ADMIN': False}


def is_admin(request):
    if request.user.is_authenticated():
        if request.user.is_superuser is False:
            if request.user.member.role.code == 'admin':
                IS_ADMIN = True
            else:
                IS_ADMIN = False

            return {'IS_ADMIN': IS_ADMIN}
        else:
            return {'IS_ADMIN': False}
    else:
        return {'IS_ADMIN': False}


def is_member(request):
    if request.user.is_authenticated():
        if request.user.is_superuser is False:
            if request.user.member.role.code == "member":
                IS_MEMBER = True
            else:
                IS_MEMBER = False

            return {'IS_MEMBER': IS_MEMBER}
        else:
            return {'IS_MEMBER': False}
    else:
        return {'IS_MEMBER': False}
