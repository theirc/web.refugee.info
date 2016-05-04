from django.shortcuts import redirect


def redirect_to_home(request):
    return redirect('/')
