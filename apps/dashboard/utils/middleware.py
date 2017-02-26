from django.conf import settings
from django.http import HttpResponseRedirect


class DashboardAuthMiddleware(object):
	def __init__(self):
		self.paths = getattr(settings, 'SECURE_PATHS')
		self.api_path = getattr(settings, 'API_PATH')
		self.https_enabled = self.paths and getattr(settings, 'HTTPS_ENABLED')

	def process_request(self, request):
		if self.https_enabled and not request.is_secure():
			for path in self.paths:
				if request.get_full_path().startswith(path):
					request_url = request.build_absolute_uri(request.get_full_path())
					secure_url = request_url.replace('http://', 'https://')
					return HttpResponseRedirect(secure_url)

		# Skip the check if it's API end-point. API has its own authentication.
		if request.get_full_path().startswith(settings.DASHBOARD_URL + self.api_path):
			pass

		elif request.user.is_anonymous() and request.get_full_path().startswith(
						settings.DASHBOARD_URL + settings.LOGIN_URL):

			pass

		elif request.user.is_anonymous() and request.get_full_path().startswith(
						settings.DASHBOARD_URL + settings.PASSWORD_RESET_URL):
			pass

		elif request.user.is_anonymous() and request.get_full_path().startswith(
						settings.DASHBOARD_URL + settings.SIGNUP_URL):
			pass

		elif request.user.is_anonymous() and request.get_full_path().startswith(
						settings.DASHBOARD_URL + settings.INVITE_URL):
			pass

		elif request.user.is_anonymous() and request.get_full_path().startswith(settings.DASHBOARD_URL + '/docs'):
			pass

		elif request.user.is_anonymous() and request.get_full_path().startswith(settings.DASHBOARD_URL + '/static/'):
			pass

		elif request.user.is_anonymous() and request.get_full_path().startswith(settings.DASHBOARD_URL + '/admin'):
			pass

		elif request.user.is_anonymous() and request.get_full_path().startswith(settings.DASHBOARD_URL):

			return HttpResponseRedirect(settings.DASHBOARD_URL + settings.LOGIN_URL)

		elif request.user.is_authenticated() and request.get_full_path() == settings.DASHBOARD_URL + settings.LOGIN_URL:

			return HttpResponseRedirect(settings.DASHBOARD_URL + settings.HOME_URL)

		elif request.user.is_authenticated() and request.get_full_path() == settings.DASHBOARD_URL + settings.SIGNUP_URL:

			return HttpResponseRedirect(settings.DASHBOARD_URL + settings.HOME_URL)

		elif request.user.is_authenticated():

			pass
