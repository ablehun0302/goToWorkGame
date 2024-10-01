const readline = require('readline');

// 게임 설정
const WIDTH = 20;
const HEIGHT = 15;
const PLAYER = 'P';
const EMPTY = ' ';

// 게임 상태
let playerPos = Math.floor(WIDTH / 2);
let numbers = [];
let score = 0;
let gameOver = false;
let targetSum = 0;
let currentSum = 0;

// 키 입력 설정
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

// 새로운 목표 숫자 설정
function setNewTarget() {
  targetSum = Math.floor(Math.random() * 20) + 1; // 1부터 20까지의 랜덤 숫자
  currentSum = 0;
}

// 게임 보드 생성
function createBoard() {
  let board = Array(HEIGHT).fill().map(() => Array(WIDTH).fill(EMPTY));
  board[HEIGHT - 1][playerPos] = PLAYER;
  numbers.forEach(num => {
    if (num.y < HEIGHT) {
      board[num.y][num.x] = num.value.toString();
    }
  });
  return board;
}

// 게임 보드 출력
function printBoard(board) {
  console.clear();
  console.log(`점수: ${score} | 목표 숫자: ${targetSum} | 현재 숫자: ${currentSum}`);
  console.log('┌' + '─'.repeat(WIDTH) + '┐');
  board.forEach(row => {
    console.log('│' + row.join('') + '│');
  });
  console.log('└' + '─'.repeat(WIDTH) + '┘');
  console.log('이동: ← →  |  게임 종료: Q');
}

// 숫자 생성
function createNumber() {
  numbers.push({
    x: Math.floor(Math.random() * WIDTH),
    y: 0,
    value: Math.floor(Math.random() * 9) + 1 // 1부터 9까지의 랜덤 숫자
  });
}

// 게임 상태 업데이트
function updateGame() {
  // 숫자 이동
  numbers = numbers.map(num => ({ ...num, y: num.y + 1 })).filter(num => num.y < HEIGHT);

  // 충돌 검사
  const collidedNumber = numbers.find(num => num.x === playerPos && num.y === HEIGHT - 1);
  if (collidedNumber) {
    currentSum += collidedNumber.value;
    numbers = numbers.filter(num => num !== collidedNumber); // 충돌한 숫자 제거

    if (currentSum === targetSum) {
      score++;
      setNewTarget();
    } else if (currentSum > targetSum) {
      gameOver = true;
    }
  }

  // 새 숫자 생성
  if (Math.random() < 0.3) { // 30% 확률로 새 숫자 생성
    createNumber();
  }
}

// 게임 루프
function gameLoop() {
  if (!gameOver) {
    updateGame();
    const board = createBoard();
    printBoard(board);
    setTimeout(gameLoop, 200);
  } else {
    console.clear();
    console.log(`게임 종료! 당신의 점수는: ${score}`);
    console.log(`당신의 목표 숫자는 ${targetSum} 이지만, 당신은 ${currentSum} 만큼 모았습니다.`);
    console.log('다시 시도한다면 R 키를, 게임을 종료한다면 Q키를 누르세요.');
    process.exit();
  }
}

// 키 입력 처리
process.stdin.on('keypress', (str, key) => {
  if (key.name === 'q') {
    process.exit();
  } else if (key.name === 'left' && playerPos > 0) {
    playerPos--;
  } else if (key.name === 'right' && playerPos < WIDTH - 1) {
    playerPos++;
  }
});

// 게임 시작
console.log('숫자 모으기 게임 - 아무 키를 눌러 게임 시작');
process.stdin.once('data', () => {
  setNewTarget();
  createNumber();
  gameLoop();
});