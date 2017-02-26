from rest_framework_swagger.renderers import OpenAPIRenderer, SwaggerUIRenderer
from rest_framework.decorators import api_view, renderer_classes, permission_classes
from rest_framework import response, schemas
from rest_framework.permissions import AllowAny
import coreapi


@api_view()
@renderer_classes([SwaggerUIRenderer, OpenAPIRenderer])
@permission_classes([AllowAny])
def schema_view(request):
    schema = coreapi.Document(
        title='Dealer APIs',
        url='https://api.example.org/',
        content={
            "Authentication": {
                'search': coreapi.Link(
                    url='/search/',
                    action='get',
                    fields=[
                        coreapi.Field(
                            name='from',
                            required=True,
                            location='query',
                            description='City name or airport code.'
                        ),
                        coreapi.Field(
                            name='to',
                            required=True,
                            location='query',
                            description='City name or airport code.'
                        ),
                        coreapi.Field(
                            name='date',
                            required=True,
                            location='query',
                            description='Flight date in "YYYY-MM-DD" format.'
                        )
                    ],
                    description='Return flight availability and prices.'),
                'search2': coreapi.Link(
                    url='/search/',
                    action='post',
                    fields=[
                        coreapi.Field(
                            name='from',
                            required=True,
                            location='query',
                            description='City name or airport code.'
                        ),
                        coreapi.Field(
                            name='to',
                            required=True,
                            location='query',
                            description='City name or airport code.'
                        ),
                        coreapi.Field(
                            name='date',
                            required=True,
                            location='query',
                            description='Flight date in "YYYY-MM-DD" format.'
                        )
                    ],
                    description='Return flight availability and prices.')
            },
            "Profile": {
                'profile_get': coreapi.Link(
                    url='/profile/',
                    action='get',
                    fields=[
                        coreapi.Field(
                            name='from',
                            required=True,
                            location='query',
                            description='City name or airport code.'
                        ),
                        coreapi.Field(
                            name='to',
                            required=True,
                            location='query',
                            description='City name or airport code.'
                        ),
                        coreapi.Field(
                            name='date',
                            required=True,
                            location='query',
                            description='Flight date in "YYYY-MM-DD" format.'
                        )
                    ],
                    description='Return flight availability and prices.'),
                'profile_update': coreapi.Link(
                    url='/profile/',
                    action='post',
                    fields=[
                        coreapi.Field(
                            name='from',
                            required=True,
                            location='query',
                            description='City name or airport code.'
                        ),
                        coreapi.Field(
                            name='to',
                            required=True,
                            location='query',
                            description='City name or airport code.'
                        ),
                        coreapi.Field(
                            name='date',
                            required=True,
                            location='query',
                            description='Flight date in "YYYY-MM-DD" format.'
                        )
                    ],
                    description='Return flight availability and prices.')
            }
        }
    )

    generator = schemas.SchemaGenerator(title='Dealer API')
    return response.Response(schema)
