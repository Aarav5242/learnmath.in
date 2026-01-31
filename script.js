let playerName = "";
let operation = "";
let level = 1;
let totalQuestions = 0;
let currentQuestion = 0;
let correct = 0;
let answerValue = 0;
let timeLeft = 0;
let timerInterval;
let history = []; // store generated questions so "Back" can show previous sums

const timeUpSound = new Audio("https://assets.mixkit.co/active_storage/sfx/2562/2562-preview.mp3");

function formatTime(sec) {
  let m = Math.floor(sec / 60);
  let s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function submitName() {
  let nameInput = document.getElementById("playerName").value.trim();

  if (nameInput === "") {
    alert("⚠ Please enter your name!");
    return; // stop the function here
  }

  playerName = nameInput;
  document.getElementById("welcomeMsg").innerText = `Welcome ${playerName}! Choose an operation`;

  showScreen("menu");
  document.getElementById("playerName").value = ""; // reset input box
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(scr => scr.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function selectOperation(op) {
  operation = op;
  showScreen("levels");
}

function startGame(lv) {
  level = lv;
  showScreen("game");

  // Set totals & timers
  if (level === 1) { totalQuestions = 10; timeLeft = 60; }
  if (level === 2) { totalQuestions = 15; timeLeft = 120; }
  if (level === 3) { totalQuestions = 20; timeLeft = 240; }

  currentQuestion = 0;
  correct = 0;
  history = [];
  startTimer();
  nextQuestion();

      // remove elements whose computed background-color matches the maroon used
      // in the stylesheet (#731211 -> rgb(115, 18, 17) ) and that sit near the
      // bottom of the viewport. This targets the maroon strip the user reported.
      const MAROON_RGB = 'rgb(115, 18, 17)';
      document.querySelectorAll('body *').forEach(n => {
        try {
          const cs = window.getComputedStyle(n);
          if (!cs) return;
          if (cs.backgroundColor === MAROON_RGB) {
            const rect = n.getBoundingClientRect();
            // if element touches or is within 20px of bottom, remove it
            if (rect.bottom >= (window.innerHeight - 20) || cs.position === 'fixed') {
              n.remove();
            }
          }
        } catch (e) { }
      });
}

function startTimer() {
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) timeUp();
  }, 1000);
}

function updateTimerDisplay() {
  document.getElementById("playerInfo").innerText =
    `${playerName} | Time Left: ${formatTime(timeLeft)}`;
}



function nextQuestion() {
  if (currentQuestion >= totalQuestions) return endGame();

  // Next index we'll display
  const nextIndex = currentQuestion + 1;

  // If we've already generated this question, just load it from history
  if (history[nextIndex]) {
    currentQuestion = nextIndex;
    loadQuestion(nextIndex);
    return;
  }

  // Otherwise generate a new question and save it
  currentQuestion = nextIndex;
  document.getElementById("counter").innerText = `Q: ${currentQuestion}/${totalQuestions}`;
  const statusEl = document.getElementById("status");
  statusEl.classList.remove("status-correct", "status-wrong");
  statusEl.innerText = "";

  let min, max;
  if (level === 1) { min = 30; max = 40; }
  if (level === 2) { min = 40; max = 120; }
  if (level === 3) { min = 150; max = 300; }

  let a = rand(min, max);
  let b = rand(min, max);

  let qText = "";
  switch (operation) {
    case "add":
      answerValue = a + b;
      qText = `${a} + ${b}`;
      break;

    case "sub":
      if (b > a) [a, b] = [b, a];
      answerValue = a - b;
      qText = `${a} - ${b}`;
      break;

    case "mul":
      answerValue = a * b;
      qText = `${a} × ${b}`;
      break;

    case "div":
      // For division, make divisible pair
      answerValue = rand(min, max);
      b = rand(2, 12);
      a = answerValue * b;
      qText = `${a} ÷ ${b}`;
      break;
  }

  let opts = [answerValue];
  while (opts.length < 4) {
    let wrong = answerValue + rand(-10, 10);
    if (!opts.includes(wrong) && wrong >= 0) opts.push(wrong);
  }

  opts.sort(() => Math.random() - 0.5);

  // Save to history using 1-based index for readability
  history[currentQuestion] = { qText, answerValue, opts, answered: false, correct: false };

  loadQuestion(currentQuestion);
  }


// Generate a new question for a specific index and store it in history
function generateQuestionForIndex(index) {
  let min, max;
  if (level === 1) { min = 30; max = 40; }
  if (level === 2) { min = 40; max = 120; }
  if (level === 3) { min = 150; max = 300; }

  let a = rand(min, max);
  let b = rand(min, max);

  let qText = "";
  let ans = 0;
  switch (operation) {
    case "add":
      ans = a + b;
      qText = `${a} + ${b}`;
      break;
    case "sub":
      if (b > a) [a, b] = [b, a];
      ans = a - b;
      qText = `${a} - ${b}`;
      break;
    case "mul":
      ans = a * b;
      qText = `${a} × ${b}`;
      break;
    case "div":
      ans = rand(min, max);
      b = rand(2, 12);
      a = ans * b;
      qText = `${a} ÷ ${b}`;
      break;
  }

  let opts = [ans];
  while (opts.length < 4) {
    let wrong = ans + rand(-10, 10);
    if (!opts.includes(wrong) && wrong >= 0) opts.push(wrong);
  }
  opts.sort(() => Math.random() - 0.5);

  history[index] = { qText, answerValue: ans, opts, answered: false, correct: false };
}


