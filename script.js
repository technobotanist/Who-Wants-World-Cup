// Game State
const gameState = {
    currentQuestion: 0,
    score: 0,
    lifelines: {
        fiftyFifty: true,
        phoneAFriend: true,
        askAudience: true
    },
    isMuted: false,
    selectedAnswer: null,
    questionsData: [],
    isLockingIn: false,
    questionsSinceBreak: 0
};

// Basic audio controller using local media files
const audioController = {
    currentBed: null,
    muted: false,
    beds: {
        // looping suspense / thinking bed
        question: new Audio('media/suspense.mp3')
    },
    cues: {
        // question revealed
        playQuestion: new Audio('media/play.mp3'),
        // checkpoint final answer sting
        final: new Audio('media/final.mp3'),
        // correct / wrong answer reveals
        correct: new Audio('media/correct.mp3'),
        wrong: new Audio('media/wrong.mp3'),
        // lifeline music
        lifeline: new Audio('media/lifeline.mp3'),
        // commercial break sting/bed
        commercial: new Audio('media/commercial.mp3'),
        // winner celebration
        winner: new Audio('media/winner.mp3')
    },
    playBed(name) {
        if (this.muted) return;
        this.stopBed();
        const bed = this.beds[name];
        if (!bed) return;
        bed.loop = true;
        bed.currentTime = 0;
        bed.play();
        this.currentBed = bed;
    },
    stopBed() {
        if (this.currentBed) {
            this.currentBed.pause();
            this.currentBed.currentTime = 0;
            this.currentBed = null;
        }
    },
    playCue(name) {
        if (this.muted) return;
        const cue = this.cues[name];
        if (!cue) return;
        cue.currentTime = 0;
        cue.play();
    },
    setMuted(value) {
        this.muted = value;
        if (value) {
            this.stopBed();
        }
    }
};

// Prize Ladder KRW (in order from question 1 to 15)
const prizeLadder = [
    { question: 1, prize: "₩100,000", milestone: false },
    { question: 2, prize: "₩200,000", milestone: false },
    { question: 3, prize: "₩300,000", milestone: false },
    { question: 4, prize: "₩500,000", milestone: false },
    { question: 5, prize: "₩1,000,000", milestone: true },
    { question: 6, prize: "₩2,000,000", milestone: false },
    { question: 7, prize: "₩4,000,000", milestone: false },
    { question: 8, prize: "₩8,000,000", milestone: false },
    { question: 9, prize: "₩16,000,000", milestone: false },
    { question: 10, prize: "₩32,000,000", milestone: true },
    { question: 11, prize: "₩64,000,000", milestone: false },
    { question: 12, prize: "₩125,000,000", milestone: false },
    { question: 13, prize: "₩250,000,000", milestone: false },
    { question: 14, prize: "₩500,000,000", milestone: false },
    { question: 15, prize: "₩1,000,000,000", milestone: true }
];

