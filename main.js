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

/**게임 창 너비 */                  const width = 20;
/**게임 창 높이*/                   const height = 20;
/**플레이어 X좌표 @type {number}*/  let playerX;
/**플레이어 Y좌표 @type {number}*/  let playerY;
/**자동차 배열 @type {Array}*/      let cars;

/**게임 레벨 @type {number}*/           let level;
/**게임 시작 시간 @type {number}*/      let startTime;
/**게임 플레이 시간 @type {number}*/    let timeTaken;
/**차 생성 주기(밀도) @type {number}*/  let carSpawnInterval;
/**게임 속도 @type {number}*/           let gameSpeed;

/**게임 루프 이벤트를 저장하는 필드*/let gameInterval;
/**차 생성 이벤트를 저장하는 필드*/  let carInterval;

/** 열쇠 위치와 상태 */
let keyX, keyY;
let hasKey = false; // 열쇠 획득 여부

/** 게임 시작 시 게임 세팅 함수 */
function gameSetting() {
    playerX = Math.floor(width / 2);
    playerY = height - 1;
    cars = [];
    hasKey = false; // 열쇠 상태 초기화
}

/** 게임 기록, 난이도 리셋 함수 */
function gameReset() {
    level = 1;
    startTime = 0;
    timeTaken = 0;
    carSpawnInterval = 400;
    gameSpeed = 200;
}

/** 열쇠를 무작위로 배치하는 함수 */
const placeKey = () => {
    keyX = Math.floor(Math.random() * (width - 1)); // 필드 내 임의의 위치에 열쇠 배치
    keyY = Math.floor((Math.random() * (height - 2)) + 1); // 골인 지점(0)은 제외
};

/** 게임 실행 함수 */
function gameStart() {
    isGameRunning = true; // 게임이 시작됨을 표시
    gameSetting();
    placeKey(); // 새로운 열쇠 배치

    startTime = Date.now(); // 타이머 시작

    gameInterval = setInterval(gameLoop, gameSpeed);
    carInterval = setInterval(createCar, carSpawnInterval);
};

/**반복 실행하여 게임을 구현하는 함수 */
function gameLoop() {
    drawStage();
    updateCars();
    
    // 골인 지점 도달 시 열쇠를 획득했는지 확인
    if (playerY === 0 && hasKey) {
        const endTime = Date.now();
        timeTaken += Math.floor((endTime - startTime) / 1000);

        console.log('🎉 스테이지 클리어! 🎉');
        clearInterval(gameInterval);
        clearInterval(carInterval);
        levelUp();
        isGameRunning = false; // 게임 일시 중지
        setTimeout(gameStart, 2000); // 2초 대기 후 다음 레벨 시작
    } else if (playerY === 0 && !hasKey) {
        console.log('열쇠를 먼저 획득해야 합니다!');
    }
};

/**스테이지를 그려주는 함수 */
const drawStage = () => {
    console.clear();
    console.log(`레벨: ${level}`);
    
    for (let y = 0; y < height; y++) {
        let line = '';
        for (let x = 0; x < width; x++) {
            if (cars.some(car => car.x === x && car.y === y)) {
                line += '\x1b[32mX\x1b[0m';  // 자동차를 표시
            } else if (x === playerX && y === playerY) {
                line += '\x1b[31mO\x1b[0m';  // 플레이어를 빨간색으로 표시
            } else if (x === keyX && y === keyY && !hasKey) {
                line += '\x1b[33mK\x1b[0m';  // 열쇠를 노란색으로 표시
            } else if (y === 0) {
                line += '\x1b[34m=\x1b[0m';  // 골인 지점
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
        if (car.x === playerX && car.y === playerY) {
            const endTime = Date.now();
            timeTaken += Math.floor((endTime - startTime) / 1000);
            console.log('게임 오버...\n'
                       +'잠시 후 타이틀로 돌아갑니다.\n\n'
                       +`총 소요 시간: ${timeTaken}초`
            );

            clearInterval(gameInterval);
            clearInterval(carInterval);
            isGameRunning = false; // 게임 일시 중지
            setTimeout(main, 2000); // 2초 대기 후 타이틀로 복귀
            return;
        }
        if (car.x < 0) {
            cars.splice(index, 1);
        }
        car.x--;
    });
};

/**레벨 증가 함수 - 레벨 증가 시 난이도 증가*/
const levelUp = () => {
    level++;
    carSpawnInterval *= 0.7;
    gameSpeed *= 0.9;
    console.log(`레벨 ${level}로 이동합니다!`);
};

function createCar() {
    const y = Math.floor((Math.random() * (height - 2)) + 1); // y 좌표는 1부터 height-2까지 랜덤
    const x = width - 1;
    
    cars.push({ x, y });
};

const movePlayer = (direction) => {
    if (direction === 'a' && playerX > 0) playerX--;
    if (direction === 'd' && playerX < width - 1) playerX++;
    if (direction === 'w' && playerY > 0) playerY--;
    if (direction === 's' && playerY < height - 1) playerY++;

    // 플레이어가 열쇠를 획득했는지 체크
    if (playerX === keyX && playerY === keyY) {
        hasKey = true;
        console.log('열쇠를 획득했습니다!');
    }
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
    const input = await question('입력해주세요 >');

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
        await question('메인으로 복귀하려면 엔터 키를 입력 >'); // 아무 입력도 받지 않고 대기
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
