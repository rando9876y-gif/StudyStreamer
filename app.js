document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

function initApp() {
    loadTheme();
    initNavigation();
    initPomodoro();
    initBlurting();
    initAIGrading();
    initFlashcards();
    initTestGenerator();
    initMindMap();
    initNotes();
    initChecklist();
    initHabits();
    initKanban();
    initCalendar();
    initWriting();
    initPlanner();
    initJournal();
    initStudyLogger();
    initSettings();
    initModals();
    updateDashboard();
}

function loadTheme() {
    const savedTheme = localStorage.getItem('studystream_theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === savedTheme);
    });
}

function navigateTo(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    
    const page = document.getElementById(pageId);
    const navItem = document.querySelector(`[data-page="${pageId}"]`);
    
    if (page) page.classList.add('active');
    if (navItem) navItem.classList.add('active');
}

function initNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(item.dataset.page);
        });
    });
}

let pomodoroTimer = {
    interval: null,
    timeLeft: 25 * 60,
    totalTime: 25 * 60,
    isRunning: false,
    mode: 'work'
};

function initPomodoro() {
    const startBtn = document.getElementById('timer-start');
    const pauseBtn = document.getElementById('timer-pause');
    const resetBtn = document.getElementById('timer-reset');
    const modeBtns = document.querySelectorAll('.timer-mode');
    const customApply = document.getElementById('apply-custom-times');
    const loadYoutube = document.getElementById('load-youtube');

    loadPomodoroCount();

    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);

    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            pomodoroTimer.mode = btn.dataset.mode;
            pomodoroTimer.totalTime = parseInt(btn.dataset.time) * 60;
            pomodoroTimer.timeLeft = pomodoroTimer.totalTime;
            updateTimerDisplay();
            resetTimer();
        });
    });

    customApply.addEventListener('click', () => {
        const workTime = parseInt(document.getElementById('custom-work').value) || 25;
        const shortTime = parseInt(document.getElementById('custom-short').value) || 5;
        const longTime = parseInt(document.getElementById('custom-long').value) || 15;

        modeBtns[0].dataset.time = workTime;
        modeBtns[0].textContent = `Work (${workTime}m)`;
        modeBtns[1].dataset.time = shortTime;
        modeBtns[1].textContent = `Short Break (${shortTime}m)`;
        modeBtns[2].dataset.time = longTime;
        modeBtns[2].textContent = `Long Break (${longTime}m)`;

        if (pomodoroTimer.mode === 'work') {
            pomodoroTimer.totalTime = workTime * 60;
            pomodoroTimer.timeLeft = workTime * 60;
        }
        updateTimerDisplay();
    });

    loadYoutube.addEventListener('click', () => {
        const url = document.getElementById('youtube-url').value;
        embedYoutube(url);
    });

    updateTimerDisplay();
}

function startTimer() {
    if (pomodoroTimer.isRunning) return;
    
    pomodoroTimer.isRunning = true;
    document.getElementById('timer-start').disabled = true;
    document.getElementById('timer-pause').disabled = false;

    pomodoroTimer.interval = setInterval(() => {
        pomodoroTimer.timeLeft--;
        updateTimerDisplay();

        if (pomodoroTimer.timeLeft <= 0) {
            timerComplete();
        }
    }, 1000);
}

function pauseTimer() {
    pomodoroTimer.isRunning = false;
    clearInterval(pomodoroTimer.interval);
    document.getElementById('timer-start').disabled = false;
    document.getElementById('timer-pause').disabled = true;
}

function resetTimer() {
    pauseTimer();
    pomodoroTimer.timeLeft = pomodoroTimer.totalTime;
    updateTimerDisplay();
}

function timerComplete() {
    pauseTimer();
    
    if (pomodoroTimer.mode === 'work') {
        incrementPomodoroCount();
        showNotification('Pomodoro Complete!', 'Time for a break!');
    } else {
        showNotification('Break Over!', 'Ready to focus again?');
    }

    if (document.getElementById('sound-notifications').checked) {
        playNotificationSound();
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(pomodoroTimer.timeLeft / 60);
    const seconds = pomodoroTimer.timeLeft % 60;
    
    document.getElementById('timer-minutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('timer-seconds').textContent = seconds.toString().padStart(2, '0');

    const circle = document.querySelector('.progress-ring-circle');
    const circumference = 2 * Math.PI * 120;
    const progress = pomodoroTimer.timeLeft / pomodoroTimer.totalTime;
    circle.style.strokeDasharray = circumference;
    circle.style.strokeDashoffset = circumference * (1 - progress);
}

function loadPomodoroCount() {
    const today = new Date().toDateString();
    const data = JSON.parse(localStorage.getItem('studystream_pomodoro') || '{}');
    const count = data[today] || 0;
    document.getElementById('pomo-count').textContent = count;
}

function incrementPomodoroCount() {
    const today = new Date().toDateString();
    const data = JSON.parse(localStorage.getItem('studystream_pomodoro') || '{}');
    data[today] = (data[today] || 0) + 1;
    localStorage.setItem('studystream_pomodoro', JSON.stringify(data));
    document.getElementById('pomo-count').textContent = data[today];
    updateDashboard();
}

function embedYoutube(url) {
    const container = document.getElementById('youtube-player-container');
    const videoId = extractYoutubeId(url);
    
    if (videoId) {
        container.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
    } else {
        container.innerHTML = '<p style="color: var(--danger);">Invalid YouTube URL</p>';
    }
}

function extractYoutubeId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

let mediaRecorder;
let audioChunks = [];
let recognition;
let audioContext;
let analyserNode;
let audioBlob;
let audioURL;
let animationId;

function initBlurting() {
    const startBtn = document.getElementById('start-recording');
    const stopBtn = document.getElementById('stop-recording');
    const analyzeBtn = document.getElementById('analyze-blurt');

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event) => {
            let transcript = '';
            for (let i = 0; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            document.getElementById('transcription-output').innerHTML = `<p>${transcript}</p>`;
        };

        recognition.onerror = (event) => {
            document.getElementById('recording-status').textContent = 'Error: ' + event.error;
        };
    }

    startBtn.addEventListener('click', startRecording);
    stopBtn.addEventListener('click', stopRecording);
    analyzeBtn.addEventListener('click', analyzeBlurt);
}

async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyserNode = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyserNode);
        analyserNode.fftSize = 256;
        
        visualizeAudio();
        
        audioChunks = [];
        mediaRecorder = new MediaRecorder(stream);
        
        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = () => {
            audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            audioURL = URL.createObjectURL(audioBlob);
            
            const visualizer = document.getElementById('audio-visualizer');
            visualizer.innerHTML = `
                <audio controls src="${audioURL}" style="width: 100%;"></audio>
            `;
            
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        };
        
        mediaRecorder.start();
        
        if (recognition) {
            recognition.start();
        }
        
        document.getElementById('start-recording').disabled = true;
        document.getElementById('stop-recording').disabled = false;
        document.getElementById('recording-status').textContent = '🔴 Recording...';
        document.getElementById('transcription-output').innerHTML = '<p class="placeholder">Listening...</p>';
        
    } catch (err) {
        document.getElementById('recording-status').textContent = 'Error: ' + err.message;
        console.error('Recording error:', err);
    }
}

