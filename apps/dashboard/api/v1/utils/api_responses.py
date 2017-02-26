def response_signup_successful():
    response = dict()

    response['code'] = 'response_user_signup_successful'

    response['status'] = 'success'

    response['message'] = 'Signup successful. Check your email for next steps.'

    response['detail'] = 'Signup successful. Check your email for next steps.'

    return response


def response_signup_failed(errors=dict):
    response = dict()

    response['code'] = 'response_user_signup_failed'

    response['status'] = 'error'

    response['message'] = 'Signup failed. Please check the errors.'

    response['errors'] = errors

    response['detail'] = 'Signup failed. Please check the errors.'

    response['status_code'] = 400

    return response


def response_login_failed(errors=dict):
    response = dict()

    response['code'] = 'response_user_login_failed'

    response['status'] = 'error'

    response['message'] = 'Login failed. Please check the errors.'

    response['errors'] = errors

    response['detail'] = 'Login failed. Please check the errors.'

    response['status_code'] = 400

    return response


def response_profile_save_successful():
    response = dict()

    response['code'] = 'response_profile_save_successful'

    response['status'] = 'success'

    response['message'] = 'Profile Updated'

    response['detail'] = 'Profile Updated'

    return response


def response_account_save_successful():
    response = dict()

    response['code'] = 'response_account_save_successful'

    response['status'] = 'success'

    response['message'] = 'Account Updated'

    response['detail'] = 'Account Updated'

    return response


def response_image_uploaded():
    response = dict()

    response['code'] = 'response_image_uploaded'

    response['status'] = 'success'

    response['message'] = 'Image uploaded'

    response['detail'] = 'Image uploaded'

    return response


def response_invalid_image_format():
    response = dict()

    response['code'] = 'response_invalid_image_format'

    response['status'] = 'error'

    response['message'] = 'Invalid image type. Only .png, .jpeg and .jpg allowed'

    response['detail'] = 'Invalid image type. Only .png, .jpeg and .jpg allowed'

    return response


def response_verification_email_sent():
    response = dict()

    response['code'] = 'response_verification_email_sent'

    response['status'] = 'success'

    response['message'] = 'New verification email sent. Please check your email.'

    response['detail'] = 'New verification email sent. Please check your email.'

    return response


def response_not_user_found():
    response = dict()

    response['code'] = 'response_not_user_found'

    response['status'] = 'error'

    response['message'] = 'Sorry we are unable to find any user with this email address.'

    response['detail'] = 'Sorry we are unable to find any user with this email address.'

    return response


def response_profile_save_successful_and_email_change_requested():
    response = dict()

    response['code'] = 'response_profile_save_successful_and_email_change_requested'

    response['status'] = 'success'

    response['message'] = 'To activate your new email, please check your inbox and click verify email change.'

    response['detail'] = 'To activate your new email, please check your inbox and click verify email change.'

    return response


def response_password_update_successful():
    response = dict()

    response['code'] = 'response_password_update_successful'

    response['status'] = 'success'

    response['message'] = 'Password updated.'

    response['detail'] = 'Password updated.'

    return response


def response_profile_activation_successful():
    response = dict()

    response['code'] = 'response_profile_activation_successful'

    response['status'] = 'success'

    response['message'] = 'Profile activation successful'

    response['detail'] = 'Profile activation successful'

    return response


def response_profile_deactivated():
    response = dict()

    response['code'] = 'response_profile_deactivated'

    response['status'] = 'success'

    response['message'] = 'Profile deactivated'

    response['detail'] = 'Profile deactivated'

    return response


def response_profile_activation_failed():
    response = dict()

    response['code'] = 'response_profile_activation_failed'

    response['status'] = 'error'

    response['message'] = 'Profile activation failed'

    response['detail'] = 'Profile activation failed'

    return response


def response_profile_deactivation_failed():
    response = dict()

    response['code'] = 'response_profile_deactivation_failed'

    response['status'] = 'error'

    response['message'] = 'Profile deactivation failed.'

    response['detail'] = 'Profile deactivation failed.'

    return response