// Questions Database
const questions = [
    {
        question: "The 2026 World Cup is co-hosted by the USA and Canada and which other country?",
        answers: ["Costa Rica", "Mexico", "Panama", "Jamaica"],
        correct: 1
    },
    {
        question: "How many teams will compete at the 2026 World Cup?",
        answers: ["32", "40", "48", "64"],
        correct: 2
    },
    {
        question: "How many matches will be played in the United States during the 2026 tournament?",
        answers: ["52", "65", "78", "91"],
        correct: 2
    },
    {
        question: "Scotland's first group match of the 2026 World Cup is Haiti vs Scotland. Where is it scheduled to be played?",
        answers: ["Hard Rock Stadium (Miami)", "Gillette Stadium (Boston area)", "Lincoln Financial Field (Philadelphia)", "MetLife Stadium (New York–New Jersey)"],
        correct: 1
    },
    {
        question: "How many matches are scheduled for the 2026 World Cup in total?",
        answers: ["80", "96", "100", "104"],
        correct: 3
    },
    {
        question: "Where was the opening match of the 1994 FIFA World Cup played?",
        answers: ["Rose Bowl (Pasadena)", "Soldier Field (Chicago)", "Giants Stadium (East Rutherford)", "RFK Stadium (Washington, DC)"],
        correct: 1
    },
    {
        question: "The opening match of the 2026 World Cup is Mexico vs South Africa. Where is it scheduled to be played?",
        answers: ["Estadio BBVA (Monterrey)", "Estadio Akron (Guadalajara)", "Estadio Azteca (Mexico City)", "Hard Rock Stadium (Miami)"],
        correct: 2
    },
    {
        question: "Scotland won their UEFA World Cup qualification group. Which country finished runner-up?",
        answers: ["Denmark", "Greece", "Belarus", "Cyprus"],
        correct: 0
    },
    {
        question: "From which round onward will all matches of the 2026 World Cup be played in the United States?",
        answers: ["Round of 32", "Round of 16", "Quarterfinals", "Semifinals"],
        correct: 2
    },
    {
        question: "During the 2026 World Cup, what official name will FIFA use for MetLife Stadium?",
        answers: ["New York Stadium", "New York New Jersey Stadium", "Hudson River Arena", "Meadowlands National Stadium"],
        correct: 1
    },
    {
        question: "Which Celtic FC player represented Canada at the 2022 World Cup?",
        answers: ["Cameron Carter-Vickers", "Alistair Johnston", "Greg Taylor", "Joe Hart"],
        correct: 1
    },
    {
        question: "Which of these countries has never appeared in a men's World Cup final?",
        answers: ["Portugal", "Sweden", "Hungary", "Czechoslovakia"],
        correct: 0
    },
    {
        question: "Which country has never played a men's World Cup match, despite having the largest population among these options?",
        answers: ["Guatemala", "Honduras", "Panama", "Jamaica"],
        correct: 0
    },
    {
        question: "Which is the least populous country to have reached a men's World Cup semifinal?",
        answers: ["Uruguay", "Croatia", "Sweden", "Belgium"],
        correct: 0
    },
    {
        question: "FIFA's 2026 plan includes a $50 million prize for the champions. What is the total prize pool approved for the tournament?",
        answers: ["$440 million", "$576 million", "$727 million", "$1.2 billion"],
        correct: 2
    }
];

// Commercial break YouTube videos (watch URLs)
const commercialVideos = [
    'https://www.youtube.com/watch?v=eWZoLkbaSsM'
    // Add more video URLs here as needed
];

function openRandomCommercial() {
    if (!commercialVideos.length) return;
    
    // Stop suspenseful music immediately when opening YouTube
    audioController.stopBed();
    
    const base = commercialVideos[Math.floor(Math.random() * commercialVideos.length)];

    // Random timestamp between 0 and 20 minutes (for flexibility)
    const maxSeconds = 20 * 60;
    const t = Math.floor(Math.random() * maxSeconds);
    const url = `${base}&t=${t}s`;

    window.open(url, '_blank');
}

function startCommercialBreak() {
    const overlay = document.getElementById('commercial-overlay');
    const startBtn = document.getElementById('commercial-start');
    const endBtn = document.getElementById('commercial-end');

    startBtn.classList.remove('hidden');
    endBtn.classList.add('hidden');
    overlay.classList.remove('hidden');

    audioController.playCue('commercial');
}

function finishCommercialBreak() {
    const overlay = document.getElementById('commercial-overlay');
    overlay.classList.add('hidden');
    loadQuestion();
}

// Initialize Game
function initGame() {
    gameState.questionsData = [...questions];
    gameState.currentQuestion = 0;
    gameState.score = 0;
    gameState.selectedAnswer = null;
    gameState.questionsSinceBreak = 0;
    gameState.lifelines = {
        fiftyFifty: true,
        phoneAFriend: true,
        askAudience: true
    };
    
    // Reset lifeline buttons
    document.getElementById('fifty-fifty').disabled = false;
    document.getElementById('phone-friend').disabled = false;
    document.getElementById('ask-audience').disabled = false;
    
    renderPrizeLadder();
    loadQuestion();
    setupEventListeners();
}