function visualizeAudio() {
    const visualizer = document.getElementById('audio-visualizer');
    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    visualizer.innerHTML = '';
    for (let i = 0; i < 32; i++) {
        const bar = document.createElement('div');
        bar.className = 'visualizer-bar';
        bar.style.height = '5px';
        visualizer.appendChild(bar);
    }
    
    const bars = visualizer.querySelectorAll('.visualizer-bar');
    
    function draw() {
        animationId = requestAnimationFrame(draw);
        analyserNode.getByteFrequencyData(dataArray);
        
        bars.forEach((bar, i) => {
            const value = dataArray[i * 4];
            const height = Math.max(5, (value / 255) * 50);
            bar.style.height = height + 'px';
        });
    }
    
    draw();
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
    
    if (recognition) {
        recognition.stop();
    }
    
    if (audioContext) {
        audioContext.close();
    }
    
    document.getElementById('start-recording').disabled = false;
    document.getElementById('stop-recording').disabled = true;
    document.getElementById('recording-status').textContent = 'Recording saved. You can play it back above.';
}

function analyzeBlurt() {
    const notes = document.getElementById('blurt-notes').value.toLowerCase();
    const transcription = document.getElementById('transcription-output').textContent.toLowerCase();
    
    if (!notes || transcription === 'your spoken words will appear here...' || transcription === 'listening...') {
        document.getElementById('blurt-results').innerHTML = '<p>Please enter notes and record your recall first.</p>';
        return;
    }

    const notesWords = notes.split(/\s+/).filter(w => w.length > 3);
    const transcriptionWords = transcription.split(/\s+/).filter(w => w.length > 3);
    
    const uniqueNoteWords = [...new Set(notesWords)];
    const foundWords = uniqueNoteWords.filter(w => transcriptionWords.some(tw => tw.includes(w) || w.includes(tw)));
    const missingWords = uniqueNoteWords.filter(w => !foundWords.includes(w));
    
    const score = Math.round((foundWords.length / uniqueNoteWords.length) * 100) || 0;
    
    let feedback = '';
    if (score >= 80) feedback = 'Excellent recall! You remembered most key concepts.';
    else if (score >= 60) feedback = 'Good job! Some concepts need review.';
    else if (score >= 40) feedback = 'Fair recall. Consider reviewing your notes more thoroughly.';
    else feedback = 'Needs improvement. Try using active recall techniques.';

    document.getElementById('blurt-results').innerHTML = `
        <div class="result-score">${score}%</div>
        <div class="result-section">
            <h4>Feedback</h4>
            <p>${feedback}</p>
        </div>
        <div class="result-section">
            <h4>Concepts Found (${foundWords.length})</h4>
            <p>${foundWords.map(w => `<span class="highlight-found">${w}</span>`).join(' ') || 'None'}</p>
        </div>
        <div class="result-section">
            <h4>Missing Concepts (${missingWords.length})</h4>
            <p>${missingWords.slice(0, 20).map(w => `<span class="highlight-missing">${w}</span>`).join(' ') || 'None'}</p>
        </div>
    `;
}

function initAIGrading() {
    document.getElementById('grade-writing').addEventListener('click', gradeWriting);
}

function gradeWriting() {
    const text = document.getElementById('grading-text').value;
    if (!text) {
        document.getElementById('grading-results').innerHTML = '<p>Please enter some text to analyze.</p>';
        return;
    }

    const checkGrammar = document.getElementById('check-grammar').checked;
    const checkStructure = document.getElementById('check-structure').checked;
    const checkClarity = document.getElementById('check-clarity').checked;
    const checkVocabulary = document.getElementById('check-vocabulary').checked;

    const scores = {};
    const feedback = {};

    if (checkGrammar) {
        scores.grammar = analyzeGrammar(text);
        feedback.grammar = scores.grammar >= 80 ? 'Good grammar and spelling.' : 'Some grammar issues detected. Review sentence structure.';
    }

    if (checkStructure) {
        scores.structure = analyzeStructure(text);
        feedback.structure = scores.structure >= 80 ? 'Well-organized content.' : 'Consider using more paragraphs and transitions.';
    }

    if (checkClarity) {
        scores.clarity = analyzeClarity(text);
        feedback.clarity = scores.clarity >= 80 ? 'Clear and readable.' : 'Sentences may be too long or complex. Try simplifying.';
    }

    if (checkVocabulary) {
        scores.vocabulary = analyzeVocabulary(text);
        feedback.vocabulary = scores.vocabulary >= 80 ? 'Good vocabulary variety.' : 'Consider using more varied vocabulary.';
    }

    const avgScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length;
    const grade = getLetterGrade(avgScore);

    let resultsHTML = `<div class="grade-score grade-${grade.toLowerCase()}">${grade}</div>`;
    resultsHTML += '<div class="grade-breakdown">';
    
    for (const [key, score] of Object.entries(scores)) {
        resultsHTML += `
            <div class="breakdown-item">
                <h4>${key.charAt(0).toUpperCase() + key.slice(1)} - ${Math.round(score)}%</h4>
                <div class="breakdown-bar"><div class="breakdown-fill" style="width: ${score}%"></div></div>
                <p>${feedback[key]}</p>
            </div>
        `;
    }
    
    resultsHTML += '</div>';
    document.getElementById('grading-results').innerHTML = resultsHTML;
}

function analyzeGrammar(text) {
    let score = 100;
    const commonErrors = [
        /\bi\s/g, /\s\s+/g, /[.!?][a-z]/g, /,\s*,/g
    ];
    commonErrors.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) score -= matches.length * 2;
    });
    return Math.max(0, Math.min(100, score));
}

function analyzeStructure(text) {
    let score = 50;
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim());
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    
    if (paragraphs.length >= 3) score += 20;
    if (paragraphs.length >= 5) score += 10;
    if (sentences.length >= 5) score += 10;
    if (text.includes('however') || text.includes('therefore') || text.includes('furthermore')) score += 10;
    
    return Math.min(100, score);
}

function analyzeClarity(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    const avgLength = sentences.reduce((sum, s) => sum + s.split(' ').length, 0) / sentences.length;
    
    if (avgLength < 15) return 90;
    if (avgLength < 20) return 80;
    if (avgLength < 25) return 70;
    if (avgLength < 30) return 60;
    return 50;
}

function analyzeVocabulary(text) {
    const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
    const uniqueWords = new Set(words);
    const ratio = uniqueWords.size / words.length;
    return Math.min(100, ratio * 150);
}

function getLetterGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
}

let flashcardData = {
    decks: [],
    currentDeck: null,
    currentCardIndex: 0,
    isFlipped: false
};

function initFlashcards() {
    loadFlashcards();
    
    document.getElementById('create-deck').addEventListener('click', createDeck);
    document.getElementById('add-card').addEventListener('click', addCard);
    document.getElementById('study-deck').addEventListener('click', startStudy);
    document.getElementById('shuffle-deck').addEventListener('click', shuffleDeck);
    document.getElementById('flip-card').addEventListener('click', flipCard);
    document.getElementById('prev-card').addEventListener('click', prevCard);
    document.getElementById('next-card').addEventListener('click', nextCard);
    document.getElementById('speak-card').addEventListener('click', speakCard);
    document.getElementById('exit-study').addEventListener('click', exitStudy);
    document.getElementById('flashcard').addEventListener('click', flipCard);
    
    renderDeckList();
}

function loadFlashcards() {
    const saved = localStorage.getItem('studystream_flashcards');
    if (saved) {
        flashcardData.decks = JSON.parse(saved);
    }
}

function saveFlashcards() {
    localStorage.setItem('studystream_flashcards', JSON.stringify(flashcardData.decks));
}

function renderDeckList() {
    const container = document.getElementById('deck-list');
    container.innerHTML = flashcardData.decks.map((deck, i) => `
        <div class="deck-item ${flashcardData.currentDeck === i ? 'active' : ''}" data-index="${i}">
            <span>${deck.name}</span>
            <span class="deck-item-count">${deck.cards.length} cards</span>
        </div>
    `).join('');
    
    container.querySelectorAll('.deck-item').forEach(item => {
        item.addEventListener('click', () => selectDeck(parseInt(item.dataset.index)));
    });
}

function selectDeck(index) {
    flashcardData.currentDeck = index;
    const deck = flashcardData.decks[index];
    
    document.getElementById('current-deck-name').textContent = deck.name;
    document.getElementById('add-card').style.display = 'inline-block';
    document.getElementById('study-deck').style.display = 'inline-block';
    document.getElementById('shuffle-deck').style.display = 'inline-block';
    
    renderCards();
    renderDeckList();
}

function renderCards() {
    const deck = flashcardData.decks[flashcardData.currentDeck];
    const container = document.getElementById('cards-container');
    
    if (!deck || deck.cards.length === 0) {
        container.innerHTML = '<p class="empty-state">No cards yet. Add some!</p>';
        return;
    }
    
    container.innerHTML = deck.cards.map((card, i) => `
        <div class="card-item" data-index="${i}">
            <div class="card-item-front">${card.front}</div>
            <div class="card-item-back">${card.back}</div>
        </div>
    `).join('');
}

function createDeck() {
    showModal('Create New Deck', `
        <input type="text" id="new-deck-name" placeholder="Deck name">
    `, [
        { text: 'Cancel', class: 'btn', action: closeModal },
        { text: 'Create', class: 'btn primary', action: () => {
            const name = document.getElementById('new-deck-name').value;
            if (name) {
                flashcardData.decks.push({ name, cards: [] });
                saveFlashcards();
                renderDeckList();
                closeModal();
            }
        }}
    ]);
}

function addCard() {
    showModal('Add New Card', `
        <input type="text" id="card-front" placeholder="Front (question)" style="margin-bottom: 10px;">
        <textarea id="card-back" placeholder="Back (answer)" rows="3"></textarea>
    `, [
        { text: 'Cancel', class: 'btn', action: closeModal },
        { text: 'Add', class: 'btn primary', action: () => {
            const front = document.getElementById('card-front').value;
            const back = document.getElementById('card-back').value;
            if (front && back) {
                flashcardData.decks[flashcardData.currentDeck].cards.push({ front, back });
                saveFlashcards();
                renderCards();
                closeModal();
                updateDashboard();
            }
        }}
    ]);
}

function startStudy() {
    const deck = flashcardData.decks[flashcardData.currentDeck];
    if (!deck || deck.cards.length === 0) return;
    
    flashcardData.currentCardIndex = 0;
    flashcardData.isFlipped = false;
    
    document.getElementById('deck-view').style.display = 'none';
    document.getElementById('study-view').style.display = 'flex';
    
    updateStudyCard();
}

function exitStudy() {
    document.getElementById('deck-view').style.display = 'block';
    document.getElementById('study-view').style.display = 'none';
}

function updateStudyCard() {
    const deck = flashcardData.decks[flashcardData.currentDeck];
    const card = deck.cards[flashcardData.currentCardIndex];
    
    document.getElementById('card-front-text').textContent = card.front;
    document.getElementById('card-back-text').textContent = card.back;
    document.getElementById('study-progress-text').textContent = 
        `Card ${flashcardData.currentCardIndex + 1} of ${deck.cards.length}`;
    document.getElementById('study-progress-bar').style.width = 
        `${((flashcardData.currentCardIndex + 1) / deck.cards.length) * 100}%`;
    
    document.getElementById('flashcard').classList.remove('flipped');
    flashcardData.isFlipped = false;
}

function flipCard() {
    document.getElementById('flashcard').classList.toggle('flipped');
    flashcardData.isFlipped = !flashcardData.isFlipped;
}

function prevCard() {
    const deck = flashcardData.decks[flashcardData.currentDeck];
    if (flashcardData.currentCardIndex > 0) {
        flashcardData.currentCardIndex--;
        updateStudyCard();
    }
}

function nextCard() {
    const deck = flashcardData.decks[flashcardData.currentDeck];
    if (flashcardData.currentCardIndex < deck.cards.length - 1) {
        flashcardData.currentCardIndex++;
        updateStudyCard();
        incrementCardsReviewed();
    }
}

function speakCard() {
    const deck = flashcardData.decks[flashcardData.currentDeck];
    const card = deck.cards[flashcardData.currentCardIndex];
    const text = flashcardData.isFlipped ? card.back : card.front;
    
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        speechSynthesis.speak(utterance);
    }
}

function shuffleDeck() {
    const deck = flashcardData.decks[flashcardData.currentDeck];
    for (let i = deck.cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck.cards[i], deck.cards[j]] = [deck.cards[j], deck.cards[i]];
    }
    saveFlashcards();
    renderCards();
}

function incrementCardsReviewed() {
    const today = new Date().toDateString();
    const data = JSON.parse(localStorage.getItem('studystream_cards_reviewed') || '{}');
    data[today] = (data[today] || 0) + 1;
    localStorage.setItem('studystream_cards_reviewed', JSON.stringify(data));
}

function initTestGenerator() {
    document.getElementById('generate-test').addEventListener('click', generateTest);
}

