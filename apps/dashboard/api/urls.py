from django.conf.urls import url, include

urlpatterns = [

	# Dealer API URLs
	url(r'^api/', include([
		# Dealer API V1
		url(r'', include('apps.dashboard.api.v1.urls')),
	])),

]
