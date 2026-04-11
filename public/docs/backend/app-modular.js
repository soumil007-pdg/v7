// Modular backend documentation loader
let currentChapter = 1;
const totalChapters = 18;

// Chapter file mappings
const chapterFiles = {
  1: 'chapters/chapter-1.html',
  2: 'chapters/chapter-2.html',
  3: 'chapters/chapter-3.html',
  4: 'chapters/chapter-4.html',
  5: 'chapters/chapter-5.html',
  6: 'chapters/chapter-6.html',
  7: 'chapters/chapter-7.html',
  8: 'chapters/chapter-8.html',
  9: 'chapters/chapter-9.html',
  10: 'chapters/chapter-10.html',
  11: 'chapters/chapter-11.html',
  12: 'chapters/chapter-12.html',
  13: 'chapters/chapter-13.html',
  14: 'chapters/chapter-14.html',
  15: 'chapters/chapter-15.html',
  16: 'chapters/chapter-16.html',
  17: 'chapters/chapter-17.html',
  18: 'chapters/chapter-18.html'
};

// Load chapter on page load
document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.hash.substring(1));
  const chapterParam = parseInt(urlParams.get('chapter')) || 1;

  if (chapterParam >= 1 && chapterParam <= totalChapters) {
    currentChapter = chapterParam;
  }

  await loadChapter(currentChapter);
  setupNavigation();
  setupCodeBlocks();
});

// Load a specific chapter
async function loadChapter(chapterNum) {
  currentChapter = chapterNum;
  document.getElementById('current-chapter').textContent = chapterNum;

  try {
    const filePath = chapterFiles[chapterNum];
    const response = await fetch(filePath);
    const html = await response.text();

    // Parse and extract the chapter section
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const chapterSection = doc.querySelector(`#chapter-${chapterNum}`);

    if (chapterSection) {
      document.getElementById('chapters-container').innerHTML = chapterSection.outerHTML;

      // Re-highlight code blocks
      setTimeout(() => {
        document.querySelectorAll('pre code').forEach(block => {
          hljs.highlightElement(block);
        });
      }, 0);

      // Add copy buttons
      addCopyButtons();
    }
  } catch (error) {
    console.error(`Failed to load chapter ${chapterNum}:`, error);
    document.getElementById('chapters-container').innerHTML =
      `<p style="color: red;">Error loading chapter. Please refresh the page.</p>`;
  }
}

// Navigation functions
function nextChapter() {
  if (currentChapter < totalChapters) {
    loadChapter(currentChapter + 1);
    window.scrollTo(0, 0);
  }
}

function previousChapter() {
  if (currentChapter > 1) {
    loadChapter(currentChapter - 1);
    window.scrollTo(0, 0);
  }
}

// Setup navigation sidebar
function setupNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const chapter = parseInt(item.dataset.chapter);
      loadChapter(chapter);
      window.scrollTo(0, 0);
    });
  });
}

// Setup code block highlighting
function setupCodeBlocks() {
  document.querySelectorAll('pre code').forEach(block => {
    hljs.highlightElement(block);
  });
  addCopyButtons();
}

// Add copy to clipboard buttons
function addCopyButtons() {
  document.querySelectorAll('pre').forEach(pre => {
    // Remove existing button if present
    const existingBtn = pre.querySelector('.copy-btn');
    if (existingBtn) existingBtn.remove();

    const button = document.createElement('button');
    button.className = 'copy-btn';
    button.textContent = 'Copy';

    button.addEventListener('click', () => {
      const code = pre.querySelector('code').textContent;
      navigator.clipboard.writeText(code).then(() => {
        button.textContent = '✓ Copied!';
        setTimeout(() => {
          button.textContent = 'Copy';
        }, 2000);
      });
    });

    pre.appendChild(button);
  });
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey) {
    if (e.key === 'ArrowRight') {
      nextChapter();
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      previousChapter();
      e.preventDefault();
    }
  }
});
