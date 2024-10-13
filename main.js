const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
});

process.stdin.setRawMode(true);
process.stdin.resume();

// 게임 중 여부를 체크하는 변수
let isGameRunning = false;

process.stdin.on('keypress', (ch, key) => {
    if (key && key.name === 'p') {
        process.exit();
    }
    if (isGameRunning && key) {
        // 게임이 실행 중일 때만 플레이어 이동 처리
        movePlayer(key.name);
    }
});

/**
 * 사용자의 입력을 기다리고, 입력이 완료되면 입력된 값을 반환하는 함수.
 * @param {*} prompt 입력 받기 전 띄울 텍스트
 * @returns {string} 사용자의 입력값 string
 */
function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, (answer) => {
            resolve(answer);
        });
    });
}

/**게임 창 너비 */                  const width = 120;
/**게임 창 높이*/                   const height = 10;
/**플레이어 X좌표 @type {number}*/  let playerX;
/**플레이어 Y좌표 @type {number}*/  let playerY;
/**자동차 배열 @type {Array}*/      let cars;

/**게임 스테이지 @type {number}*/       let stage;
/**차 생성 주기(밀도) @type {number}*/  let carSpawnInterval;
/**게임 속도 @type {number}*/           let gameSpeed;

/**스테이지당 점수*/                        const scoresPerStage = 100;
/**점수 - 우측으로 이동한 칸수 @type {number}*/ let score;
/**스테이지 초기 제한시간 - 단위: 초*/          let firstTimeLimit;
/**스테이지 제한시간 @type {number}*/           let timeLimit;

/**게임 루프 이벤트를 저장하는 필드*/   let gameInterval;
/**차 생성 이벤트를 저장하는 필드*/     let carInterval;
/**타이머 이벤트를 저장하는 필드*/      let timerInterval;

/** 게임 시작 시 게임 세팅 함수 */
function gameSetting() {
    playerX = 0;
    playerY = Math.floor(height / 2);
    cars = [];
    timeLimit = firstTimeLimit;
}

/** 게임 기록, 난이도 리셋 함수 */
function gameReset() {
    stage = 1;
    score = 0;
    carSpawnInterval = 500;
    gameSpeed = 300;
    firstTimeLimit = 40
}

/**레벨 증가 함수 - 레벨 증가 시 난이도 증가*/
const levelUp = () => {
    stage++;
    carSpawnInterval *= 0.7;
    gameSpeed *= 0.8;
    firstTimeLimit -= 5;
    console.log(`스테이지 ${stage}로 이동합니다!`);
};

/** 게임 실행 함수 */
function gameStart() {
    isGameRunning = true; // 게임이 시작됨을 표시
    gameSetting();

    //초기 자동차 배치
    for (let i = 0; i < 100 * (stage / 15); i++) {
        createCar(true);
    }

    gameInterval = setInterval(gameLoop, gameSpeed);
    carInterval = setInterval(() => { createCar(false) } , carSpawnInterval);
    timerInterval = setInterval(updateTimer, 1000);
};

/**반복 실행하여 게임을 구현하는 함수 */
function gameLoop() {
    drawStage();
    updateCars();
    playerCollision();

    // 골인 지점 도달 시 다음 스테이지
    if (playerX === scoresPerStage) {

        console.log('🎉 스테이지 클리어! 🎉');
        clearInterval(gameInterval);
        clearInterval(carInterval);
        clearInterval(timerInterval);
        levelUp();
        isGameRunning = false; // 게임 일시 중지
        setTimeout(gameStart, 2000); // 2초 대기 후 다음 레벨 시작
    }
};

/**스테이지를 그려주는 함수 */
const drawStage = () => {
    console.clear();

    //스테이지 정보 그리기
    let line = `스테이지: ${stage}     이동한 칸수: ${score}     남은 시간: ${timeLimit} [`;
    
    for (let i = 1; i <= 10; i ++) {
        if (i <= Math.floor( ( timeLimit / firstTimeLimit ) * 10 ) ) {
            line += '■';
        } else {
            line += '□';
        }
    }
    line += ']';
    console.log(line);
    
    //게임창 그리기
    for (let y = 0; y < height + 2; y++) {
        let line = '';
        for (let x = 0; x < width; x++) {
            //테두리 그리기
            if (y === height + 1 || y === 0) {
                line += '─';
            }
            //요소 그리기
            else if (cars.some(car => car.x === x && car.y === y)) {
                line += '\x1b[32mX\x1b[0m';  // 자동차를 표시
            } else if (x === playerX && y === playerY) {
                line += '\x1b[31mO\x1b[0m';  // 플레이어를 빨간색으로 표시
            } else {
                line += ' ';
            }
        }
        console.log(line);
    }
};

/**차 위치를 변경하는 함수 */
function updateCars() {
    cars.forEach((car, index) => {
        car.x--;
        if (car.x < 0) {
            cars.splice(index, 1);
        }
    });
};

/**플레이어 충돌 감지 함수 */
function playerCollision() {
    cars.forEach((car, index) => {
        if (car.x === playerX && car.y === playerY) {
            gameOver('부딛혀버렸다...');
        }
    });
}

/**제한시간 업데이트 함수 - 제한시간 소진 시 게임오버 */
function updateTimer() {
    timeLimit --;
    
    if (timeLimit < 0) {
        gameOver('지각해버렸다...');
    }
}