function loadQuestion(index) {
  const entry = history[index];
  // if no entry exists, generate one
  if (!entry) {
    generateQuestionForIndex(index);
  }

  const e = history[index];

  // If this question was already answered, regenerate it to prevent cheating
  if (e.answered) {
    generateQuestionForIndex(index);
  }
  const entry2 = history[index];

  document.getElementById("counter").innerText = `Q: ${index}/${totalQuestions}`;
  document.getElementById("question").innerText = entry2.qText;
  answerValue = entry2.answerValue;
  document.getElementById("status").innerText = "";

  document.querySelectorAll(".opt").forEach((btn, i) => {
    btn.innerText = entry2.opts[i];
    btn.disabled = false;
    btn.classList.remove("correct", "wrong");
    btn.style.background = "";
    btn.style.backgroundColor = "";
    btn.style.backgroundImage = "";
    btn.style.color = "";
    btn.style.borderColor = "";
    btn.style.opacity = "";
  });
}



function checkOption(btn) {
  let selected = Number(btn.innerText);

  const correctSound = document.getElementById("correctSound");
  const wrongSound = document.getElementById("wrongSound");

  // Disable all buttons
  document.querySelectorAll(".opt").forEach(b => {
    b.disabled = true;
    b.classList.remove("correct", "wrong");
  });

  // Remove focus from the clicked button / active element so mobile :focus/:hover styles don't stick
  try {
    if (btn && typeof btn.blur === 'function') btn.blur();
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      // small delay helps on some mobile browsers
      setTimeout(() => document.activeElement.blur(), 50);
    }
  } catch (e) { /* ignore blur errors */ }

  if (selected === answerValue) {

    // Correct
    btn.classList.add("correct");

    const statusEl = document.getElementById("status");
    statusEl.classList.remove("status-wrong");
    statusEl.classList.add("status-correct");
    statusEl.innerText = "✔ Correct";

    correct++;

    correctSound.currentTime = 0;
    correctSound.play();

  } else {

    // Wrong
    btn.classList.add("wrong");

    const statusEl = document.getElementById("status");
    statusEl.classList.remove("status-correct");
    statusEl.classList.add("status-wrong");
    statusEl.innerText = "✖ Wrong";

    wrongSound.currentTime = 0;
    wrongSound.play();

    // Show correct answer also in green
    document.querySelectorAll(".opt").forEach(b => {
      if (Number(b.innerText) === answerValue) {
        b.classList.add("correct");
      }
    });
  }

  // Mark answer in history (if exists)
  if (history[currentQuestion]) {
    history[currentQuestion].answered = true;
    history[currentQuestion].correct = (selected === answerValue);
  }

  setTimeout(nextQuestion, 900);
}



function timeUp() {
  clearInterval(timerInterval);
  alert("⏰ Time Over!");
  endGame();
}

function endGame() {
  clearInterval(timerInterval);
  showScreen("result");

  let percent = Math.round((correct / totalQuestions) * 100);

  document.getElementById("finalMsg").innerText = "🎉 Result";
  document.getElementById("finalScore").innerText = `Score: ${correct}/${totalQuestions}`;
  document.getElementById("finalPercent").innerText = `Percentage: ${percent}%`;

  let rank = "";
  let resultMsg = "";

  if (percent >= 80) {
    rank = "🏆 Excellent!";
    resultMsg = `Great job, ${playerName}!`;
  } else if (percent >= 70) {
    rank = "🥇 Very Good!";
    resultMsg = `Well done, ${playerName}!`;
  } else if (percent >= 40) {
    rank = "🙂 Good";
    resultMsg = `Nice try, ${playerName}!`;
  } else {
    rank = "😟 Try Again";
    resultMsg = `Try again, ${playerName}!`;
  }

  document.getElementById("finalRank").innerText = rank;
  document.getElementById("resultName").innerText = resultMsg;

  // confetti + sound
  confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });

  // Play user's confetti audio element if present (defined in index.html)
  (function() {
    const confEl = document.getElementById('confettiSound');
    if (confEl && typeof confEl.play === 'function') {
      const p = confEl.play();
      if (p && typeof p.then === 'function') p.catch(err => console.warn('Confetti audio play failed:', err));
    }
  })();


}


function restartToHome() {
  clearInterval(timerInterval);
  showScreen("menu");
}

function backToLevels() {
  // If we're on the first question, go back to levels screen
  if (currentQuestion <= 1) {
    clearInterval(timerInterval);
    showScreen("levels");
    return;
  }

  // Otherwise show previous question from history
  currentQuestion--;

  // Force-generate a new question for the previous index to prevent cheating
  generateQuestionForIndex(currentQuestion);
  loadQuestion(currentQuestion);
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

document.querySelectorAll(".opt").forEach(btn => btn.addEventListener("click", () => checkOption(btn)));
