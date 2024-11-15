#Constants for the game

FIELD_DIMS = 960 #field goes from -960 to 960, 0 is in the center (and its a square)

PADDLE_HEIGHT = FIELD_DIMS / 5;
PADDLE_WIDTH = PADDLE_HEIGHT / 9;
BALL_SIZE = PADDLE_HEIGHT / 10;

PADDLE_POSITION = FIELD_DIMS - PADDLE_WIDTH

BASE_BALL_SPEED = FIELD_DIMS / 160
MAX_BALL_SPEED_MULTIPLIER = 20
BALL_SPEED_INCREASE = MAX_BALL_SPEED_MULTIPLIER / 200
MAX_PADDLE_SPEED_MULTIPLIER = MAX_BALL_SPEED_MULTIPLIER / 20
BASE_PADDLE_SPEED = PADDLE_HEIGHT / 12

class GameObject:
	def __init__(self, x = 0, y = 0):
		self.x = x
		self.y = y
	
	def setPos(self, x, y)
		self.x = x
		self.y = y

	def move(vector)
		self.x += vector[0]
		self.y += vector[1]


def initGameState():
	paddle1 = GameObject(-PADDLE_POSITION, 0)
	paddle2 = GameObject(PADDLE_POSITION, 0)
	ball = GameObject(0, 0)
	ball.speed_x = BASE_BALL_SPEED
	ball.speed_y = 0
	player_inputs = [false, false, false, false]
	speed_multiplier = 1
	return {
		'paddle1': paddle1,
		'paddle2': paddle2,
		'ball': ball,
		'player_inputs': player_inputs,
		'speed_multiplier': speed_multiplier
	}

def reset(game_state, side = 1)
	game_state['paddle1'].set_position(-PADDLE_POSITION, 0)
    game_state['paddle2'].set_position(PADDLE_POSITION, 0)
    game_state['ball'].set_position(0, 0)
    game_state['ball'].speed_x = BASE_BALL_SPEED * side
    game_state['ball'].speed_y = 0
    game_state['speed_multiplier'] = 1