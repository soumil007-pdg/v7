// Modular documentation loader
let currentChapter = 1;
const totalChapters = 14;

// Chapter file mappings
const chapterFiles = {
  1: 'chapters/chapter-1.html',
  2: 'chapters/chapter-2.html',
  3: 'chapters/chapter-3.html',
  4: 'chapters/chapter-4.html',
  5: 'chapters/chapter-5.html',
  // Chapters 6-14 will be created as separate files
  // For now, they load from the combined file
  6: 'chapters/chapter-5-to-14.html#chapter-6',
  7: 'chapters/chapter-5-to-14.html#chapter-7',
  8: 'chapters/chapter-5-to-14.html#chapter-8',
  9: 'chapters/chapter-5-to-14.html#chapter-9',
  10: 'chapters/chapter-5-to-14.html#chapter-10',
  11: 'chapters/chapter-5-to-14.html#chapter-11',
  12: 'chapters/chapter-5-to-14.html#chapter-12',
  13: 'chapters/chapter-5-to-14.html#chapter-13',
  14: 'chapters/chapter-5-to-14.html#chapter-14'
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
