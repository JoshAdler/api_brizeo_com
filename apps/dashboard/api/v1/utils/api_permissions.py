from rest_framework import permissions


class SuperAdminPermissions(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.user.member.role.code == "super_admin":
            is_allowed = True
        else:
            is_allowed = False

        return is_allowed


class AdminPermissions(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.user.member.role.code == "admin" or request.user.member.role.code == "super_admin":
            is_allowed = True
        else:
            is_allowed = False

        return is_allowed


class MembersPermissions(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.user.member.role.code == "member" or request.user.member.role.code == "admin" \
                or request.user.member.role.code == "super_admin":
            is_allowed = True
        else:
            is_allowed = False

        return is_allowed