def response_stripe_connect_failed():
    response = dict()

    response['code'] = 'response_stripe_connect_failed'

    response['status'] = 'error'

    response['message'] = 'Stripe connect failed.'

    response['detail'] = 'Stripe connect failed.'

    return response


# when we are unable to update profile
def response_profile_save_failed():
    response = dict()

    response['code'] = 'response_profile_save_failed'

    response['status'] = 'error'

    response['message'] = 'Profile Update Failed'

    response['detail'] = 'Profile Update Failed'

    return response


def response_login_successful():
    response = dict()

    response['code'] = 'response_login_successful'

    response['status'] = 'success'

    response['message'] = 'Login Successful.'

    response['detail'] = 'Login Successful.'

    return response


def response_missing_fields():
    response = dict()

    response['code'] = 'response_missing_fields'

    response['status'] = 'error'

    response['message'] = 'Please fill all the required fields.'

    response['detail'] = 'Please fill all the required fields.'

    return response


def response_missing_fields(field=''):
    response = dict()

    response['code'] = 'response_missing_fields'

    response['status'] = 'error'

    response['message'] = 'Missing (%s) field.' % (field)

    response['detail'] = 'Missing (%s) field.' % (field)

    return response


def response_logout_successful():
    response = dict()

    response['code'] = 'response_logout_successful'

    response['status'] = 'success'

    response['message'] = 'Logout Successful'

    response['detail'] = 'Logout Successful'

    return response


def response_authentication_failed():
    response = dict()

    response['code'] = 'response_authentication_failed'

    response['status'] = 'error'

    response['message'] = 'Authentication Failed.'

    response['detail'] = 'Authentication Failed.'

    return response


def response_account_not_active():
    response = dict()

    response['code'] = 'response_account_not_active'

    response['status'] = 'error'

    response['message'] = 'Your account is not active. Please contact your organisation administrator.'

    response['detail'] = 'Your account is not active. Please contact your organisation administrator.'

    return response


def response_account_not_found():
    response = dict()

    response['code'] = 'response_account_not_found'

    response['status'] = 'error'

    response['message'] = 'Unable to find account with this email.'

    response['detail'] = 'Unable to find account with this email.'

    return response


def response_account_pending():
    response = dict()

    response['code'] = 'response_account_pending'

    response['status'] = 'error'

    response['message'] = 'Your account status is pending. Please contact your organisation administrator.'

    response['detail'] = 'Your account status is pending. Please contact your organisation administrator.'

    return response


def response_account_suspended():
    response = dict()

    response['code'] = 'response_account_suspended'

    response['status'] = 'error'

    response['message'] = 'Your account is suspended. Please contact your organisation administrator.'

    response['detail'] = 'Your account is suspended. Please contact your organisation administrator.'

    return response


def response_password_do_not_match():
    response = dict()

    response['code'] = 'response_password_do_not_match'

    response['status'] = 'error'

    response['message'] = 'Password do not match.'

    response['detail'] = 'Password do not match.'

    return response


def response_unable_to_add_new_user():
    response = dict()

    response['code'] = 'response_unable_to_add_new_user'

    response['status'] = 'error'

    response['message'] = 'Unable to register new user. Please try again.'

    response['detail'] = 'Unable to register new user. Please try again.'

    return response


def response_email_already_exists():
    response = dict()

    response['code'] = 'response_email_already_exists'

    response['status'] = 'error'

    response['message'] = 'Email already used by another member.'

    response['detail'] = 'Email already used by another member.'

    return response


def response_email_already_used_by_technician():
    response = dict()

    response['code'] = 'response_email_already_used_by_technician'

    response['status'] = 'error'

    response['message'] = 'Email already used by another technician.'

    response['detail'] = 'Email already used by another technician.'

    return response


def response_username_already_exists():
    response = dict()

    response['code'] = 'response_username_already_exists'

    response['status'] = 'error'

    response['message'] = 'Username already used by another member.'

    response['detail'] = 'Username already used by another member.'

    return response


def response_website_url_not_valid():
    response = dict()

    response['code'] = 'response_website_url_not_valid'

    response['status'] = 'error'

    response['message'] = 'Please use a valid website url.'

    response['detail'] = 'Please use a valid website url.'

    return response


