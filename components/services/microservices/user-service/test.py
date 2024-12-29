from service_runtime.remote_service import remote_service


AuthService = remote_service('auth-service')


print(AuthService.random_ass_method(name="john"))
