const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
});

process.stdin.setRawMode(true);
process.stdin.resume();

process.stdin.on('keypress', (ch, key) => {
    if (key && key.name === 'p') {
        process.exit();
    }
    if (key) {
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

/**게임 창 너비 */  const width = 20;
/**게임 창 높이*/   const height = 20;
/**플레이어 X좌표*/ let playerX = Math.floor(width / 2);
/**플레이어 Y좌표*/ let playerY = height - 1;
/**자동차 배열*/    let cars = [];
let gameInterval;

let startTime = 0;
let timeTaken = 0;
/**게임 레벨*/      let level = 1;
let carSpawnInterval = 1000;
let carSpeed = 167;


const levelUp = () => {
    level++;
    carSpawnInterval *= 0.9;
    carSpeed *= 0.9;
    console.log(`레벨 ${level}로 이동합니다!`);
};

const drawStage = () => {
    console.clear();
    console.log(`레벨: ${level}`);
    for (let y = 0; y < height; y++) {
        let line = '';
        for (let x = 0; x < width; x++) {
            if (x === playerX && y === playerY) {
                line += '\x1b[31mO\x1b[0m';  // 플레이어를 빨간색으로 표시
            } else if (cars.some(car => car.x === x && car.y === y)) {
                line += '\x1b[32mX\x1b[0m';  // 자동차를 표시
            } else if (y === 0) {
                line += '\x1b[34m=\x1b[0m';  // 골인 지점
            } else {
                line += ' ';
            }
        }
        console.log(line);
    }
};

function createCar() {
    const y = Math.floor(Math.random() * (height - 1)); // y 좌표는 0부터 height-2까지 랜덤
    const x = width - 1;
    
    // 도착점(0)에는 자동차를 생성하지 않도록 조건 추가
    if (y !== 0) {
        cars.push({ x, y });
    }
};

function updateCars() {
    cars.forEach((car, index) => {
        car.x--;
        if (car.x === playerX && car.y === playerY) {
            const endTime = Date.now();
            timeTaken += Math.floor((endTime - startTime) / 1000);
            console.log('게임 오버...');
            console.log('잠시 후 타이틀로 돌아갑니다.');
            console.log(``);
            console.log(`총 소요 시간: ${timeTaken}초`);
            clearInterval(gameInterval);
            setTimeout(() => {
                main(); // 2초 대기 후 타이틀로 돌아가기
            }, 2000); // 2초 대기
            return;
        }
        if (car.x < 0) {
            cars.splice(index, 1);
        }
    });
};


const movePlayer = (direction) => {
    if (direction === 'a' && playerX > 0) playerX--;
    if (direction === 'd' && playerX < width - 1) playerX++;
    if (direction === 'w' && playerY > 0) playerY--;
    if (direction === 's' && playerY < height - 1) playerY++;
};

function gameLoop() {
    drawStage();
    updateCars();
    if (playerY === 0) {
        const endTime = Date.now();
        timeTaken += Math.floor((endTime - startTime) / 1000);

        console.log('🎉 스테이지 클리어! 🎉');
        clearInterval(gameInterval);
        levelUp();
        setTimeout(() => {
            playerY = height - 1;
            gameStart();
        }, 2000); // 2초 대기 후 다음 레벨 시작
    }
};

/** 게임 실행 함수 */
function gameStart() {
    gameSetting();

    startTime = Date.now(); // 타이머 시작

    gameInterval = setInterval(() => {
        createCar();
        gameLoop();
    }, carSpeed);

    setInterval(createCar, carSpawnInterval);
};

/** 게임 초기값 세팅 함수 */
function gameSetting() {
    playerX = Math.floor(width / 2);
    playerY = height - 1;
    cars = [];
}

/** 게임 기록, 난이도 리셋 함수 */
function gameReset() {
    level = 1;
    startTime = 0;
    timeTaken = 0;
    carSpawnInterval = 1000;
    carSpeed = 167;
}

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
    console.log('###########################################################################');
    console.log('#                                                                         #');
    console.log('#                          ⭐  1. 게임시작    ⭐                          #');
    console.log('#                                                                         #');
    console.log('#                          ⭐  2. 제작자정보  ⭐                          #');
    console.log('#                                                                         #');
    console.log('#                          ⭐  3. 종료        ⭐                          #');
    console.log('#                                                                         #');
    console.log('###########################################################################');
}

/** 타이틀과 게임 메인메뉴를 띄우는 함수 */
async function main() {  
    gameReset();
    titleText();

    /** 플레이어 입력 string */
    const input = await question('입력해주세요 >');

    //입력받은 값 사용
    if (input === '1') {
        console.clear();
        console.log('조작법: w(상), s(하), a(좌), d(우)\n\n'
                   +'자동차를 피해 목적지에 도달하세요!\n\n'
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