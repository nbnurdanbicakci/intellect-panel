// Quiz sistemi
let quizState = {
  questions: [],
  currentIndex: 0,
  score: 0,
  answered: false
};

function openQuizModal() {
  document.getElementById('quizModal').classList.add('active');
  document.getElementById('quizCategorySelect').style.display = 'block';
  document.getElementById('quizBody').style.display = 'none';
  document.getElementById('quizResult').style.display = 'none';
}

function closeQuizModal() {
  document.getElementById('quizModal').classList.remove('active');
}

async function startQuiz(category) {
  try {
    const res = await fetch(`/api/quiz?category=${category}&count=5`);
    const data = await res.json();

    if (!data.questions || data.questions.length === 0) {
      showToast('Bu kategoride soru bulunamadi.', 'error');
      return;
    }

    quizState = {
      questions: data.questions,
      currentIndex: 0,
      score: 0,
      answered: false
    };

    document.getElementById('quizCategorySelect').style.display = 'none';
    document.getElementById('quizBody').style.display = 'block';
    document.getElementById('quizResult').style.display = 'none';

    renderQuestion();
  } catch (err) {
    showToast('Quiz yuklenemedi: ' + err.message, 'error');
  }
}

function renderQuestion() {
  const q = quizState.questions[quizState.currentIndex];
  if (!q) return;

  quizState.answered = false;

  const total = quizState.questions.length;
  const current = quizState.currentIndex + 1;

  document.getElementById('quizProgress').textContent = `Soru ${current}/${total}`;
  document.getElementById('quizScore').textContent = `${quizState.score} puan`;

  // Progress bar
  const progressBar = document.getElementById('quizProgressBar');
  if (progressBar) {
    progressBar.style.width = `${(current / total) * 100}%`;
  }

  document.getElementById('quizQuestion').textContent = q.question;

  const optionsHtml = q.options.map((opt, i) => `
    <button class="quiz-option" onclick="selectAnswer(${i})" data-index="${i}">
      ${String.fromCharCode(65 + i)}) ${escapeHtml(opt)}
    </button>
  `).join('');

  document.getElementById('quizOptions').innerHTML = optionsHtml;
  document.getElementById('quizExplanation').style.display = 'none';
  document.getElementById('quizNextBtn').style.display = 'none';
}

function selectAnswer(selectedIndex) {
  if (quizState.answered) return;
  quizState.answered = true;

  const q = quizState.questions[quizState.currentIndex];
  const options = document.querySelectorAll('.quiz-option');

  options.forEach((opt, i) => {
    opt.classList.add('disabled');
    if (i === q.correct) {
      opt.classList.add('correct');
    }
    if (i === selectedIndex && i !== q.correct) {
      opt.classList.add('wrong');
    }
  });

  if (selectedIndex === q.correct) {
    quizState.score++;
    document.getElementById('quizScore').textContent = `${quizState.score} puan`;
  }

  if (q.explanation) {
    const expEl = document.getElementById('quizExplanation');
    expEl.textContent = q.explanation;
    expEl.style.display = 'block';
  }

  const nextBtn = document.getElementById('quizNextBtn');
  if (quizState.currentIndex < quizState.questions.length - 1) {
    nextBtn.textContent = 'Sonraki Soru \u2192';
    nextBtn.style.display = 'block';
  } else {
    nextBtn.textContent = 'Sonuclari Gor \u2192';
    nextBtn.style.display = 'block';
  }
}

function nextQuestion() {
  quizState.currentIndex++;

  if (quizState.currentIndex >= quizState.questions.length) {
    showQuizResult();
    return;
  }

  renderQuestion();
}

function showQuizResult() {
  document.getElementById('quizBody').style.display = 'none';
  document.getElementById('quizResult').style.display = 'block';

  const total = quizState.questions.length;
  const score = quizState.score;
  const percentage = Math.round((score / total) * 100);

  // Emoji
  let emoji;
  if (percentage === 100) emoji = '\uD83C\uDFC6';
  else if (percentage >= 80) emoji = '\uD83C\uDF1F';
  else if (percentage >= 60) emoji = '\uD83D\uDCAA';
  else if (percentage >= 40) emoji = '\uD83D\uDCD6';
  else emoji = '\uD83D\uDE80';

  const emojiEl = document.getElementById('resultEmoji');
  if (emojiEl) emojiEl.textContent = emoji;

  document.getElementById('resultScore').textContent = `${score}/${total}`;

  let message;
  if (percentage === 100) message = 'Muhtesem! Tum sorulari dogru yanitladin!';
  else if (percentage >= 80) message = 'Harika! Cok iyi bir performans gosterdin!';
  else if (percentage >= 60) message = 'Iyi gidiyorsun! Biraz daha pratik ile mukemmel olacaksin.';
  else if (percentage >= 40) message = 'Fena degil! Paneldeki icerikleri okuyarak bilgini artirabilirsin.';
  else message = 'Her yanlis, dogruya bir adim! Paneli kesfetmeye devam et.';

  document.getElementById('resultMessage').textContent = message;

  // Stats
  const statsEl = document.getElementById('resultStats');
  if (statsEl) {
    const scores = JSON.parse(localStorage.getItem('quizScores') || '[]');
    const totalQuizzes = scores.length + 1;
    statsEl.textContent = `Toplam ${totalQuizzes} quiz tamamlandi`;
  }

  saveQuizScore(score, total);
  updateStreakChip();
}

function saveQuizScore(score, total) {
  const scores = JSON.parse(localStorage.getItem('quizScores') || '[]');
  scores.push({
    score,
    total,
    date: new Date().toISOString(),
    percentage: Math.round((score / total) * 100)
  });
  if (scores.length > 30) scores.shift();
  localStorage.setItem('quizScores', JSON.stringify(scores));
}

function updateStreakChip() {
  const scores = JSON.parse(localStorage.getItem('quizScores') || '[]');
  const chip = document.getElementById('streakChip');
  const text = document.getElementById('streakText');
  if (chip && text && scores.length > 0) {
    chip.style.display = 'inline-flex';
    text.textContent = `${scores.length} quiz tamamlandi`;
  }
}