function generateTest() {
    const source = document.getElementById('test-source').value;
    const count = parseInt(document.getElementById('question-count').value) || 5;
    const type = document.getElementById('question-type').value;
    
    if (!source) {
        document.getElementById('test-output').innerHTML = '<p class="empty-state">Please enter study material first.</p>';
        return;
    }

    const sentences = source.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const questions = [];
    
    for (let i = 0; i < Math.min(count, sentences.length); i++) {
        const sentence = sentences[i].trim();
        const words = sentence.split(/\s+/);
        
        let questionType = type;
        if (type === 'mixed') {
            questionType = ['fill', 'tf', 'short'][Math.floor(Math.random() * 3)];
        }

        if (questionType === 'fill' && words.length > 4) {
            const wordIndex = Math.floor(Math.random() * (words.length - 2)) + 1;
            const answer = words[wordIndex];
            words[wordIndex] = '_____';
            questions.push({
                type: 'fill',
                question: words.join(' '),
                answer: answer
            });
        } else if (questionType === 'tf') {
            questions.push({
                type: 'tf',
                question: sentence,
                answer: 'True'
            });
        } else {
            questions.push({
                type: 'short',
                question: `Explain: ${sentence.substring(0, 50)}...`,
                answer: sentence
            });
        }
    }

    let html = '';
    questions.forEach((q, i) => {
        html += `
            <div class="test-question">
                <h4>Question ${i + 1} (${q.type === 'fill' ? 'Fill in the blank' : q.type === 'tf' ? 'True/False' : 'Short Answer'})</h4>
                <p>${q.question}</p>
                <input type="text" class="test-answer" placeholder="Your answer...">
                <details style="margin-top: 10px;">
                    <summary style="cursor: pointer; color: var(--accent);">Show Answer</summary>
                    <p style="margin-top: 5px; color: var(--success);">${q.answer}</p>
                </details>
            </div>
        `;
    });

    document.getElementById('test-output').innerHTML = html;
}

let mindmapNodes = [];

function initMindMap() {
    document.getElementById('create-mindmap').addEventListener('click', createMindmap);
    document.getElementById('add-branch').addEventListener('click', addBranch);
    document.getElementById('clear-mindmap').addEventListener('click', clearMindmap);
}

function createMindmap() {
    const topic = document.getElementById('central-topic').value;
    if (!topic) return;

    const canvas = document.getElementById('mindmap-canvas');
    canvas.innerHTML = '';
    mindmapNodes = [];

    const centerX = canvas.offsetWidth / 2 - 75;
    const centerY = canvas.offsetHeight / 2 - 25;

    const node = document.createElement('div');
    node.className = 'mindmap-node central';
    node.textContent = topic;
    node.style.left = centerX + 'px';
    node.style.top = centerY + 'px';
    node.draggable = true;
    
    makeDraggable(node);
    canvas.appendChild(node);
    
    mindmapNodes.push({ element: node, x: centerX, y: centerY, parent: null });
}

function addBranch() {
    if (mindmapNodes.length === 0) return;

    showModal('Add Branch', `
        <input type="text" id="branch-text" placeholder="Branch text">
    `, [
        { text: 'Cancel', class: 'btn', action: closeModal },
        { text: 'Add', class: 'btn primary', action: () => {
            const text = document.getElementById('branch-text').value;
            if (text) {
                const canvas = document.getElementById('mindmap-canvas');
                const color = document.getElementById('branch-color').value;
                const parent = mindmapNodes[0];
                
                const angle = (mindmapNodes.length - 1) * (Math.PI / 4);
                const radius = 180;
                const x = parent.x + radius * Math.cos(angle);
                const y = parent.y + radius * Math.sin(angle);

                const line = document.createElement('div');
                line.className = 'mindmap-line';
                const dx = x - parent.x;
                const dy = y - parent.y;
                const length = Math.sqrt(dx * dx + dy * dy);
                const angle2 = Math.atan2(dy, dx);
                line.style.width = length + 'px';
                line.style.left = (parent.x + 75) + 'px';
                line.style.top = (parent.y + 25) + 'px';
                line.style.transform = `rotate(${angle2}rad)`;
                line.style.background = color;
                canvas.appendChild(line);

                const node = document.createElement('div');
                node.className = 'mindmap-node branch';
                node.textContent = text;
                node.style.left = x + 'px';
                node.style.top = y + 'px';
                node.style.borderColor = color;
                node.style.borderWidth = '3px';
                node.style.borderStyle = 'solid';
                makeDraggable(node);
                canvas.appendChild(node);

                mindmapNodes.push({ element: node, x, y, parent, line });
                closeModal();
            }
        }}
    ]);
}

function clearMindmap() {
    document.getElementById('mindmap-canvas').innerHTML = '<p class="empty-state">Enter a central topic to start your mind map</p>';
    mindmapNodes = [];
}

function makeDraggable(element) {
    let offsetX, offsetY;
    
    element.addEventListener('mousedown', (e) => {
        offsetX = e.clientX - element.offsetLeft;
        offsetY = e.clientY - element.offsetTop;
        
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', () => {
            document.removeEventListener('mousemove', drag);
        });
    });

    function drag(e) {
        element.style.left = (e.clientX - offsetX) + 'px';
        element.style.top = (e.clientY - offsetY) + 'px';
    }
}

let notesData = {
    notes: [],
    currentNote: null
};

function initNotes() {
    loadNotes();
    
    document.getElementById('new-note').addEventListener('click', newNote);
    document.getElementById('save-note').addEventListener('click', saveNote);
    document.getElementById('delete-note').addEventListener('click', deleteNote);
    document.getElementById('notes-search').addEventListener('input', searchNotes);
    
    document.querySelectorAll('.toolbar-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.execCommand(btn.dataset.command, false, null);
        });
    });
    
    renderNotesList();
}

function loadNotes() {
    const saved = localStorage.getItem('studystream_notes');
    if (saved) {
        notesData.notes = JSON.parse(saved);
    }
}

function saveNotesToStorage() {
    localStorage.setItem('studystream_notes', JSON.stringify(notesData.notes));
}

function renderNotesList(filter = '') {
    const container = document.getElementById('notes-list');
    const filtered = notesData.notes.filter(n => 
        n.title.toLowerCase().includes(filter.toLowerCase()) ||
        n.content.toLowerCase().includes(filter.toLowerCase())
    );
    
    container.innerHTML = filtered.map((note, i) => `
        <div class="note-item ${notesData.currentNote === i ? 'active' : ''}" data-index="${i}">
            <div class="note-item-title">${note.title || 'Untitled'}</div>
            <div class="note-item-date">${new Date(note.date).toLocaleDateString()}</div>
        </div>
    `).join('');
    
    container.querySelectorAll('.note-item').forEach(item => {
        item.addEventListener('click', () => selectNote(parseInt(item.dataset.index)));
    });
}

function selectNote(index) {
    notesData.currentNote = index;
    const note = notesData.notes[index];
    
    document.getElementById('note-title').value = note.title;
    document.getElementById('note-content').innerHTML = note.content;
    
    renderNotesList();
}

