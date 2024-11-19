from service_runtime import Service, ServiceQueue
from threading import Thread

class GameService(Service):
	def __init__(self):
		super().__init__("game-service", ServiceQueue())
		assert self.queue is not None

		self.queue_id = self.queue.declare_queue("game")
	def new_game_lobby(self, lobby_id):
		