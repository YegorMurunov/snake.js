let
	canvas             = document.getElementById('canvas'),
	ctx                = canvas.getContext('2d'),
	scoreBlock         = document.getElementById('score'),
	scoreCount         = 0,
	bestScoreBlock     = document.getElementById('best-score'),
	dir                = '', // направление змейки
	diff               = 'Easy', // difficulty
	diffBlock          = document.getElementById('difficulty'),
	btnChange          = document.getElementById('changeDif');

const config = { // главные настройки
	sizeCell: 24, // размер ячейки
	sizeFood: 24, // размер еды
	step: 0, // для прорисовки кадров
	stepMax: 7, // чем меньше тем быстрее прорисовка движений змейки
}

const snake = { // настройки змейки
	x: 24,
	y: 24,
	dirX: 0, // направление по оси X
	dirY: 0, // направление по оси Y
	body: [],
	maxBodySize: 1,
}
const snakeSkins = [ // массив со скинами змеи
	'./img/snake/head.svg',
];
const snakeImages = [
	imgHead = new Image(),
];
for ( let i = 0; i < snakeImages.length; i++ ) {
	snakeImages[i].src = snakeSkins[i];
}

const food = { // настройки еды
	x: randomInt(0, canvas.width / config.sizeCell) * config.sizeCell,
	y: randomInt(0, canvas.height / config.sizeCell) * config.sizeCell,
}
const images = [ // массив с путем к картинкам
	'./img/food/apple.svg',
	'./img/food/carrot.svg',
	'./img/food/eggplant.svg',
	'./img/food/banana.svg',
];
let img = new Image();
img.src = images[0]; // по умолчанию будет первая картинка

const bomb = { // настройки бомб
	x: -config.sizeCell, // изначально бомбы не будет видно
	y: -config.sizeCell,
};
const bombImg = new Image();
bombImg.src = './img/food/bomb.svg';

// аудио
const audio = [
	'./audio/eat.mp3',
	'./audio/turn.mp3',
	'./audio/dead.mp3',
];
const audioNames = [
	audioEat = new Audio(),
	audioTurn = new Audio(),
	audioDead = new Audio(),
];
for ( let i = 0; i < audio.length; i++ ) {
	audioNames[i].src = audio[i];
}

// настройки канваса по умолчани.
canvas.width = 600;
canvas.height = 480;
ctx.fillStyle = '#000000'
ctx.fillRect(0, 0, canvas.width, canvas.height);

// счет
function score() {
	scoreCount++;
	bestScore();
	if ( scoreCount > 15 ) config.stepMax = 5;
	drawScore();
}
function drawScore() {
	scoreBlock.innerHTML = scoreCount;
}
function bestScore() {
	if ( !localStorage.getItem('best score') ) {
		localStorage.setItem('best score', 0);
	}
	if ( scoreCount > localStorage.getItem('best score') ) {
		localStorage.setItem('best score', scoreCount);
	}
	bestScoreBlock.innerHTML = localStorage.getItem('best score');
}

// игра
function gameLoop() {

	requestAnimationFrame(gameLoop);

	if ( ++config.step < config.stepMax ) return;
	config.step = 0;


	ctx.clearRect(0, 0, canvas.width, canvas.height); // очистка canvas
	drawFood();
	drawSnake();
	if (diff === 'Hard') {
		ctx.strokeStyle = '#f00';
		ctx.lineWidth = 5;
		ctx.strokeRect(0, 0, canvas.width, canvas.height);
		drawBomb();
	};
}
gameLoop();

// сложности игры, рестарт
function checkBorder() { // функция выхода за поля
	// по x
	if ( snake.x < 0 ) {
		snake.x = canvas.width - config.sizeCell; // - config.sizeCell чтобы сразу была видна змейка
	} else if ( snake.x >= canvas.width ) {
		snake.x = 0;
	}
	// по y
	if ( snake.y < 0 ) {
		snake.y = canvas.height - config.sizeCell;
	} else if ( snake.y >= canvas.height ) {
		snake.y = 0;
	}
}

function withoutBorder() {
	if ( snake.x < 0 ) {
		audioPlay('dead');
		restart();
	} else if ( snake.x >= canvas.width ) {
		audioPlay('dead');
		restart();
	}
	if ( snake.y < 0 ) {
		audioPlay('dead');
		restart();
	} else if ( snake.y >= canvas.height ) {
		audioPlay('dead');
		restart();
	}
}

function restart() {
	config.stepMax = 6;
	scoreCount = 0;
	drawScore();

	snake.x = 24;
	snake.y = 24;
	snake.body = [];
	snake.maxBodySize = 1;
	snake.dirX = 0;
	snake.dirY = 0;
	dir = '';

	randomPosFood();
	if ( diff === 'Hard' ) randomPosBomb();
}