function newNote() {
    notesData.notes.unshift({
        title: '',
        content: '',
        date: new Date().toISOString()
    });
    notesData.currentNote = 0;
    saveNotesToStorage();
    renderNotesList();
    selectNote(0);
}

function saveNote() {
    if (notesData.currentNote === null) return;
    
    notesData.notes[notesData.currentNote] = {
        title: document.getElementById('note-title').value,
        content: document.getElementById('note-content').innerHTML,
        date: new Date().toISOString()
    };
    
    saveNotesToStorage();
    renderNotesList();
}

function deleteNote() {
    if (notesData.currentNote === null) return;
    
    notesData.notes.splice(notesData.currentNote, 1);
    notesData.currentNote = null;
    
    document.getElementById('note-title').value = '';
    document.getElementById('note-content').innerHTML = '';
    
    saveNotesToStorage();
    renderNotesList();
}

function searchNotes(e) {
    renderNotesList(e.target.value);
}

let checklistData = {
    tasks: [],
    filter: 'all'
};

function initChecklist() {
    loadChecklist();
    
    document.getElementById('add-task').addEventListener('click', addTask);
    document.getElementById('new-task').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
    document.getElementById('clear-completed').addEventListener('click', clearCompleted);
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            checklistData.filter = btn.dataset.filter;
            renderTasks();
        });
    });
    
    renderTasks();
}

function loadChecklist() {
    const saved = localStorage.getItem('studystream_checklist');
    if (saved) {
        checklistData.tasks = JSON.parse(saved);
    }
}

function saveChecklist() {
    localStorage.setItem('studystream_checklist', JSON.stringify(checklistData.tasks));
    updateDashboard();
}

function addTask() {
    const input = document.getElementById('new-task');
    const text = input.value.trim();
    
    if (text) {
        checklistData.tasks.push({
            id: Date.now(),
            text,
            completed: false,
            date: new Date().toISOString()
        });
        input.value = '';
        saveChecklist();
        renderTasks();
    }
}