// Render Prize Ladder
function renderPrizeLadder() {
    const ladderContainer = document.getElementById('ladder-items');
    ladderContainer.innerHTML = '';
    
    // Render in reverse order (highest to lowest)
    for (let i = prizeLadder.length - 1; i >= 0; i--) {
        const item = prizeLadder[i];
        const div = document.createElement('div');
        div.className = 'ladder-item';
        
        if (item.milestone) {
            div.classList.add('milestone');
        }
        
        if (item.question === gameState.currentQuestion + 1) {
            div.classList.add('current');
        } else if (item.question < gameState.currentQuestion + 1) {
            div.classList.add('completed');
        }
        
        div.innerHTML = `
            <span class="ladder-number">${item.question}</span>
            <span class="ladder-prize">${item.prize}</span>
        `;
        
        ladderContainer.appendChild(div);
    }
}

// Load Question
function loadQuestion() {
    if (gameState.currentQuestion >= gameState.questionsData.length) {
        endGame(true);
        return;
    }
    
    const questionData = gameState.questionsData[gameState.currentQuestion];
    
    document.getElementById('question-num').textContent = gameState.currentQuestion + 1;
    document.getElementById('question-text').textContent = questionData.question;
    
    const answerKeys = ['a', 'b', 'c', 'd'];
    answerKeys.forEach((key, index) => {
        const answerElement = document.getElementById(`answer-${key}`);
        answerElement.textContent = questionData.answers[index];
        
        const answerBtn = document.querySelector(`[data-answer="${key.toUpperCase()}"]`);
        answerBtn.disabled = false;
        answerBtn.classList.remove('selected', 'correct', 'wrong');
    });
    
    gameState.selectedAnswer = null;
    renderPrizeLadder();

    // question reveal sting then suspense bed
    audioController.playCue('playQuestion');
    audioController.playBed('question');
}

// Select Answer
function selectAnswer(answer) {
    if (gameState.selectedAnswer !== null || gameState.isLockingIn) return;
    
    const answerBtns = document.querySelectorAll('.answer-btn');
    answerBtns.forEach(btn => btn.classList.remove('selected'));
    
    const selectedBtn = document.querySelector(`[data-answer="${answer}"]`);
    selectedBtn.classList.add('selected');
    gameState.selectedAnswer = answer;

    audioController.playCue('select');
}

// Confirm Answer
function confirmAnswer() {
    if (gameState.selectedAnswer === null || gameState.isLockingIn) return;

    gameState.isLockingIn = true;
    
    const questionData = gameState.questionsData[gameState.currentQuestion];
    const answerKeys = ['A', 'B', 'C', 'D'];
    const selectedIndex = answerKeys.indexOf(gameState.selectedAnswer);
    const isCorrect = selectedIndex === questionData.correct;
    
    const selectedBtn = document.querySelector(`[data-answer="${gameState.selectedAnswer}"]`);
    const correctBtn = document.querySelectorAll('.answer-btn')[questionData.correct];
    
    // Disable all buttons
    document.querySelectorAll('.answer-btn').forEach(btn => btn.disabled = true);
    
    if (isCorrect) {
        selectedBtn.classList.remove('selected');
        selectedBtn.classList.add('correct');
        audioController.stopBed();

        const qNumber = gameState.currentQuestion + 1;
        const isMilestone = prizeLadder.some(p => p.question === qNumber && p.milestone);

        if (isMilestone) {
            audioController.playCue('final');
        } else {
            audioController.playCue('correct');
        }
        
        setTimeout(() => {
            gameState.currentQuestion++;
            gameState.score = prizeLadder[gameState.currentQuestion - 1]?.prize || gameState.score;
            gameState.questionsSinceBreak++;

            const shouldBreak = gameState.questionsSinceBreak % 3 === 0 && gameState.currentQuestion < prizeLadder.length;
            if (shouldBreak) {
                startCommercialBreak();
            } else {
                loadQuestion();
            }

            gameState.isLockingIn = false;
        }, 2000);
    } else {
        selectedBtn.classList.remove('selected');
        selectedBtn.classList.add('wrong');
        correctBtn.classList.add('correct');
        audioController.stopBed();
        audioController.playCue('wrong');
        
        setTimeout(() => {
            endGame(false);
            gameState.isLockingIn = false;
        }, 2000);
    }
}

