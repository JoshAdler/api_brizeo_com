from django.conf import settings
from django.http import HttpResponseRedirect


class RedirectMiddleware(object):
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

		if request.user.is_authenticated():
			if request.get_full_path().startswith(settings.ADMIN_URL) \
					or request.get_full_path().startswith(settings.DASHBOARD_URL) \
					or request.get_full_path().startswith(settings.USER_URL) \
					or request.get_full_path().startswith(settings.TRADER_URL):

				if hasattr(request.user, 'admin_member') and request.get_full_path().startswith(
						settings.ADMIN_URL) is False:
					return HttpResponseRedirect(settings.ADMIN_URL)

				elif hasattr(request.user, 'memebr') and request.get_full_path().startswith(
						settings.DASHBOARD_URL) is False:
					return HttpResponseRedirect(settings.DASHBOARD_URL)
