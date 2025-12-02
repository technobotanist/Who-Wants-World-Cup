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
    isLockingIn: false
};

// Basic audio controller using direct MyInstants URLs
const audioController = {
    currentBed: null,
    muted: false,
    beds: {
        // looping suspense / thinking bed
        question: new Audio('https://www.myinstants.com/media/sounds/millionaire-suspense-29485.mp3')
    },
    cues: {
        // question revealed
        playQuestion: new Audio('https://www.myinstants.com/media/sounds/play-millionaire-30998.mp3'),
        // checkpoint final answer sting
        final: new Audio('https://www.myinstants.com/media/sounds/final-millionaire-97279.mp3'),
        // correct / wrong answer reveals
        correct: new Audio('https://www.myinstants.com/media/sounds/correct-millionaire-82475.mp3'),
        wrong: new Audio('https://www.myinstants.com/media/sounds/wrong-millionaire-93692.mp3'),
        // lifeline music
        lifeline: new Audio('https://www.myinstants.com/media/sounds/lifeline-millionaire-51056.mp3')
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

// Prize Ladder CLP (in order from question 1 to 15)
const prizeLadder = [
    { question: 1, prize: "CLP 100.000", milestone: false },
    { question: 2, prize: "CLP 200.000", milestone: false },
    { question: 3, prize: "CLP 300.000", milestone: false },
    { question: 4, prize: "CLP 500.000", milestone: false },
    { question: 5, prize: "CLP 1.000.000", milestone: true },
    { question: 6, prize: "CLP 2.000.000", milestone: false },
    { question: 7, prize: "CLP 4.000.000", milestone: false },
    { question: 8, prize: "CLP 8.000.000", milestone: false },
    { question: 9, prize: "CLP 16.000.000", milestone: false },
    { question: 10, prize: "CLP 32.000.000", milestone: true },
    { question: 11, prize: "CLP 64.000.000", milestone: false },
    { question: 12, prize: "CLP 125.000.000", milestone: false },
    { question: 13, prize: "CLP 250.000.000", milestone: false },
    { question: 14, prize: "CLP 500.000.000", milestone: false },
    { question: 15, prize: "CLP 1.000.000.000", milestone: true }
];

// Questions Database
const questions = [
    {
        question: "Which country hosted the first FIFA World Cup in 1930?",
        answers: ["Brazil", "Uruguay", "Argentina", "England"],
        correct: 1
    },
    {
        question: "How many teams participate in the FIFA World Cup finals (since 1998)?",
        answers: ["16", "24", "32", "48"],
        correct: 2
    },
    {
        question: "Which player has scored the most World Cup goals in history?",
        answers: ["Pelé", "Ronaldo", "Miroslav Klose", "Diego Maradona"],
        correct: 2
    },
    {
        question: "Which country has won the most FIFA World Cup titles?",
        answers: ["Germany", "Argentina", "Brazil", "Italy"],
        correct: 2
    },
    {
        question: "In which year did Diego Maradona score the famous 'Hand of God' goal?",
        answers: ["1982", "1986", "1990", "1994"],
        correct: 1
    },
    {
        question: "Which country won the 2018 FIFA World Cup?",
        answers: ["Germany", "France", "Croatia", "Belgium"],
        correct: 1
    },
    {
        question: "What is the name of the 2022 World Cup official match ball?",
        answers: ["Jabulani", "Brazuca", "Telstar", "Al Rihla"],
        correct: 3
    },
    {
        question: "Which player holds the record for most World Cup appearances?",
        answers: ["Lothar Matthäus", "Miroslav Klose", "Lionel Messi", "Cristiano Ronaldo"],
        correct: 2
    },
    {
        question: "Which stadium hosted the 2014 World Cup final?",
        answers: ["Estadio Azteca", "Wembley", "Maracanã", "Allianz Arena"],
        correct: 2
    },
    {
        question: "Who was the top scorer of the 2010 World Cup?",
        answers: ["Diego Forlán", "David Villa", "Thomas Müller", "Wesley Sneijder"],
        correct: 2
    },
    {
        question: "Which country has never missed a World Cup finals?",
        answers: ["Argentina", "Germany", "Brazil", "Italy"],
        correct: 2
    },
    {
        question: "What is the fastest goal scored in World Cup history?",
        answers: ["11 seconds", "15 seconds", "27 seconds", "45 seconds"],
        correct: 0
    },
    {
        question: "Who won the Golden Ball at the 2022 World Cup?",
        answers: ["Kylian Mbappé", "Lionel Messi", "Luka Modrić", "Cristiano Ronaldo"],
        correct: 1
    },
    {
        question: "Which country hosted the 2006 FIFA World Cup?",
        answers: ["France", "Italy", "Germany", "Spain"],
        correct: 2
    },
    {
        question: "How many times has England won the FIFA World Cup?",
        answers: ["0", "1", "2", "3"],
        correct: 1
    }
];

// Initialize Game
function initGame() {
    gameState.questionsData = [...questions];
    gameState.currentQuestion = 0;
    gameState.score = 0;
    gameState.selectedAnswer = null;
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
            loadQuestion();
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

// End Game
function endGame(won) {
    const overlay = document.getElementById('gameover-overlay');
    const title = document.getElementById('gameover-title');
    const message = document.getElementById('gameover-message');
    
    if (won) {
        title.textContent = "🎉 Congratulations! 🎉";
        message.textContent = `You've won: ${prizeLadder[prizeLadder.length - 1].prize} (World Cup Trip!) 🏆⚽`;
        playSound('win');
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
        playSound('lose');
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

    playSound('lifeline');
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
