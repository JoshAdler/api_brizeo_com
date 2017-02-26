from django.shortcuts import render


def home(request):
    return render(request, 'dashboard/home/index.html', {'request': request})
