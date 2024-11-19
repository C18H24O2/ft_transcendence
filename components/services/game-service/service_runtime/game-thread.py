import time
import math

#Constants for the game

FIELD_DIMS = 960 #field goes from -960 to 960, 0 is in the center (and its a square)

PADDLE_HEIGHT = FIELD_DIMS / 5
PADDLE_WIDTH = PADDLE_HEIGHT / 9
BALL_SIZE = PADDLE_HEIGHT / 10

PADDLE_POSITION = FIELD_DIMS - PADDLE_WIDTH
PADDLE_LIMITS = FIELD_DIMS - PADDLE_HEIGHT

BASE_BALL_SPEED = FIELD_DIMS / 160
MAX_BALL_SPEED_MULTIPLIER = 20
BALL_SPEED_INCREASE = MAX_BALL_SPEED_MULTIPLIER / 200
MAX_PADDLE_SPEED_MULTIPLIER = MAX_BALL_SPEED_MULTIPLIER / 20
BASE_PADDLE_SPEED = PADDLE_HEIGHT / 12

class GameObject:
	def __init__(self, x = 0, y = 0):
		self.x = x
		self.y = y
	
	def setPos(self, x, y):
		self.x = x
		self.y = y

	def move(self, vector):
		self.x += vector[0]
		self.y += vector[1]


def initGameState():
	paddle1 = GameObject(-PADDLE_POSITION, 0)
	paddle2 = GameObject(PADDLE_POSITION, 0)
	ball = GameObject(0, 0)
	ball.speed_x = BASE_BALL_SPEED
	ball.speed_y = 0
	player_inputs = [False, False, False, False]
	speed_multiplier = 1
	return {
		'paddle1': paddle1,
		'paddle2': paddle2,
		'ball': ball,
		'player_inputs': player_inputs,
		'speed_multiplier': speed_multiplier
	}

def reset(game_state, side = 1):
	game_state['paddle1'].set_position(-PADDLE_POSITION, 0)
	game_state['paddle2'].set_position(PADDLE_POSITION, 0)
	game_state['ball'].set_position(0, 0)
	game_state['ball'].speed_x = BASE_BALL_SPEED * side
	game_state['ball'].speed_y = 0
	game_state['speed_multiplier'] = 1

def movePlayers(game_state, delta_time):
	speed = (BASE_PADDLE_SPEED * (1 + ((game_state['speed_multiplier'] / MAX_BALL_SPEED_MULTIPLIER) * MAX_PADDLE_SPEED_MULTIPLIER)) * (delta_time / 10))
	player_inputs = game_state['player_inputs']
	if (player_inputs[0] ^ player_inputs[1]):
		if (player_inputs[0] and game_state['paddle1'].y > -PADDLE_LIMITS):
			paddle = game_state['paddle1']
			paddle.move([0, -speed])
			if (paddle.y < -PADDLE_LIMITS):
				paddle.setPos(paddle.x, -PADDLE_LIMITS)
		if (player_inputs[1] and game_state['paddle1'].y < PADDLE_LIMITS):
			paddle = game_state['paddle1']
			paddle.move([0, speed])
			if (paddle.y > PADDLE_LIMITS):
				paddle.setPos(paddle.x, PADDLE_LIMITS)
	if (player_inputs[2] ^ player_inputs[3]):
		if (player_inputs[2] and game_state['paddle2'].y >= -PADDLE_LIMITS):
			paddle = game_state['paddle2']
			paddle.move([0, -speed])
			if (paddle.y < -PADDLE_LIMITS):
				paddle.setPos(paddle.x, -PADDLE_LIMITS)
		if (player_inputs[3] and game_state['paddle2'].y < PADDLE_LIMITS):
			paddle = game_state['paddle2']
			paddle.move([0, speed])
			if (paddle.y > PADDLE_LIMITS):
				paddle.setPos(paddle.x, PADDLE_LIMITS)

def bounding_box(x, y, width, height):
	minX = x - width
	maxX = x + width
	minY = y - height
	maxY = y + height
	return {minX, minY, maxX, maxY}

def boundingBoxCollide(bBoxA, bBoxB):
	A_Left_B = bBoxA.maxX < bBoxB.minX
	A_Right_B = bBoxA.minX > bBoxB.maxX
	A_Above_B = bBoxA.maxY < bBoxB.minY
	A_Below_B = bBoxA.minY > bBoxB.maxY
	return not (A_Left_B or A_Right_B or A_Above_B or A_Below_B)

def ballCollide(game_state):
	ball = game_state('ball')

	if (ball.speed_x < 0):
		paddle = game_state['paddle1']
	else:
		paddle = game_state['paddle2']

	limit = FIELD_DIMS - (2 * PADDLE_WIDTH);
	ballXSide = abs(ball.x) + BALL_SIZE;
	ballYSide = abs(ball.y) + BALL_SIZE;

	if (ballXSide >= limit):
		ballBoundingBox = bounding_box(ball.x, ball.y, BALL_SIZE, BALL_SIZE)
		paddleBoundingBox = bounding_box(paddle.x, paddle.y, PADDLE_WIDTH, PADDLE_HEIGHT)

		if (boundingBoxCollide(ballBoundingBox, paddleBoundingBox)):
			ball.setPos((limit - BALL_SIZE) * math.copysign(1, ball.x), ball.y);
			ball.speed_x = -ball.speed_x;

			relBallY = ball.y - paddle.y;
			nrmlrelBallY = relBallY / (PADDLE_HEIGHT + BALL_SIZE);

			maxAngle = math.pi * 5 / 12;
			angle = nrmlrelBallY * maxAngle;
			speed = math.sqrt(ball.speed_x ** 2 + ball.speed_y ** 2);

			ball.speed_x = speed * math.cos(angle) * math.copysign(1, ball.speed_x);
			ball.speed_y = speed * math.sin(angle);

			if (speedMult < MAX_BALL_SPEED_MULTIPLIER):
				speedMult = min(speedMult + BALL_SPEED_INCREASE, MAX_BALL_SPEED_MULTIPLIER);
			return True
	if (ballYSide >= FIELD_DIMS):
		ball.setPos(ball.x, (FIELD_DIMS - BALL_SIZE) * math.copysign(1, ball.y))
		ball.speed_y = -ball.speed_y
		return True
	return False

def moveBall(game_state, delta_time):
	ball = game_state['ball']
	movement_x = game_state['speed_multiplier'] * ball.speed_x * (delta_time / 10);
	movement_y = game_state['speed_multiplier'] * ball.speed_y * (delta_time / 10);

	steps = math.ceil(max(abs(movement_x), abs(movement_y)) / BALL_SIZE);
	step_x = movement_x / steps;
	step_y = movement_y / steps;

	for i in range(steps):
		ball.move([step_x, step_y])
		if ballCollide(game_state):
			break ;

def checkGoal(game_state):
	ball = game_state['ball']	
	if (ball.x < -FIELD_DIMS or ball.x > FIELD_DIMS):
		if (ball.x < -FIELD_DIMS):
			game_state['paddle2'].score += 1
			reset(-1)
		if (ball.x > FIELD_DIMS):
			game_state['paddle1'].score += 1
			reset(1)

def game_loop():
	game_state = initGameState()
	then = time.time()

	#probs need to setup client - server connexion

	while True:
		now = time.time()
		delta_time = now = then
		then = now

		#Game Logic
		movePlayers(game_state, delta_time)
		moveBall(game_state, delta_time)
		checkGoal(game_state)

		#something to sync clients?
		
