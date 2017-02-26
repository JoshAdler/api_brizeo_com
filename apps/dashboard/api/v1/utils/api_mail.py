from post_office import mail


class SendEmail:
    def __init__(self):
        self.recipient = ''
        self.activation_token = ''

    @staticmethod
    def robot_message(MESSAGE=None, EMAIL='brizeo@devsmtp.com'):
        mail.send(
            [EMAIL],
            template='robot_message',
            context={
                'MESSAGE': MESSAGE,
            },
            priority='now',
        )

    @staticmethod
    def email_address_validation(recipient, ACTION_URL=None, FIRST_NAME=None, LAST_NAME=None):
        mail.send(
            [recipient],
            template='email_address_validation',
            context={
                'ACTION_URL': ACTION_URL,
                'FIRST_NAME': FIRST_NAME,
                'LAST_NAME': LAST_NAME,
            },
            priority='now',
        )

    @staticmethod
    def add_member_email_address_validation(recipient, ACTION_URL=None, ORG_NAME=None, FIRST_NAME=None,
                                            LAST_NAME=None):
        mail.send(
            [recipient],
            template='add_member_email_address_validation',
            context={
                'ACTION_URL': ACTION_URL,
                'ORG_NAME': ORG_NAME,
                'FIRST_NAME': FIRST_NAME,
                'LAST_NAME': LAST_NAME,
            },
            priority='now',
        )

    @staticmethod
    def password_reset(recipient, ACTION_URL=None, FIRST_NAME=None, LAST_NAME=None, IP_ADDRESS=None):
        mail.send(
            [recipient],
            template='password_reset',
            context={
                'ACTION_URL': ACTION_URL,
                'FIRST_NAME': FIRST_NAME,
                'LAST_NAME': LAST_NAME,
                'IP_ADDRESS': IP_ADDRESS,
            },
            priority='now',
        )

    @staticmethod
    def new_message(recipient, MESSAGE=None, ACTION_URL=None):
        mail.send(
            [recipient],
            template='new_message',
            context={
                'MESSAGE': MESSAGE,
                'ACTION_URL': '',
            },
            priority='now',
        )

    @staticmethod
    def email_change_request(recipient, ACTION_URL=None, FIRST_NAME=None, LAST_NAME=None,
                             OLD_EMAIL=None, NEW_EMAIL=None):
        mail.send(
            [recipient],
            template='email_change_request',
            context={
                'ACTION_URL': ACTION_URL,
                'FIRST_NAME': FIRST_NAME,
                'LAST_NAME': LAST_NAME,
                'OLD_EMAIL': OLD_EMAIL,
                'NEW_EMAIL': NEW_EMAIL,
                'IP': '',
            },
            priority='now',
        )

    @staticmethod
    def welcome_email(recipient, ACCOUNT_URL=None, USERNAME=None, FIRST_NAME=None, LAST_NAME=None):
        mail.send(
            [recipient],
            template='welcome_email',
            context={
                'ACCOUNT_URL': ACCOUNT_URL,
                'USERNAME': USERNAME,
                'FIRST_NAME': FIRST_NAME,
                'LAST_NAME': LAST_NAME,
            },
            priority='now',
        )

    @staticmethod
    def email_change_confirmation(recipient, FIRST_NAME=None, LAST_NAME=None,
                                  OLD_EMAIL=None, NEW_EMAIL=None):
        mail.send(
            [recipient],
            template='email_change_confirmation',
            context={
                'FIRST_NAME': FIRST_NAME,
                'LAST_NAME': LAST_NAME,
                'OLD_EMAIL': OLD_EMAIL,
                'NEW_EMAIL': NEW_EMAIL,
            },
            priority='now',
        )

    @staticmethod
    def plan_change_confirmation(recipient, PLAN_NAME=None, FIRST_NAME=None, LAST_NAME=None):
        mail.send(
            [recipient],
            template='plan_change_confirmation',
            context={
                'PLAN_NAME': PLAN_NAME,
                'FIRST_NAME': FIRST_NAME,
                'LAST_NAME': LAST_NAME,
            },
            priority='now',
        )
