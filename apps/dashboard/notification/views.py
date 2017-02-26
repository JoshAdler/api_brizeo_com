from django.shortcuts import render


def dashboard_notification(request):
	return render(request, 'dashboard/notification/index.html', {'request': request})
