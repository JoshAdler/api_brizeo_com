from django.contrib.auth.views import *
from django.shortcuts import render
from apps.dashboard.account.models import CoreAccount, CoreAccountStatus
from apps.dashboard.api.v1.utils.api_mail import *
from apps.models import *


def dashboard_logout(request):
	return logout_then_login(request, login_url=reverse('dashboard_login'))


def dashboard_reset(request):
	# if user is already logged in then redirect them to home
	if request.user.is_authenticated():
		return HttpResponseRedirect(reverse('home'))

	return render(request, 'dashboard/auth/reset/index.html', {
		'request': request,
	})


def dashboard_reset_successful(request):
	# if user is already logged in then redirect them to home
	if request.user.is_authenticated():
		return HttpResponseRedirect(reverse('home'))

	return render(request, 'dashboard/auth/reset/successful.html', {
		'request': request,
	})


def dashboard_reset_changed(request):
	# if user is already logged in then redirect them to home
	if request.user.is_authenticated():
		return HttpResponseRedirect(reverse('home'))

	return render(request, 'dashboard/auth/reset/changed.html', {
		'request': request,
	})


def dashboard_reset_verification(request, password_reset_token=''):
	if CoreAccount.objects.filter(password_reset_token__iexact=password_reset_token).exists():

		member = CoreAccount.objects.get(password_reset_token__iexact=password_reset_token)

		# lets check if token is valid
		if member.password_reset_token == password_reset_token:
			return render(request, 'dashboard/auth/reset/set_new_password.html', {
				'request': request,
				'password_reset_token': member.password_reset_token,
			})
	else:

		return render(request, 'dashboard/auth/reset/wrong_verification_code.html', {
			'request': request,
		})


def dashboard_login(request):
	if request.user.is_authenticated():
		return HttpResponseRedirect(reverse('home'))

	return render(request, 'dashboard/auth/login/index.html', {
		'request': request,
	})


def dashboard_signup(request):
	if request.user.is_authenticated():
		return HttpResponseRedirect(reverse('home'))

	return render(request, 'dashboard/auth/signup/index.html', {
		'request': request,
	})


def dashboard_signup_successful(request):
	if request.user.is_authenticated():
		return HttpResponseRedirect(reverse('home'))

	return render(request, 'dashboard/auth/signup/successful.html', {
		'request': request,
	})


def dashboard_signup_verification(request, email_verification_token=''):
	try:
		member = CoreAccount.objects.get(email_verification_token__exact=email_verification_token)

		app_settings = CoreSetting.objects.get(is_active=True)

		# lets check if token is valid
		if member.email_verification_token == email_verification_token:
			# and activate the account as well
			member.account.status = CoreAccountStatus.objects.get(code='active')
			member.account.save()

			member.email_verification_token = None
			member.phone_verification_code = None
			member.save()

			send_mail = SendEmail()

			send_mail.welcome_email(recipient=member.email, ACCOUNT_URL=app_settings.dashboard_url,
			                        FIRST_NAME=member.first_name, LAST_NAME=member.last_name)

			send_mail.robot_message(
				MESSAGE='Congratulations, a user %s %s with email (%s) confirmed their email address.' % (
					member.first_name, member.last_name, member.email))

			return render(request, 'dashboard/auth/signup/activated.html', {
				'request': request,
			})

	except CoreAccount.DoesNotExist:

		return render(request, 'dashboard/auth/signup/not_activated.html', {
			'request': request,
		})


def dashboard_email_change_verification(request, email_verification_token=''):
	if CoreAccount.objects.filter(email_verification_token__iexact=email_verification_token).exists():

		member = CoreAccount.objects.get(email_verification_token__iexact=email_verification_token)

		# lets check if token is valid
		if member.email_verification_token == email_verification_token:
			old_email = member.user.email

			member.user.email = member.temporary_email

			member.user.save()

			member.email_verification_token = None

			member.temporary_email = None

			member.save()

			mail = SendEmail()

			mail.email_change_confirmation(recipient=member.user.email,
			                               FIRST_NAME=member.user.first_name,
			                               LAST_NAME=member.user.last_name, OLD_EMAIL=old_email,
			                               NEW_EMAIL=member.user.email)

			return render(request, 'dashboard/auth/email/email_changed.html', {
				'request': request,
			})
	else:

		return render(request, 'dashboard/auth/email/not_valid_email_token.html', {
			'request': request,
		})