def response_invalid_phone_number():
    response = dict()

    response['code'] = 'response_invalid_phone_number'

    response['status'] = 'error'

    response['message'] = 'Invalid phone number in your profile. Use this format +19051112222'

    response['detail'] = 'Invalid phone number in your profile. Use this format +19051112222'

    return response


def response_no_phone_number():
    response = dict()

    response['code'] = 'response_no_phone_number'

    response['status'] = 'error'

    response['message'] = 'You must add a valid phone number in your profile first.  Use this format +19051112222'

    response['detail'] = 'You must add a valid phone number in your profile first.  Use this format +19051112222'

    return response


def response_invalid_email_address():
    response = dict()

    response['code'] = 'response_invalid_email_address'

    response['status'] = 'error'

    response['message'] = 'Invalid email address.'

    response['detail'] = 'Invalid email address.'

    return response


def response_sms_notifications_require_phone():
    response = dict()

    response['code'] = 'response_sms_notifications_require_phone'

    response['status'] = 'error'

    response['message'] = 'To enable SMS notification please add primary phone number.'

    response['detail'] = 'To enable SMS notification please add primary phone number.'

    return response


def response_phone_verification_code_required():
    response = dict()

    response['code'] = 'response_phone_verification_code_required'

    response['status'] = 'error'

    response['message'] = 'Please provide phone verification code.'

    response['detail'] = 'Please provide phone verification code.'

    return response


def response_email_address_not_valid():
    response = dict()

    response['code'] = 'response_email_address_not_valid'

    response['status'] = 'error'

    response['message'] = 'Please use valid email address.'

    response['detail'] = 'Please use valid email address.'

    return response


def response_please_accept_the_terms():
    response = dict()

    response['code'] = 'accept_the_terms'

    response['status'] = 'error'

    response['message'] = 'Please accept Terms of Services.'

    response['detail'] = 'Please accept Terms of Services.'

    return response


def response_unable_to_get_account_details_from_kazoo():
    response = dict()

    response['code'] = 'response_unable_to_get_account_details_from_kazoo'

    response['status'] = 'error'

    response['message'] = 'Unable to your account details. Please try again.'

    response['detail'] = 'Unable to your account details. Please try again.'

    return response


def response_card_added_successfully():
    response = dict()

    response['code'] = 'response_card_added_successfully'

    response['status'] = 'success'

    response['message'] = 'Credit card added successfully.'

    response['detail'] = 'Credit card added successfully.'

    return response


def response_phone_verification_successful():
    response = dict()

    response['code'] = 'response_phone_verification_successful'

    response['status'] = 'success'

    response['message'] = 'Phone verification successful.'

    response['detail'] = 'Phone verification successful.'

    return response


def response_phone_verification_failed():
    response = dict()

    response['code'] = 'response_phone_verification_failed'

    response['status'] = 'error'

    response['message'] = 'Phone verification failed.'

    response['detail'] = 'Phone verification failed.'

    return response


def response_contact_deleted_successfully():
    response = dict()

    response['code'] = 'response_contact_deleted_successfully'

    response['status'] = 'success'

    response['message'] = 'Contact deleted successfully.'

    response['detail'] = 'Contact deleted successfully.'

    return response


def response_contact_add_successful():
    response = dict()

    response['code'] = 'response_contact_add_successful'

    response['status'] = 'success'

    response['message'] = 'New contact added successfully.'

    response['detail'] = 'New contact added successfully.'

    return response


def response_contact_already_exists():
    response = dict()

    response['code'] = 'response_contact_already_exists'

    response['status'] = 'error'

    response['message'] = 'Contact with same email already exists.'

    response['detail'] = 'Contact with same email already exists.'

    return response


def response_contact_update_successful():
    response = dict()

    response['code'] = 'response_contact_update_successful'

    response['status'] = 'success'

    response['message'] = 'Contact updated successfully.'

    response['detail'] = 'Contact updated successfully.'

    return response


