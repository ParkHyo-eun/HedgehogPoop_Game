const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 900;
canvas.height = 700;
document.body.appendChild(canvas);

let backgroundImage;
let poopImage;
let hedgehogImage;
let playerImage;

//
let gameStarted = false;
let gameOver = false; // true면 게임이 끝남, false면 게임이 안끝남.
let score = 0;

//나의 좌표
let playerX = canvas.width / 2 - 32;
let playerY = canvas.height / 2 - 20;

function generateRandomValue(min, max) {
  let randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
  return randomNum;
}

let enemyHedgehog = false;
function createEnemy() {
  if (!enemyHedgehog) {
    enemy = new Enemy();
    enemy.init();
    enemyHedgehog = true;
  }
}

let enemyPoop = true;
function createPoop() {
  if (!enemyPoop) {
    poop = new Poop();
    poop.init();
    enemyPoop = true;
  }
}

//고슴도치 적군
let enemyList = [];
let poopList = [];

function Enemy() {
  this.x = 0;
  this.y = 0;
  this.vx = generateRandomValue(-3, 3); //속도
  this.vy = generateRandomValue(-3, 3);
  this.width = 20;
  this.height = 30;
  this.poopTimer = 0;
  this.poopTimer = Math.random() * 100 + 50;
  this.isStopped = false;

  this.init = () => {
    this.x = generateRandomValue(0, canvas.width - this.width);
    this.y = generateRandomValue(0, canvas.height - this.height);

    enemyList.push(this);
  };
  this.update = function () {
    this.x += this.vx;
    this.y += this.vy;

    // 화면 경계에 도달하면 반대 방향으로 이동
    if (this.x <= 0 || this.x + this.width >= canvas.width) {
      this.vx *= -1; // x축 방향 반전
    }
    if (this.y <= 0 || this.y + this.height >= canvas.height) {
      this.vy *= -1; // y축 방향 반전
    }

    // 화면 안에서 여러 군데로 방향 전환
    if (Math.random() < 0.008) {
      this.vx = generateRandomValue(-2, 2);
      this.vy = generateRandomValue(-2, 2);
    }

    // 똥싸기;
    if (this.poopTimer <= 0) {
      this.stopAndPoop(); // 멈추고 똥 생성
      this.poopTimer = Math.random() * 150 + 150;
    } else {
      this.poopTimer--;
    }
  };

  // 멈추고 똥 생성 함수
  this.stopAndPoop = function () {
    const originalVx = this.vx;
    const originalVy = this.vy;

    // 고슴도치를 멈춤
    this.isStopped = true;
    this.vx = 0;
    this.vy = 0;

    poopList.push(new Poop(this.x + this.width / 2, this.y + this.height));

    setTimeout(() => {
      // 일정 시간 후 다시 움직임 시작
      this.isStopped = false;
      this.vx = originalVx;
      this.vy = originalVy;

      this.poopTimer =
        Math.random() * (100 / poopSpeedMultiplier) + 50 / poopSpeedMultiplier;
    }, 1000);
  };
}

function increasePoopSpeed() {
  poopSpeedMultiplier += 0.1; // 속도 증가 비율 조절
}

setInterval(increasePoopSpeed, 1);

function Poop(x, y) {
  this.x = x;
  this.y = y;
  this.width = 25;
  this.height = 15;

  this.image = new Image();
  this.image.src = "images/poop.png";

  this.update = function () {};

  this.draw = function () {
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  };
}

function loadImage() {
  backgroundImage = new Image();
  backgroundImage.src = "images/background.png";

  playerImage = new Image();
  playerImage.src = "images/me.gif";

  enemyImage = new Image();
  enemyImage.src = "images/hedgehog.png";
}

let keysDown = {};
function setupKeyboardListener() {
  document.addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true;
    console.log("키다운", keysDown);
  });
  document.addEventListener("keyup", function (e) {
    delete keysDown[e.keyCode];
  });
}