// рисование змейки
function drawSnake() {
	snake.x += snake.dirX;
	snake.y += snake.dirY;

	if (diff === 'Easy') checkBorder();
	if (diff === 'Hard') withoutBorder();

	// работа с длиной змейки
	snake.body.unshift({x: snake.x, y: snake.y}); // добовляем объект в тело змейки
	if ( snake.body.length > snake.maxBodySize ) { // если длина тело больше чем макс то удаляем одну часть
		snake.body.pop();
	}

	snake.body.forEach((e, index) => {

		snakeStyles(e, index); // стили змейки

		if ( e.x == food.x && e.y == food.y ) { // если змейка съела еду
			audioPlay('eat');
			score();
			randomPosFood();
			snake.maxBodySize++;

			if ( diff === 'Hard' ) {
				randomPosBomb();
			}
		}

		// проверка на сопрекасновение змейки с хвостом. Или бомбой если это хард
		for ( let i = index + 1; i < snake.body.length; i++ ) {
			if ( e.x === snake.body[i].x && e.y === snake.body[i].y ) {
				audioPlay('dead');
				restart();
			}
			if ( diff === 'Hard' ) {
				if ( e.x === bomb.x && e.y === bomb.y ) {
					audioPlay('dead');
					restart();
				}
			}
		}
	});
}
// стили змейки
function snakeStyles(e, index) {
	if ( index === 0 ) { // для первого эелемента тела змейки ( головы ), устанавливаем скин.
		ctx.drawImage(snakeImages[0], e.x, e.y);
	}
	else { // для остальных обычные квадраты
		ctx.fillStyle = '#093D14';
		ctx.strokeStyle = '#071510';
		ctx.lineWidth = 1;
		ctx.fillRect(e.x, e.y, config.sizeCell, config.sizeCell);
		ctx.strokeRect(e.x, e.y, config.sizeCell - 1, config.sizeCell - 1);
	}
}

// рисование еды
function drawFood() {
	ctx.drawImage(img, food.x, food.y);
}

// рисование бомб
function drawBomb() { // функция добовления бомбы
	ctx.drawImage(bombImg, bomb.x, bomb.y);
}

// Загрузка лучшего рекорда
document.addEventListener('load', bestScore());

// управление
document.addEventListener('keydown', (e) => {
	if ( e.keyCode == 87 || e.keyCode == 38 ) { // W (up) or arrow up
		if ( dir != 'down' ) {
			audioPlay('turn');
			dir = 'up';
			snake.dirY = -config.sizeCell;
			snake.dirX = 0;
		}
	}
	else if ( e.keyCode == 65 || e.keyCode == 37 ) { // A (left) or arrow left
		if ( dir != 'right' ) {
			audioPlay('turn');
			dir = 'left';
			snake.dirX = -config.sizeCell;
			snake.dirY = 0;
		}
	}
	else if ( e.keyCode == 83 || e.keyCode == 40 ) { // S (down) or arrow down
		if ( dir != 'up' ) {
			audioPlay('turn');
			dir = 'down';
			snake.dirY = config.sizeCell;
			snake.dirX = 0;
		}
	}
	else if ( e.keyCode == 68 || e.keyCode == 39 ) { // D (right) or arrow right
		if ( dir != 'left' ) {
			audioPlay('turn');
			dir = 'right';
			snake.dirX = config.sizeCell;
			snake.dirY = 0;
		}
	}
});


// смена сложности
btnChange.addEventListener('click', (e) => {
	if ( diff === 'Easy' ) {
		diff = 'Hard';
		diffBlock.innerHTML = 'Hard';
		restart();
	} else {
		diff = 'Easy';
		diffBlock.innerHTML = 'Easy';
		restart();
	}
});


// доп функции
function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min) + min);
}
function randomImg() { // выбор рандомной картинки
	let imgCount = randomInt(0, images.length);
	let imgPath = images[imgCount];
	img.src = imgPath;
	return img;
}

function randomPosFood() { // Рандомное появление еды
	ctx.drawImage(randomImg(), food.x, food.y);
	food.x = randomInt(0, canvas.width / config.sizeCell) * config.sizeCell;
	food.y = randomInt(0, canvas.height / config.sizeCell) * config.sizeCell;
	drawFood();
}

function randomPosBomb() { // Рандомное появление бомбы
	let chance = randomInt(1, 5); // шанс на выпод бомбы 1/5
	if ( chance === 3 ) {
		bomb.x = randomInt(0, canvas.width / config.sizeCell) * config.sizeCell;
		bomb.y = randomInt(0, canvas.height / config.sizeCell) * config.sizeCell;
		drawBomb();
	}
	else {
		bomb.x = -config.sizeCell;
		bomb.y = -config.sizeCell;
		drawBomb();
	}
}

function audioPlay(name) {
	if ( name === 'eat' ) {
		audioNames[0].play();
	}
	if ( name === 'turn' ) {
		audioNames[1].play();
	}
	if ( name === 'dead' ) {
		audioNames[2].play();
	}
}