def response_group_deleted_successfully():
    response = dict()

    response['code'] = 'response_group_deleted_successfully'

    response['status'] = 'success'

    response['message'] = 'Group deleted successfully.'

    response['detail'] = 'Group deleted successfully.'

    return response


def response_group_add_successful():
    response = dict()

    response['code'] = 'response_group_add_successful'

    response['status'] = 'success'

    response['message'] = 'New group added successfully.'

    response['detail'] = 'New group added successfully.'

    return response


def response_group_update_successful():
    response = dict()

    response['code'] = 'response_group_update_successful'

    response['status'] = 'success'

    response['message'] = 'Group updated successfully.'

    response['detail'] = 'Group updated successfully.'

    return response


def response_group_update_failed():
    response = dict()

    response['code'] = 'response_group_update_failed'

    response['status'] = 'error'

    response['message'] = 'Group Update Failed.'

    response['detail'] = 'Group Update Failed.'

    return response


def response_username_do_not_exist():
    response = dict()

    response['code'] = 'response_username_do_not_exist'

    response['status'] = 'error'

    response['message'] = 'Unable to find username.'

    response['detail'] = 'Unable to find username.'

    return response


def response_email_do_not_exist():
    response = dict()

    response['code'] = 'response_email_do_not_exist'

    response['status'] = 'error'

    response['message'] = 'Unable to find email address.'

    response['detail'] = 'Unable to find email address.'

    return response


def response_account_no_activated():
    response = dict()

    response['code'] = 'response_account_no_activated'

    response['status'] = 'error'

    response['message'] = 'Your account not activated. Please verify your account first.'

    response['detail'] = 'Your account not activated. Please verify your account first.'

    return response


def response_user_exists_with_same_email():
    response = dict()

    response['code'] = 'response_user_exists_with_same_email'

    response['status'] = 'error'

    response['message'] = 'User exists with same email. Please use different email.'

    response['detail'] = 'User exists with same email. Please use different email.'

    return response


def response_email_address_already_used():
    response = dict()

    response['code'] = 'response_email_address_already_used'

    response['status'] = 'error'

    response['message'] = 'User exists with same email. Please use different email.'

    response['detail'] = 'User exists with same email. Please use different email.'

    return response


def response_member_doesnot_belong_to_org():
    response = dict()

    response['code'] = 'response_member_doesnot_belong_to_org'

    response['status'] = 'error'

    response['message'] = 'Member doesn\'t belong to this account.'

    response['detail'] = 'Member doesn\'t belong to this account.'

    return response


def response_you_cannot_delete_your_account():
    response = dict()

    response['code'] = 'response_you_cannot_delete_your_account'

    response['status'] = 'error'

    response['message'] = 'Sorry you can\'t delete your own account.'

    response['detail'] = 'Sorry you can\'t delete your own account.'

    return response


def response_service_exists_with_same_code():
    response = dict()

    response['code'] = 'response_service_exists_with_same_code'

    response['status'] = 'error'

    response['message'] = 'Product exists with same code.'

    response['detail'] = 'User exists with same email.'

    return response


def response_password_reset():
    response = dict()

    response['code'] = 'response_password_reset'

    response['status'] = 'success'

    response['message'] = 'Please check your email for password reset email.'

    response['detail'] = 'Please check your email for password reset email.'

    return response


def response_passwords_not_same():
    response = dict()

    response['code'] = 'response_passwords_not_same'

    response['status'] = 'error'

    response['message'] = 'Passwords does not match.'

    response['detail'] = 'Passwords does not match.'

    return response


def response_password_updated():
    response = dict()

    response['code'] = 'response_password_updated'

    response['status'] = 'success'

    response['message'] = 'Password reset successful.'

    response['detail'] = 'Password reset successful.'

    return response


def response_member_add_successful():
    response = dict()

    response['code'] = 'response_user_add_successful'

    response['status'] = 'success'

    response['message'] = 'New member added.'

    response['detail'] = 'New member added.'

    return response


def response_member_update_successful():
    response = dict()

    response['code'] = 'response_member_update_successful'

    response['status'] = 'success'

    response['message'] = 'Member updated.'

    response['detail'] = 'Member updated.'

    return response


