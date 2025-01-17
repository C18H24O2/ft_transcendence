from service_runtime.remote_service import remote_service, ServiceException


# print("\n\n\n")
#
#
# try:
#     print(AuthService.random_ass_method(name="john"))
# except ServiceException as e:
#     print("ServiceException catched:", e)

AuthService = remote_service('auth-service')

print("Is logged?", AuthService.is_logged(token="123"))