// 똥이랑 내가 부딛혔을 때
function isColliding(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

function update() {
  if (39 in keysDown) {
    playerX += 3;
  } // right
  if (37 in keysDown) {
    playerX -= 3;
  } // left
  if (40 in keysDown) {
    playerY += 3;
  }
  if (38 in keysDown) {
    playerY -= 3;
  }

  //내가 벗어나지 않도록
  if (playerX <= 0) {
    playerX = 0;
  }
  if (playerX >= canvas.width - 50) {
    playerX = canvas.width - 50;
  }
  if (playerY <= 0) {
    playerY = 0;
  }
  if (playerY >= canvas.height - 50) {
    playerY = canvas.height - 50;
  }

  // enemy 움직임 그리기
  for (let i = 0; i < enemyList.length; i++) {
    enemyList[i].update();
  }
  // 똥 제거하기
  for (let i = poopList.length - 1; i >= 0; i--) {
    const poop = poopList[i];
    if (
      isColliding(
        { x: playerX, y: playerY, width: 50, height: 50 },
        { x: poop.x, y: poop.y, width: poop.width, height: poop.height }
      )
    ) {
      poopList.splice(i, 1); // 똥 제거
      score++;
      console.log("Score:", score);
    }
  }

  // 똥이 6개면 게임 끝
  if (poopList.length >= 6) {
    gameOver = true;
  }
}

function render() {
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
  ctx.drawImage(playerImage, playerX, playerY);
  ctx.fillText(`Score:${score}`, 800, 30);
  ctx.fillStyle = "white";
  ctx.font = "20px 조선100년체";

  for (let i = 0; i < enemyList.length; i++) {
    ctx.drawImage(enemyImage, enemyList[i].x, enemyList[i].y);
  }

  poopList.forEach((poop) => {
    poop.update();
    poop.draw();
  });
  requestAnimationFrame(render);
}

function main() {
  if (!gameStarted) {
    drawStartScreen(); // 시작 화면 표시
    requestAnimationFrame(main);
    return;
  }

  if (gameOver) {
    drawGameOver(); // 게임 오버 화면 표시
    requestAnimationFrame(main);
    return; // 루프 종료
  }

  update(); // 게임 상태 업데이트
  render(); // 게임 렌더링

  requestAnimationFrame(main); // 다음 프레임 요청
}

function drawStartScreen() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // 캔버스 초기화
  ctx.fillStyle = "black"; // 배경 색상
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = "50px Arial";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.fillText("표풍이를 이겨라", canvas.width / 2, canvas.height / 2 - 70);
  ctx.font = "20px Arial";
  ctx.fillText(
    "표풍이가 싼 똥을 걸레로 치우는 게임입니다.",
    canvas.width / 2,
    canvas.height / 2 - 30
  );
  ctx.fillText(
    "똥이 5개 남으면 게임 끝",
    canvas.width / 2,
    canvas.height / 2 - 5
  );
  ctx.font = "30px Arial";
  ctx.fillText(
    "게임을 시작하려면 스페이스바를 누르세요.",
    canvas.width / 2,
    canvas.height / 2 + 50
  );
}

loadImage();
setupKeyboardListener();
createEnemy();
main();

//

function drawGameOver() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // "GAME OVER" 메시지
  ctx.font = "50px Arial";
  ctx.fillStyle = "red";
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);

  // 재시작 안내 메시지
  ctx.font = "20px Arial";
  ctx.fillStyle = "white";
  ctx.fillText(
    "스페이스바를 누르면 게임이 재시작됩니다.",
    canvas.width / 2,
    canvas.height / 2 + 50
  );
}

window.addEventListener("keydown", (e) => {
  if (!gameStarted && e.code === "Space") {
    gameStarted = true; // 게임 시작
    gameOver = false;
    initializeGame(); // 게임 초기화
    main(); // 메인 루프 시작
  }

  if (gameOver && e.code === "Space") {
    restartGame(); // 게임 재시작
    main(); // 메인 루프 다시 시작
  }
});

function restartGame() {
  gameOver = false;
  poopList = [];
  enemyList = [];

  let enemy = new Enemy();
  enemy.init();

  main();
}

initializeGame();