def response_member_location_updated():
    response = dict()

    response['code'] = 'response_member_location_updated'

    response['status'] = 'success'

    response['message'] = 'Member location updated.'

    response['detail'] = 'Member location updated.'

    return response


"""""""""
Common
"""""""""


def response_action_failed(errors=dict):
    response = dict()

    response['code'] = 'response_action_failed'

    response['status'] = 'error'

    response['message'] = 'Action failed. Please check the errors.'

    response['errors'] = errors

    response['detail'] = 'Action failed. Please check the errors.'

    response['status_code'] = 400

    return response


"""""""""
Radio
"""""""""


def response_radio_added():
    response = dict()

    response['code'] = 'response_radio_added'

    response['status'] = 'success'

    response['message'] = 'New radio added.'

    response['detail'] = 'New radio added.'

    return response


def response_radio_delete():
    response = dict()

    response['code'] = 'response_radio_delete'

    response['status'] = 'success'

    response['message'] = 'radio deleted.'

    response['detail'] = 'radio deleted.'

    return response


def response_radio_updated():
    response = dict()

    response['code'] = 'response_radio_updated'

    response['status'] = 'success'

    response['message'] = 'radio updated.'

    response['detail'] = 'radio updated.'

    return response


"""""""""
Profile
"""""""""


def response_profile_added():
    response = dict()

    response['code'] = 'response_profile_added'

    response['status'] = 'success'

    response['message'] = 'New profile added.'

    response['detail'] = 'New profile added.'

    return response


def response_profile_delete():
    response = dict()

    response['code'] = 'response_profile_delete'

    response['status'] = 'success'

    response['message'] = 'Profile deleted.'

    response['detail'] = 'Profile deleted.'

    return response


def response_profile_updated():
    response = dict()

    response['code'] = 'response_profile_updated'

    response['status'] = 'success'

    response['message'] = 'Profile updated.'

    response['detail'] = 'Profile updated.'

    return response


def response_password_updated():
    response = dict()

    response['code'] = 'response_password_updated'

    response['status'] = 'success'

    response['message'] = 'Password updated.'

    response['detail'] = 'Password updated.'

    return response


def response_token_updated():
    response = dict()

    response['code'] = 'response_token_updated'

    response['status'] = 'success'

    response['message'] = 'Token updated.'

    response['detail'] = 'Token updated.'

    return response


"""""""""
Member
"""""""""


def response_member_added():
    response = dict()

    response['code'] = 'response_member_added'

    response['status'] = 'success'

    response['message'] = 'New member added.'

    response['detail'] = 'New member added.'

    return response


def response_member_delete():
    response = dict()

    response['code'] = 'response_member_delete'

    response['status'] = 'success'

    response['message'] = 'member deleted.'

    response['detail'] = 'member deleted.'

    return response


def response_member_updated():
    response = dict()

    response['code'] = 'response_member_updated'

    response['status'] = 'success'

    response['message'] = 'member updated.'

    response['detail'] = 'member updated.'

    return response


"""""""""
Account
"""""""""


def response_account_added():
    response = dict()

    response['code'] = 'response_account_added'

    response['status'] = 'success'

    response['message'] = 'New account added.'

    response['detail'] = 'New account added.'

    return response


def response_account_delete():
    response = dict()

    response['code'] = 'response_account_delete'

    response['status'] = 'success'

    response['message'] = 'account deleted.'

    response['detail'] = 'account deleted.'

    return response


def response_account_updated():
    response = dict()

    response['code'] = 'response_account_updated'

    response['status'] = 'success'

    response['message'] = 'account updated.'

    response['detail'] = 'account updated.'

    return response


"""""""""
Inventory
"""""""""


def response_inventory_imported():
    response = dict()

    response['code'] = 'response_inventory_imported'

    response['status'] = 'success'

    response['message'] = 'New inventory imported.'

    response['detail'] = 'New inventory imported.'

    return response


def response_inventory_added():
    response = dict()

    response['code'] = 'response_inventory_added'

    response['status'] = 'success'

    response['message'] = 'New inventory added.'

    response['detail'] = 'New inventory added.'

    return response