function renderTasks() {
    const container = document.getElementById('task-list');
    let filtered = checklistData.tasks;
    
    if (checklistData.filter === 'active') {
        filtered = checklistData.tasks.filter(t => !t.completed);
    } else if (checklistData.filter === 'completed') {
        filtered = checklistData.tasks.filter(t => t.completed);
    }
    
    container.innerHTML = filtered.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <span class="task-text">${task.text}</span>
            <button class="task-delete">&times;</button>
        </div>
    `).join('');
    
    container.querySelectorAll('.task-checkbox').forEach(cb => {
        cb.addEventListener('change', (e) => {
            const id = parseInt(e.target.closest('.task-item').dataset.id);
            const task = checklistData.tasks.find(t => t.id === id);
            if (task) {
                task.completed = e.target.checked;
                saveChecklist();
                renderTasks();
            }
        });
    });
    
    container.querySelectorAll('.task-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.closest('.task-item').dataset.id);
            checklistData.tasks = checklistData.tasks.filter(t => t.id !== id);
            saveChecklist();
            renderTasks();
        });
    });
    
    const remaining = checklistData.tasks.filter(t => !t.completed).length;
    document.getElementById('tasks-remaining').textContent = `${remaining} task${remaining !== 1 ? 's' : ''} remaining`;
}

function clearCompleted() {
    checklistData.tasks = checklistData.tasks.filter(t => !t.completed);
    saveChecklist();
    renderTasks();
}

let habitsData = {
    habits: []
};

function initHabits() {
    loadHabits();
    
    document.getElementById('add-habit').addEventListener('click', addHabit);
    
    renderHabits();
}

function loadHabits() {
    const saved = localStorage.getItem('studystream_habits');
    if (saved) {
        habitsData.habits = JSON.parse(saved);
    }
}

function saveHabits() {
    localStorage.setItem('studystream_habits', JSON.stringify(habitsData.habits));
}

function addHabit() {
    const input = document.getElementById('new-habit');
    const frequency = document.getElementById('habit-frequency').value;
    const name = input.value.trim();
    
    if (name) {
        habitsData.habits.push({
            id: Date.now(),
            name,
            frequency,
            completions: []
        });
        input.value = '';
        saveHabits();
        renderHabits();
    }
}

function renderHabits() {
    const container = document.getElementById('habits-list');
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const today = new Date();
    
    container.innerHTML = habitsData.habits.map(habit => {
        const weekDates = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            weekDates.push(date.toDateString());
        }
        
        return `
            <div class="habit-item" data-id="${habit.id}">
                <div class="habit-header">
                    <span class="habit-name">${habit.name}</span>
                    <span class="habit-streak">${habit.frequency}</span>
                </div>
                <div class="habit-days">
                    ${weekDates.map((date, i) => `
                        <div class="habit-day ${habit.completions.includes(date) ? 'completed' : ''}" 
                             data-date="${date}">
                            ${days[(today.getDay() - 6 + i + 7) % 7]}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
    
    container.querySelectorAll('.habit-day').forEach(day => {
        day.addEventListener('click', (e) => {
            const habitId = parseInt(e.target.closest('.habit-item').dataset.id);
            const date = e.target.dataset.date;
            const habit = habitsData.habits.find(h => h.id === habitId);
            
            if (habit) {
                const index = habit.completions.indexOf(date);
                if (index > -1) {
                    habit.completions.splice(index, 1);
                } else {
                    habit.completions.push(date);
                }
                saveHabits();
                renderHabits();
            }
        });
    });
}

let kanbanData = {
    tasks: []
};

function initKanban() {
    loadKanban();
    
    document.querySelectorAll('.add-kanban-task').forEach(btn => {
        btn.addEventListener('click', () => addKanbanTask(btn.dataset.status));
    });
    
    initDragAndDrop();
    renderKanban();
}

function loadKanban() {
    const saved = localStorage.getItem('studystream_kanban');
    if (saved) {
        kanbanData.tasks = JSON.parse(saved);
    }
}

function saveKanban() {
    localStorage.setItem('studystream_kanban', JSON.stringify(kanbanData.tasks));
}

function addKanbanTask(status) {
    showModal('Add Task', `
        <input type="text" id="kanban-title" placeholder="Task title">
        <textarea id="kanban-desc" placeholder="Description (optional)" rows="3" style="margin-top: 10px;"></textarea>
    `, [
        { text: 'Cancel', class: 'btn', action: closeModal },
        { text: 'Add', class: 'btn primary', action: () => {
            const title = document.getElementById('kanban-title').value;
            if (title) {
                kanbanData.tasks.push({
                    id: Date.now(),
                    title,
                    description: document.getElementById('kanban-desc').value,
                    status,
                    date: new Date().toISOString()
                });
                saveKanban();
                renderKanban();
                closeModal();
            }
        }}
    ]);
}

function renderKanban() {
    ['todo', 'progress', 'review', 'done'].forEach(status => {
        const container = document.getElementById(`${status}-tasks`);
        const tasks = kanbanData.tasks.filter(t => t.status === status);
        
        container.innerHTML = tasks.map(task => `
            <div class="kanban-task" draggable="true" data-id="${task.id}">
                <div class="kanban-task-title">${task.title}</div>
                <div class="kanban-task-meta">
                    <span>${new Date(task.date).toLocaleDateString()}</span>
                </div>
            </div>
        `).join('');
    });
    
    initDragAndDrop();
}

function initDragAndDrop() {
    document.querySelectorAll('.kanban-task').forEach(task => {
        task.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', task.dataset.id);
            task.classList.add('dragging');
        });
        
        task.addEventListener('dragend', () => {
            task.classList.remove('dragging');
        });
    });
    
    document.querySelectorAll('.kanban-tasks').forEach(column => {
        column.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
        
        column.addEventListener('drop', (e) => {
            e.preventDefault();
            const id = parseInt(e.dataTransfer.getData('text/plain'));
            const newStatus = column.id.replace('-tasks', '');
            
            const task = kanbanData.tasks.find(t => t.id === id);
            if (task) {
                task.status = newStatus;
                saveKanban();
                renderKanban();
            }
        });
    });
}

let calendarData = {
    currentDate: new Date(),
    selectedDate: new Date(),
    events: []
};

function initCalendar() {
    loadCalendar();
    
    document.getElementById('prev-month').addEventListener('click', () => changeMonth(-1));
    document.getElementById('next-month').addEventListener('click', () => changeMonth(1));
    document.getElementById('add-event').addEventListener('click', addEvent);
    
    renderCalendar();
}

function loadCalendar() {
    const saved = localStorage.getItem('studystream_calendar');
    if (saved) {
        calendarData.events = JSON.parse(saved);
    }
}

function saveCalendar() {
    localStorage.setItem('studystream_calendar', JSON.stringify(calendarData.events));
}

function changeMonth(delta) {
    calendarData.currentDate.setMonth(calendarData.currentDate.getMonth() + delta);
    renderCalendar();
}

function renderCalendar() {
    const date = calendarData.currentDate;
    const year = date.getFullYear();
    const month = date.getMonth();
    
    document.getElementById('current-month').textContent = 
        date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const container = document.getElementById('calendar-days');
    container.innerHTML = '';
    
    for (let i = firstDay - 1; i >= 0; i--) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day other-month';
        dayEl.textContent = daysInPrevMonth - i;
        container.appendChild(dayEl);
    }
    
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        dayEl.textContent = i;
        
        const thisDate = new Date(year, month, i);
        if (thisDate.toDateString() === today.toDateString()) {
            dayEl.classList.add('today');
        }
        if (thisDate.toDateString() === calendarData.selectedDate.toDateString()) {
            dayEl.classList.add('selected');
        }
        
        const dateStr = thisDate.toDateString();
        if (calendarData.events.some(e => e.date === dateStr)) {
            dayEl.classList.add('has-events');
        }
        
        dayEl.addEventListener('click', () => selectDate(thisDate));
        container.appendChild(dayEl);
    }
    
    const remaining = 42 - container.children.length;
    for (let i = 1; i <= remaining; i++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day other-month';
        dayEl.textContent = i;
        container.appendChild(dayEl);
    }
    
    renderEvents();
}

function selectDate(date) {
    calendarData.selectedDate = date;
    document.getElementById('selected-date').textContent = 
        date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    renderCalendar();
}

function addEvent() {
    const title = document.getElementById('event-title').value;
    const time = document.getElementById('event-time').value;
    
    if (title) {
        calendarData.events.push({
            id: Date.now(),
            title,
            time,
            date: calendarData.selectedDate.toDateString()
        });
        document.getElementById('event-title').value = '';
        document.getElementById('event-time').value = '';
        saveCalendar();
        renderCalendar();
    }
}

function renderEvents() {
    const container = document.getElementById('events-list');
    const dayEvents = calendarData.events
        .filter(e => e.date === calendarData.selectedDate.toDateString())
        .sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    
    container.innerHTML = dayEvents.map(event => `
        <div class="event-item" data-id="${event.id}">
            <div>
                <span class="event-item-time">${event.time || 'All day'}</span>
                <span>${event.title}</span>
            </div>
            <button class="event-delete">&times;</button>
        </div>
    `).join('');
    
    container.querySelectorAll('.event-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.closest('.event-item').dataset.id);
            calendarData.events = calendarData.events.filter(ev => ev.id !== id);
            saveCalendar();
            renderCalendar();
        });
    });
}

let writingData = {
    writings: [],
    current: null
};

function initWriting() {
    loadWriting();
    
    const area = document.getElementById('writing-area');
    area.addEventListener('input', updateWritingStats);
    
    document.getElementById('save-writing').addEventListener('click', saveWriting);
    document.getElementById('clear-writing').addEventListener('click', () => {
        document.getElementById('writing-title').value = '';
        document.getElementById('writing-area').value = '';
        writingData.current = null;
        updateWritingStats();
    });
    document.getElementById('export-writing').addEventListener('click', exportWriting);
    
    renderWritingsList();
}

function loadWriting() {
    const saved = localStorage.getItem('studystream_writing');
    if (saved) {
        writingData.writings = JSON.parse(saved);
    }
}

function saveWritingToStorage() {
    localStorage.setItem('studystream_writing', JSON.stringify(writingData.writings));
}

function updateWritingStats() {
    const text = document.getElementById('writing-area').value;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const readingTime = Math.ceil(words / 200);
    
    document.getElementById('word-count').textContent = words;
    document.getElementById('char-count').textContent = chars;
    document.getElementById('reading-time').textContent = readingTime + ' min';
}

function saveWriting() {
    const title = document.getElementById('writing-title').value || 'Untitled';
    const content = document.getElementById('writing-area').value;
    
    if (writingData.current !== null) {
        writingData.writings[writingData.current] = { title, content, date: new Date().toISOString() };
    } else {
        writingData.writings.unshift({ title, content, date: new Date().toISOString() });
    }
    
    saveWritingToStorage();
    renderWritingsList();
}

function renderWritingsList() {
    const container = document.getElementById('writings-list');
    container.innerHTML = writingData.writings.map((w, i) => `
        <div class="writing-item" data-index="${i}">
            <span>${w.title}</span>
            <span>${new Date(w.date).toLocaleDateString()}</span>
        </div>
    `).join('');
    
    container.querySelectorAll('.writing-item').forEach(item => {
        item.addEventListener('click', () => {
            const index = parseInt(item.dataset.index);
            writingData.current = index;
            document.getElementById('writing-title').value = writingData.writings[index].title;
            document.getElementById('writing-area').value = writingData.writings[index].content;
            updateWritingStats();
        });
    });
}

function exportWriting() {
    const title = document.getElementById('writing-title').value || 'untitled';
    const content = document.getElementById('writing-area').value;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

let plannerData = {
    courses: [],
    assignments: []
};

function initPlanner() {
    loadPlanner();
    
    document.getElementById('add-course').addEventListener('click', addCourse);
    document.getElementById('add-assignment').addEventListener('click', addAssignment);
    
    renderCourses();
    renderAssignments();
}

function loadPlanner() {
    const saved = localStorage.getItem('studystream_planner');
    if (saved) {
        plannerData = JSON.parse(saved);
    }
}

function savePlanner() {
    localStorage.setItem('studystream_planner', JSON.stringify(plannerData));
}

function addCourse() {
    const name = document.getElementById('course-name').value;
    const teacher = document.getElementById('course-teacher').value;
    const color = document.getElementById('course-color').value;
    
    if (name) {
        plannerData.courses.push({ id: Date.now(), name, teacher, color });
        document.getElementById('course-name').value = '';
        document.getElementById('course-teacher').value = '';
        savePlanner();
        renderCourses();
    }
}

function renderCourses() {
    const container = document.getElementById('courses-list');
    const select = document.getElementById('assignment-course');
    
    container.innerHTML = plannerData.courses.map(course => `
        <div class="course-item" style="border-left-color: ${course.color}">
            <div class="course-info">
                <span class="course-name">${course.name}</span>
                <span class="course-teacher">${course.teacher}</span>
            </div>
        </div>
    `).join('');
    
    select.innerHTML = '<option value="">Select course</option>' + 
        plannerData.courses.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}

function addAssignment() {
    const courseId = document.getElementById('assignment-course').value;
    const title = document.getElementById('assignment-title').value;
    const due = document.getElementById('assignment-due').value;
    
    if (courseId && title) {
        plannerData.assignments.push({ id: Date.now(), courseId: parseInt(courseId), title, due, completed: false });
        document.getElementById('assignment-title').value = '';
        document.getElementById('assignment-due').value = '';
        savePlanner();
        renderAssignments();
    }
}

function renderAssignments() {
    const container = document.getElementById('assignments-list');
    
    container.innerHTML = plannerData.assignments.map(a => {
        const course = plannerData.courses.find(c => c.id === a.courseId);
        return `
            <div class="assignment-item" style="border-left-color: ${course ? course.color : '#999'}">
                <div class="assignment-info">
                    <span class="assignment-title">${a.title}</span>
                    <span class="assignment-due">${course ? course.name : 'Unknown'} - Due: ${a.due || 'No date'}</span>
                </div>
            </div>
        `;
    }).join('');
}

let journalData = {
    entries: [],
    currentEntry: null,
    currentMood: null
};

function initJournal() {
    loadJournal();
    
    document.getElementById('new-entry').addEventListener('click', newJournalEntry);
    document.getElementById('save-entry').addEventListener('click', saveJournalEntry);
    
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            journalData.currentMood = btn.dataset.mood;
        });
    });
    
    document.querySelectorAll('.prompt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const content = document.getElementById('journal-content');
            content.value += (content.value ? '\n\n' : '') + btn.dataset.prompt + '\n';
        });
    });
    
    renderJournalEntries();
}

function loadJournal() {
    const saved = localStorage.getItem('studystream_journal');
    if (saved) {
        journalData.entries = JSON.parse(saved);
    }
}

function saveJournal() {
    localStorage.setItem('studystream_journal', JSON.stringify(journalData.entries));
}

function newJournalEntry() {
    journalData.currentEntry = null;
    journalData.currentMood = null;
    document.getElementById('entry-date').textContent = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
    document.getElementById('journal-content').value = '';
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
}

function saveJournalEntry() {
    const content = document.getElementById('journal-content').value;
    if (!content) return;
    
    const entry = {
        id: journalData.currentEntry || Date.now(),
        content,
        mood: journalData.currentMood,
        date: new Date().toISOString()
    };
    
    if (journalData.currentEntry) {
        const index = journalData.entries.findIndex(e => e.id === journalData.currentEntry);
        if (index > -1) journalData.entries[index] = entry;
    } else {
        journalData.entries.unshift(entry);
    }
    
    saveJournal();
    renderJournalEntries();
}

function renderJournalEntries() {
    const container = document.getElementById('entries-list');
    
    container.innerHTML = journalData.entries.map(entry => `
        <div class="entry-item" data-id="${entry.id}">
            <div class="entry-item-date">${new Date(entry.date).toLocaleDateString()}</div>
            <div class="entry-item-mood">${entry.mood || ''}</div>
        </div>
    `).join('');
    
    container.querySelectorAll('.entry-item').forEach(item => {
        item.addEventListener('click', () => {
            const id = parseInt(item.dataset.id);
            const entry = journalData.entries.find(e => e.id === id);
            if (entry) {
                journalData.currentEntry = id;
                document.getElementById('entry-date').textContent = new Date(entry.date).toLocaleDateString('en-US', { 
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                });
                document.getElementById('journal-content').value = entry.content;
                
                document.querySelectorAll('.mood-btn').forEach(b => {
                    b.classList.toggle('active', b.dataset.mood === entry.mood);
                });
                journalData.currentMood = entry.mood;
            }
        });
    });
}

let studyLogData = {
    logs: []
};

function initStudyLogger() {
    loadStudyLogs();
    
    document.getElementById('log-date').valueAsDate = new Date();
    document.getElementById('add-log').addEventListener('click', addStudyLog);
    
    renderStudyLogs();
    updateLogStats();
}

function loadStudyLogs() {
    const saved = localStorage.getItem('studystream_study_logs');
    if (saved) {
        studyLogData.logs = JSON.parse(saved);
    }
}

function saveStudyLogs() {
    localStorage.setItem('studystream_study_logs', JSON.stringify(studyLogData.logs));
}

function addStudyLog() {
    const subject = document.getElementById('log-subject').value;
    const duration = parseInt(document.getElementById('log-duration').value);
    const date = document.getElementById('log-date').value;
    const notes = document.getElementById('log-notes').value;
    
    if (subject && duration) {
        studyLogData.logs.unshift({
            id: Date.now(),
            subject,
            duration,
            date,
            notes
        });
        
        document.getElementById('log-subject').value = '';
        document.getElementById('log-duration').value = '';
        document.getElementById('log-notes').value = '';
        
        saveStudyLogs();
        renderStudyLogs();
        updateLogStats();
    }
}

function renderStudyLogs() {
    const container = document.getElementById('study-logs');
    
    container.innerHTML = studyLogData.logs.slice(0, 10).map(log => `
        <div class="log-item">
            <div class="log-item-header">
                <span class="log-subject">${log.subject}</span>
                <span class="log-duration">${log.duration} min</span>
            </div>
            <div class="log-date">${log.date}</div>
        </div>
    `).join('');
}

function updateLogStats() {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weekLogs = studyLogData.logs.filter(l => new Date(l.date) >= weekAgo);
    const totalMinutes = weekLogs.reduce((sum, l) => sum + l.duration, 0);
    const avgSession = weekLogs.length > 0 ? Math.round(totalMinutes / weekLogs.length) : 0;
    
    document.getElementById('total-study-time').textContent = totalMinutes;
    document.getElementById('avg-session').textContent = avgSession;
    document.getElementById('total-sessions').textContent = studyLogData.logs.length;
    
    renderStudyChart();
}

function renderStudyChart() {
    const container = document.getElementById('study-chart');
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    
    const weekData = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayLogs = studyLogData.logs.filter(l => l.date === dateStr);
        const minutes = dayLogs.reduce((sum, l) => sum + l.duration, 0);
        weekData.push({ day: days[date.getDay()], minutes });
    }
    
    const maxMinutes = Math.max(...weekData.map(d => d.minutes), 60);
    
    container.innerHTML = weekData.map(d => `
        <div style="display: flex; flex-direction: column; align-items: center; flex: 1;">
            <div class="chart-bar" style="height: ${(d.minutes / maxMinutes) * 100}px; min-height: 5px;"></div>
            <span style="font-size: 11px; margin-top: 5px; color: var(--text-muted);">${d.day}</span>
        </div>
    `).join('');
}

function initSettings() {
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.body.setAttribute('data-theme', btn.dataset.theme);
            localStorage.setItem('studystream_theme', btn.dataset.theme);
            document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    document.getElementById('enable-notifications').addEventListener('change', (e) => {
        if (e.target.checked && 'Notification' in window) {
            Notification.requestPermission();
        }
    });
    
    document.getElementById('export-data').addEventListener('click', exportAllData);
    document.getElementById('import-data').addEventListener('click', () => {
        document.getElementById('import-file').click();
    });
    document.getElementById('import-file').addEventListener('change', importData);
    document.getElementById('clear-data').addEventListener('click', clearAllData);
}

function exportAllData() {
    const data = {
        flashcards: localStorage.getItem('studystream_flashcards'),
        notes: localStorage.getItem('studystream_notes'),
        checklist: localStorage.getItem('studystream_checklist'),
        habits: localStorage.getItem('studystream_habits'),
        kanban: localStorage.getItem('studystream_kanban'),
        calendar: localStorage.getItem('studystream_calendar'),
        writing: localStorage.getItem('studystream_writing'),
        planner: localStorage.getItem('studystream_planner'),
        journal: localStorage.getItem('studystream_journal'),
        studyLogs: localStorage.getItem('studystream_study_logs'),
        pomodoro: localStorage.getItem('studystream_pomodoro'),
        theme: localStorage.getItem('studystream_theme')
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'studystream-backup.json';
    a.click();
    URL.revokeObjectURL(url);
}

function importData(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            Object.entries(data).forEach(([key, value]) => {
                if (value) {
                    localStorage.setItem(`studystream_${key}`, typeof value === 'string' ? value : JSON.stringify(value));
                }
            });
            location.reload();
        } catch (err) {
            alert('Invalid backup file');
        }
    };
    reader.readAsText(file);
}

function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('studystream_')) {
                localStorage.removeItem(key);
            }
        });
        location.reload();
    }
}

function initModals() {
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
        if (e.target.id === 'modal-overlay') closeModal();
    });
}

function showModal(title, content, actions) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-content').innerHTML = content;
    
    const actionsContainer = document.getElementById('modal-actions');
    actionsContainer.innerHTML = '';
    actions.forEach(action => {
        const btn = document.createElement('button');
        btn.className = action.class;
        btn.textContent = action.text;
        btn.addEventListener('click', action.action);
        actionsContainer.appendChild(btn);
    });
    
    document.getElementById('modal-overlay').classList.add('active');
}

function closeModal() {
    document.getElementById('modal-overlay').classList.remove('active');
}

function updateDashboard() {
    const today = new Date().toDateString();
    
    const pomoData = JSON.parse(localStorage.getItem('studystream_pomodoro') || '{}');
    document.getElementById('total-pomodoros').textContent = pomoData[today] || 0;
    
    const cardsData = JSON.parse(localStorage.getItem('studystream_cards_reviewed') || '{}');
    document.getElementById('cards-reviewed').textContent = cardsData[today] || 0;
    
    const checklistData = JSON.parse(localStorage.getItem('studystream_checklist') || '[]');
    const todayTasks = checklistData.filter(t => t.completed && new Date(t.date).toDateString() === today);
    document.getElementById('tasks-completed').textContent = todayTasks.length;
    
    calculateStreak();
    renderDashboardWidgets();
}

function calculateStreak() {
    const pomoData = JSON.parse(localStorage.getItem('studystream_pomodoro') || '{}');
    let streak = 0;
    let date = new Date();
    
    while (pomoData[date.toDateString()]) {
        streak++;
        date.setDate(date.getDate() - 1);
    }
    
    document.getElementById('study-streak').textContent = streak;
}

function renderDashboardWidgets() {
    const checklistData = JSON.parse(localStorage.getItem('studystream_checklist') || '[]');
    const activeTasks = checklistData.filter(t => !t.completed).slice(0, 5);
    
    document.getElementById('today-focus-list').innerHTML = activeTasks.length > 0 
        ? activeTasks.map(t => `<div class="focus-item">${t.text}</div>`).join('')
        : '<p class="empty-state">No tasks for today</p>';
    
    const activities = [];
    const pomoData = JSON.parse(localStorage.getItem('studystream_pomodoro') || '{}');
    const today = new Date().toDateString();
    if (pomoData[today]) {
        activities.push(`Completed ${pomoData[today]} pomodoro${pomoData[today] > 1 ? 's' : ''}`);
    }
    
    document.getElementById('recent-activity').innerHTML = activities.length > 0
        ? activities.map(a => `<div class="activity-item">${a}</div>`).join('')
        : '<p class="empty-state">No recent activity</p>';
    
    renderWeeklyChart();
}

function renderWeeklyChart() {
    const container = document.getElementById('weekly-chart');
    const pomoData = JSON.parse(localStorage.getItem('studystream_pomodoro') || '{}');
    
    const weekData = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        weekData.push(pomoData[date.toDateString()] || 0);
    }
    
    const maxPomo = Math.max(...weekData, 4);
    
    container.innerHTML = weekData.map(count => 
        `<div class="chart-bar" style="height: ${(count / maxPomo) * 100}%"></div>`
    ).join('');
}

function showNotification(title, body) {
    if (document.getElementById('enable-notifications').checked && 'Notification' in window) {
        if (Notification.permission === 'granted') {
            new Notification(title, { body, icon: '📚' });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification(title, { body, icon: '📚' });
                }
            });
        }
    }
}

function playNotificationSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.3;
    
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    oscillator.stop(audioContext.currentTime + 0.5);
}

window.navigateTo = navigateTo;