// Create Confetti
function createConfetti() {
    const colors = ['#FFD700', '#FF1493', '#00CED1', '#9370DB', '#FF6347', '#FFA500', '#00FF00'];
    const confettiCount = 150;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
        document.body.appendChild(confetti);
        
        // Remove confetti after animation
        setTimeout(() => {
            confetti.remove();
        }, 6000);
    }
}

// Create Confetti
function createConfetti() {
    const colors = ['#FFD700', '#FF1493', '#00CED1', '#9370DB', '#FF6347', '#FFA500', '#00FF00'];
    const confettiCount = 150;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
        document.body.appendChild(confetti);
        
        // Remove confetti after animation
        setTimeout(() => {
            confetti.remove();
        }, 6000);
    }
}

// End Game
function endGame(won) {
    const overlay = document.getElementById('gameover-overlay');
    const title = document.getElementById('gameover-title');
    const message = document.getElementById('gameover-message');
    
    if (won) {
        title.textContent = "🎉 Congratulations! 🎉";
        message.textContent = `You've won: ${prizeLadder[prizeLadder.length - 1].prize} (World Cup Trip!) 🏆⚽`;
        audioController.stopBed();
        audioController.playCue('winner');
        overlay.classList.add('winner');
        createConfetti();
        createConfetti();
    } else {
        // Calculate winnings based on last milestone
        let winnings = "CLP 0";
        for (let i = gameState.currentQuestion - 1; i >= 0; i--) {
            if (prizeLadder[i].milestone) {
                winnings = prizeLadder[i].prize;
                break;
            }
        }
        
        title.textContent = "Game Over!";
        message.textContent = `You've won: ${winnings}`;
        audioController.stopBed();
        audioController.playCue('wrong');
    }
    
    overlay.classList.remove('hidden');
}

// Lifeline: 50/50
function useFiftyFifty() {
    if (!gameState.lifelines.fiftyFifty || gameState.selectedAnswer !== null) return;

    gameState.lifelines.fiftyFifty = false;
    document.getElementById('fifty-fifty').disabled = true;

    const questionData = gameState.questionsData[gameState.currentQuestion];
    const correctIndex = questionData.correct;
    const answerBtns = document.querySelectorAll('.answer-btn');

    const wrongIndices = [0, 1, 2, 3].filter(i => i !== correctIndex);
    const toHide = [];

    while (toHide.length < 2) {
        const randomIndex = wrongIndices[Math.floor(Math.random() * wrongIndices.length)];
        if (!toHide.includes(randomIndex)) {
            toHide.push(randomIndex);
        }
    }

    toHide.forEach(index => {
        answerBtns[index].disabled = true;
    });

    audioController.playCue('lifeline');
}

// Lifeline: Phone a Friend
function usePhoneAFriend() {
    if (!gameState.lifelines.phoneAFriend) return;
    
    gameState.lifelines.phoneAFriend = false;
    document.getElementById('phone-friend').disabled = true;
    
    const overlay = document.getElementById('phone-overlay');
    overlay.classList.remove('hidden');
    
    const questionData = gameState.questionsData[gameState.currentQuestion];
    const correctIndex = questionData.correct;
    const answerKeys = ['A', 'B', 'C', 'D'];
    
    // Simulate friend thinking
    let timeLeft = 30;
    const timerElement = document.getElementById('phone-timer');
    const textElement = document.getElementById('phone-text');
    
    textElement.textContent = "Your friend is thinking...";
    
    const timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;
        
        if (timeLeft === 20) {
            // Friend gives answer (70% chance of being correct)
            const isCorrect = Math.random() < 0.7;
            let friendAnswer;
            
            if (isCorrect) {
                friendAnswer = answerKeys[correctIndex];
            } else {
                const wrongIndices = [0, 1, 2, 3].filter(i => i !== correctIndex);
                friendAnswer = answerKeys[wrongIndices[Math.floor(Math.random() * wrongIndices.length)]];
            }
            
            textElement.textContent = `Your friend says: "I'm ${isCorrect ? 'pretty sure' : 'not certain, but I think'} it's ${friendAnswer}."`;
        }
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            document.getElementById('phone-overlay').classList.add('hidden');
        }
    }, 1000);

    audioController.playCue('lifeline');
}

