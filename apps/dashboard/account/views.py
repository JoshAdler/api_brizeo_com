from django.shortcuts import render


def dashboard_account(request):
    return render(request, 'dashboard/account/index.html', {'request': request})