/**
 * 게임 종료 함수
 * @param {string} gameOverText 게임오버 시 띄울 텍스트
 * @returns 
 */
function gameOver(gameOverText) {
    console.log('[게임 오버]\n'
        +gameOverText
        +`\n이동한 칸수: ${score}`
    );

    clearInterval(gameInterval);
    clearInterval(carInterval);
    clearInterval(timerInterval);
    isGameRunning = false; // 게임 일시 중지
    setTimeout(main, 2000); // 2초 대기 후 타이틀로 복귀
    return;
}

/**
 * 차 생성 함수
 * @param {boolean} isXRandom x 좌표가 랜덤인지: false 일시 x 좌표가 우측 끝으로 고정 
 */
function createCar(isXRandom) {
    let y = Math.floor((Math.random() * height) + 1); // y 좌표는 1부터 height + 1까지 랜덤
    let x;

    if (isXRandom) {
        x = Math.floor((Math.random() * (width - 6)) + 5);
    } else {
        x = width;
    }
    
    cars.push({ x, y });
};

const movePlayer = (direction) => {
    if (direction === 'a' && playerX > 0) {
        playerX --;
        score --;
    }
    if (direction === 'd' && playerX < scoresPerStage) {
        playerX ++;
        score ++;
    }
    if (direction === 'w' && playerY > 1) playerY --;
    if (direction === 's' && playerY < height) playerY ++;

    playerCollision();    
};

/** 타이틀 글자 (자동차피하기) 를 출력하는 함수 */
function titleText() {
    console.clear();
    console.log('\x1b[32m         ■    ■■■■■■■■      ■    ■               ■     ■     ■            ■\x1b[0m');
    console.log('\x1b[32m■■■■■■■■ ■    ■■         ■■■■■■■ ■      ■■■■■■■■ ■  ■■■■■■■  ■   ■■■■■■   ■\x1b[0m');
    console.log('\x1b[32m   ■■    ■    ■■         ■■■■■■■ ■       ■  ■■   ■  ■■■■■■■  ■        ■   ■\x1b[0m');
    console.log('\x1b[32m   ■■    ■    ■■■■■■■■      ■    ■       ■  ■■   ■   ■■■■■   ■       ■■   ■\x1b[0m');
    console.log('\x1b[32m   ■■    ■■■     ■■         ■    ■■■■    ■  ■■   ■  ■■■ ■■   ■■■     ■■   ■\x1b[0m');
    console.log('\x1b[32m   ■■■   ■■■     ■■        ■■■   ■■■■    ■  ■■   ■  ■■   ■■  ■■■     ■■   ■\x1b[0m');
    console.log('\x1b[32m  ■■■■■  ■  ■■■■■■■■■■■■  ■■■■■  ■       ■  ■■   ■  ■■   ■■  ■      ■■    ■\x1b[0m');
    console.log('\x1b[32m ■■  ■■■ ■     ■■■■■■    ■■■ ■■■ ■      ■■■■■■■■ ■  ■■   ■■  ■    ■■■     ■\x1b[0m');
    console.log('\x1b[32m■■    ■■ ■    ■■■■■■■■  ■■■   ■■ ■     ■■■■■■■■■ ■   ■■■■■   ■   ■■■      ■\x1b[0m');
    console.log('\x1b[32m         ■    ■■     ■           ■               ■     ■     ■   ■        ■\x1b[0m');
    console.log('\x1b[32m         ■    ■■■   ■■           ■               ■           ■            ■\x1b[0m');
    console.log('\x1b[32m         ■     ■■■■■■■           ■               ■           ■            ■\x1b[0m');
    console.log('');
    console.log('┌─────────────────────────────────────────────────────────────────────────┐');
    console.log('│                                                                         │');
    console.log('│                          ⭐  1. 게임시작    ⭐                          │');
    console.log('│                                                                         │');
    console.log('│                          ⭐  2. 제작자정보  ⭐                          │');
    console.log('│                                                                         │');
    console.log('│                          ⭐  3. 종료        ⭐                          │');
    console.log('│                                                                         │');
    console.log('└─────────────────────────────────────────────────────────────────────────┘');
}

/** 프로그램 초기에 실행하는 함수 */
async function main() {  
    gameReset();
    titleText();

    /** 플레이어 입력 string */
    const input = await question('입력해주세요 > ');

    //입력받은 값 사용
    if (input === '1') {
        console.clear();
        console.log('조작법: w(상), s(하), a(좌), d(우)\n\n'
                   +'자동차(X)를 피해 열쇠(K)를 획득하고, 목적지(====)에 도달하세요!\n\n'
                   +'🚗 잠시 후 게임이 시작됩니다! 🚗'
        );
        
        //2초 후 게임 시작
        setTimeout(gameStart, 2000);
        return;
    } else if (input === '2') {
        console.log('\n최성현 조 : 최성현 20180746, 이상우 20200138, 김영훈 20201541\n');
        await question('메인으로 복귀하려면 엔터 키를 입력 > '); // 아무 입력도 받지 않고 대기
        main();
        return;
    } else if (input === '3') {
        process.exit();
    } else {
        main();
        return;
    }
}

//게임 시작 시 main 함수를 호출
main();