// Lifeline: Ask the Audience
function useAskAudience() {
    if (!gameState.lifelines.askAudience) return;
    
    gameState.lifelines.askAudience = false;
    document.getElementById('ask-audience').disabled = true;
    
    const overlay = document.getElementById('audience-overlay');
    overlay.classList.remove('hidden');
    
    const questionData = gameState.questionsData[gameState.currentQuestion];
    const correctIndex = questionData.correct;
    
    // Generate audience votes (biased towards correct answer)
    const votes = [0, 0, 0, 0];
    let remainingVotes = 100;
    
    // Give correct answer 40-60% of votes
    votes[correctIndex] = 40 + Math.floor(Math.random() * 21);
    remainingVotes -= votes[correctIndex];
    
    // Distribute remaining votes randomly
    for (let i = 0; i < 4; i++) {
        if (i !== correctIndex) {
            if (remainingVotes > 0) {
                const vote = Math.floor(Math.random() * (remainingVotes / 2));
                votes[i] = vote;
                remainingVotes -= vote;
            }
        }
    }
    
    // Add remaining votes to a random answer
    if (remainingVotes > 0) {
        votes[Math.floor(Math.random() * 4)] += remainingVotes;
    }
    
    // Display results
    const answerKeys = ['a', 'b', 'c', 'd'];
    answerKeys.forEach((key, index) => {
        const bar = document.getElementById(`bar-${key}`);
        const percent = document.getElementById(`percent-${key}`);
        
        setTimeout(() => {
            bar.style.width = `${votes[index]}%`;
            percent.textContent = `${votes[index]}%`;
        }, 100);
    });
    
    audioController.playCue('lifeline');
}

// Web Audio oscillator placeholder removed in favour of tag-based audioController

// Setup Event Listeners
function setupEventListeners() {
    // Answer buttons
    document.querySelectorAll('.answer-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            selectAnswer(btn.dataset.answer);
            confirmAnswer();
        });
    });
    
    // Lifeline buttons
    document.getElementById('fifty-fifty').addEventListener('click', useFiftyFifty);
    document.getElementById('phone-friend').addEventListener('click', usePhoneAFriend);
    document.getElementById('ask-audience').addEventListener('click', useAskAudience);
    
    // Mute button
    document.getElementById('mute-btn').addEventListener('click', () => {
        gameState.isMuted = !gameState.isMuted;
        document.getElementById('mute-icon').textContent = gameState.isMuted ? '🔇' : '🔊';
        audioController.setMuted(gameState.isMuted);
    });
    
    // Overlay close buttons
    document.getElementById('close-phone').addEventListener('click', () => {
        document.getElementById('phone-overlay').classList.add('hidden');
    });
    
    document.getElementById('close-audience').addEventListener('click', () => {
        document.getElementById('audience-overlay').classList.add('hidden');
    });
    
    document.getElementById('restart-game').addEventListener('click', () => {
        document.getElementById('gameover-overlay').classList.add('hidden');
        initGame();
    });

    // Commercial break
    const commercialStart = document.getElementById('commercial-start');
    const commercialEnd = document.getElementById('commercial-end');

    commercialStart.addEventListener('click', () => {
        openRandomCommercial();
        commercialStart.classList.add('hidden');
        commercialEnd.classList.remove('hidden');
    });

    commercialEnd.addEventListener('click', () => {
        finishCommercialBreak();
    });
    
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        const key = e.key.toUpperCase();
        
        // Number keys 1-4
        if (['1', '2', '3', '4'].includes(key)) {
            const answerMap = { '1': 'A', '2': 'B', '3': 'C', '4': 'D' };
            selectAnswer(answerMap[key]);
        }
        
        // Letter keys A-D
        if (['A', 'B', 'C', 'D'].includes(key)) {
            selectAnswer(key);
        }
        
        // Enter to confirm
        if (key === 'ENTER') {
            confirmAnswer();
        }
    });
}

// Start the game when page loads
window.addEventListener('DOMContentLoaded', initGame);