def response_inventory_submitted():
    response = dict()

    response['code'] = 'response_inventory_submitted'

    response['status'] = 'success'

    response['message'] = 'New inventory submitted.'

    response['detail'] = 'New inventory submitted.'

    return response


def response_inventory_canceled():
    response = dict()

    response['code'] = 'response_inventory_canceled'

    response['status'] = 'success'

    response['message'] = 'Inventory review process is cancelled'

    response['detail'] = 'Inventory review process is cancelled'

    return response


def response_inventory_deleted():
    response = dict()

    response['code'] = 'response_inventory_deleted'

    response['status'] = 'success'

    response['message'] = 'Inventory deleted.'

    response['detail'] = 'Inventory deleted.'

    return response


def response_inventory_updated():
    response = dict()

    response['code'] = 'response_inventory_updated'

    response['status'] = 'success'

    response['message'] = 'Inventory updated.'

    response['detail'] = 'Inventory updated.'

    return response


"""""""""
Media
"""""""""


def response_media_added():
    response = dict()

    response['code'] = 'response_media_added'

    response['status'] = 'success'

    response['message'] = 'New media added.'

    response['detail'] = 'New media added.'

    return response


def response_media_deleted():
    response = dict()

    response['code'] = 'response_media_deleted'

    response['status'] = 'success'

    response['message'] = 'Media deleted.'

    response['detail'] = 'Media deleted.'

    return response


def response_media_updated():
    response = dict()

    response['code'] = 'response_media_updated'

    response['status'] = 'success'

    response['message'] = 'Media updated.'

    response['detail'] = 'Media updated.'

    return response


def response_media_not_supported():
    response = dict()

    response['code'] = 'response_media_not_supported'

    response['status'] = 'error'

    response['message'] = 'Media type not supported'

    response['detail'] = 'Media type not supported'

    return response


"""""""""
Store Logo
"""""""""


def response_store_logo_added():
    response = dict()

    response['code'] = 'response_store_logo_added'

    response['status'] = 'success'

    response['message'] = 'New store logo added.'

    response['detail'] = 'New store logo added.'

    return response


def response_store_logo_deleted():
    response = dict()

    response['code'] = 'response_store_logo_deleted'

    response['status'] = 'success'

    response['message'] = 'Store logo deleted.'

    response['detail'] = 'Store logo deleted.'

    return response


def response_store_logo_updated():
    response = dict()

    response['code'] = 'response_store_logo_updated'

    response['status'] = 'success'

    response['message'] = 'Store logo updated.'

    response['detail'] = 'Store logo updated.'

    return response


def response_store_logo_not_supported():
    response = dict()

    response['code'] = 'response_store_logo_not_supported'

    response['status'] = 'error'

    response['message'] = 'Store logo type not supported'

    response['detail'] = 'Store logo type not supported'

    return response


"""""""""
Business Logo
"""""""""


def response_business_logo_added():
    response = dict()

    response['code'] = 'response_business_logo_added'

    response['status'] = 'success'

    response['message'] = 'New business logo added.'

    response['detail'] = 'New business logo added.'

    return response


def response_business_logo_deleted():
    response = dict()

    response['code'] = 'response_business_logo_deleted'

    response['status'] = 'success'

    response['message'] = 'Business logo deleted.'

    response['detail'] = 'Business logo deleted.'

    return response


def response_business_logo_updated():
    response = dict()

    response['code'] = 'response_business_logo_updated'

    response['status'] = 'success'

    response['message'] = 'Business logo updated.'

    response['detail'] = 'Business logo updated.'

    return response


def response_business_logo_not_supported():
    response = dict()

    response['code'] = 'response_business_logo_not_supported'

    response['status'] = 'error'

    response['message'] = 'Business logo type not supported'

    response['detail'] = 'Business logo type not supported'

    return response


"""""""""
App Setup
"""""""""


def response_setup_successful():
    response = dict()

    response['code'] = 'response_setup_successful'

    response['status'] = 'success'

    response['message'] = 'Setup Successful.'

    response['detail'] = 'Setup Successful.'

    return response
