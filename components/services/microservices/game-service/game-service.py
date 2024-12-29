from service_runtime import Service, ServiceQueue
import pong_game_thread as pong
import threading

class GameService(Service):
	def __init__(self):
		super().__init__("game-service", ServiceQueue())
		assert self.queue is not None

		#declare a queue for matchmaking and an exchange for routing to single thread queues?
		self.queue_id = self.queue.declare_queue("pong-matchmaking")
		
		#TODO declare game-service exchange

		self.queue.add_consumer(self.queue_id, self.new_game_lobby)
	def new_game_lobby(self, lobby_id):
		print("Game lobby {lobby_id} created")
		game_thread = threading.Thread(target=pong.game_loop, name="game_{lobby_id}", args={lobby_id})

		game_thread.start()
	def launch(self):
		self.queue.consume()
