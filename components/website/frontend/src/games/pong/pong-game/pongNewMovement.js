// @ts-check
import { PongGame } from './3dpong.js';
import { GameObject } from './pong-classes.js';

/**
 * @prop {String} paddle_name
 * @prop {[boolean, boolean]} key_values
 * @prop {PongGame} boundPong
 */
export class MovementProvider
{
	constructor(paddle_name = "paddle1", boundPong)
	{
		this.boundPong = boundPong;
		this.paddle_name = paddle_name;
		this.key_values = [false, false];
	}
	initMovement()
	{
		return;
	}
	destroyMovement()
	{
		return;
	}
	pollPlayer()
	{
		return;
	}
	resetPlayer()
	{
		return;
	}
}

/**
 * @prop {Object} key_map
 */
export class PlayerMovementProvider extends MovementProvider
{
	constructor(keymap, paddle_name, boundPong)
	{
		super(paddle_name, boundPong);
		if (typeof(keymap) == 'object')
		{
			this.keymap = keymap;
		}
		else
			this.keymap = {};
		this.keyDown = this.keyDown.bind(this);
		this.keyUp = this.keyUp.bind(this);
	}
	keyUp(event)
	{
		const moveIndex = this.keymap[event.keyCode];
		if (moveIndex !== undefined) {
			event.preventDefault();
			this.key_values[moveIndex] = false;
		}
	}
	keyDown(event)
	{
		const moveIndex = this.keymap[event.keyCode];
		if (moveIndex !== undefined) {
			event.preventDefault();
			this.key_values[moveIndex] = true;
		}
	}
	initMovement()
	{
		document.addEventListener('keydown', this.keyDown);
		document.addEventListener('keyup', this.keyUp);
	}
	destroyMovement()
	{
		document.removeEventListener('keydown', this.keyDown);
		document.removeEventListener('keyup', this.keyUp);
	}
}

/**
 * @prop {Number} polling_id
 * @prop {Array} current_representation
 */
export class AiMovementProvider extends MovementProvider
{
	constructor(paddle_name, boundPong)
	{
		super(paddle_name, boundPong);
		this.current_paddle_pos = 0;
		this.ball = new GameObject(null, 0, 0, 0);
		this.then = performance.now();
		this.last_update = performance.now();
	}
	initMovement()
	{
		this.last_update = performance.now();
		this.updateObjects();
	}
	updateObjects()
	{
		this.current_paddle_pos = this.boundPong.gameObjects[this.paddle_name].y;
		this.ball.x = this.boundPong.gameObjects.ball.x;
		this.ball.y = this.boundPong.gameObjects.ball.y;
		// @ts-ignore
		this.ball.speedX = this.boundPong.gameObjects.ball.speedX;
		// @ts-ignore
		this.ball.speedY = this.boundPong.gameObjects.ball.speedY;
		this.then = performance.now();
	}
	pollPlayer()
	{
		let now = performance.now();
		let deltaTime = now - this.then;
		this.then = now;

		if (now - this.last_update >= 1000)
		{
			this.last_update = now;
			this.updateObjects();
		}
		const speed = (this.boundPong.BASE_PADDLE_SPEED * (1 + ((this.boundPong.speedMult / this.boundPong.MAX_BALL_SPEED_MULTIPLIER) * this.boundPong.MAX_PADDLE_SPEED_MULTIPLIER)) * (deltaTime / 10));
		const limit = this.boundPong.height - this.boundPong.paddleHeight;
		
		if (this.key_values[0] == true)
		{
			this.current_paddle_pos -= speed;
			if (this.current_paddle_pos < -limit)
				this.current_paddle_pos = -limit;
		}
		if (this.key_values[1] == true)
		{
			this.current_paddle_pos += speed;
			if (this.current_paddle_pos > limit)
				this.current_paddle_pos = limit;
		}
		
		this.moveBall(deltaTime);

		let target_position = this.ball.y;
		if (target_position === this.current_paddle_pos )
		{
			target_position += (this.boundPong.paddleHeight / 10);
		}

		if (target_position < this.current_paddle_pos - this.boundPong.paddleHeight / 10)
		{
			this.key_values[0] = true;
			this.key_values[1] = false;
		}
		else if (target_position >= this.current_paddle_pos + this.boundPong.paddleHeight / 10)
		{
			this.key_values[1] = true;
			this.key_values[0] = false;
		}
		else
		{
			this.key_values[0] = false;
			this.key_values[1] = false;
		}

		
		//debug values
		// gameObjects.my_ball.setPos([this.ball.x, this.ball.y, 0]);
		// gameObjects.my_ball.speedX = this.ball.speedX;
		// gameObjects.my_ball.speedY = this.ball.speedY;
		// gameObjects.my_paddle.setPos([gameObjects.my_paddle.x, this.current_paddle_pos, 0]);
	}

	moveBall(deltaTime)
	{
		// @ts-ignore
		let movementX = this.boundPong.speedMult * this.ball.speedX * (deltaTime / 10);
		// @ts-ignore
		let movementY = this.boundPong.speedMult * this.ball.speedY * (deltaTime / 10);

		const steps = Math.ceil(Math.max(Math.abs(movementX), Math.abs(movementY)) / this.boundPong.ballSize);
		const stepX = movementX / steps;
		const stepY = movementY / steps;

		for (let i = 0; i < steps; i++)
		{
			this.ball.move([stepX, stepY, 0]);
			if (this.ballCollideFake()) {
				break;
			}
		}
	}

	ballCollideFake()
	{

		const limit = this.boundPong.width - (2 * this.boundPong.paddleWidth);
		const ballXSide = Math.abs(this.ball.x) + this.boundPong.ballSize;
		const ballYSide = Math.abs(this.ball.y) + this.boundPong.ballSize;

		if (ballXSide >= limit)
		{
			// @ts-ignore
			this.ball.speedX *= -1;
			return true;
		}
		if (ballYSide >= this.boundPong.height)
		{
			this.ball.setPos([this.ball.x, (this.boundPong.height - this.boundPong.ballSize) * Math.sign(this.ball.y), this.ball.z]);
			// @ts-ignore
			this.ball.speedY = -this.ball.speedY;
			return (true);
		}
		return (false);
	}

	resetPlayer()
	{
		this.then = performance.now();
		this.current_paddle_pos = 0;
		this.ball.setPos([0, 0, 0])
		// @ts-ignore
		this.ball.speedX = this.boundPong.gameObjects.ball.speedX;
		// @ts-ignore
		this.ball.speedY = this.boundPong.gameObjects.ball.speedY;
		this.key_values = [false, false];
	}
}
