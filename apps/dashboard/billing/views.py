from django.contrib.auth.views import *
from django.shortcuts import render


def billing(request):
	return render(request, 'dashboard/billing/index.html', {
		'request': request,
	})
