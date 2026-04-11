// ========================================
// DOCUMENTATION INTERACTIVITY
// ========================================

// Track current chapter
let currentChapter = 1;
const totalChapters = 3; // We have 3 chapters for now (1-3)

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Show first chapter
  showChapter(1);

  // Syntax highlighting
  document.querySelectorAll('pre code').forEach((block) => {
    hljs.highlightElement(block);
  });

  // Add copy-to-clipboard buttons to code blocks
  addCopyButtons();

  // Navigation click handlers
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      const chapterNum = this.getAttribute('data-chapter');
      showChapter(parseInt(chapterNum));
    });
  });
});

/**
 * Show a specific chapter and hide others
 */
function showChapter(chapterNum) {
  // Hide all chapters
  document.querySelectorAll('.chapter').forEach((chapter) => {
    chapter.classList.remove('active');
  });

  // Show selected chapter
  const chapter = document.querySelector(`#chapter-${chapterNum}`);
  if (chapter) {
    chapter.classList.add('active');
    currentChapter = chapterNum;

    // Update nav indicator
    document.querySelectorAll('.nav-item').forEach((item) => {
      item.classList.remove('active');
    });
    const activeNav = document.querySelector(`[data-chapter="${chapterNum}"]`);
    if (activeNav) {
      activeNav.classList.add('active');
    }

    // Update progress
    document.getElementById('current-chapter').textContent = chapterNum;

    // Scroll to top
    document.querySelector('.content').scrollTop = 0;
  }
}

/**
 * Navigate to next chapter
 */
function nextChapter() {
  if (currentChapter < totalChapters) {
    showChapter(currentChapter + 1);
  }
}

/**
 * Navigate to previous chapter
 */
function previousChapter() {
  if (currentChapter > 1) {
    showChapter(currentChapter - 1);
  }
}

/**
 * Add copy-to-clipboard buttons to code blocks
 */
function addCopyButtons() {
  document.querySelectorAll('pre').forEach((pre) => {
    const button = document.createElement('button');
    button.className = 'copy-btn';
    button.textContent = '📋 Copy';
    button.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      padding: 6px 12px;
      background: rgba(255, 91, 51, 0.8);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
      transition: all 0.2s;
    `;

    button.onmouseover = () => {
      button.style.background = 'rgba(255, 91, 51, 1)';
    };

    button.onmouseout = () => {
      button.style.background = 'rgba(255, 91, 51, 0.8)';
    };

    button.onclick = (e) => {
      e.preventDefault();
      const code = pre.textContent;
      navigator.clipboard.writeText(code).then(() => {
        const originalText = button.textContent;
        button.textContent = '✅ Copied!';
        setTimeout(() => {
          button.textContent = originalText;
        }, 2000);
      });
    };

    pre.style.position = 'relative';
    pre.appendChild(button);
  });
}

/**
 * Keyboard shortcuts
 */
document.addEventListener('keydown', function(e) {
  // Ctrl+Shift+Right = Next chapter
  if (e.ctrlKey && e.shiftKey && e.key === 'ArrowRight') {
    nextChapter();
  }
  // Ctrl+Shift+Left = Previous chapter
  if (e.ctrlKey && e.shiftKey && e.key === 'ArrowLeft') {
    previousChapter();
  }
});

/**
 * Search functionality (Ctrl+F style)
 */
function searchDocs(query) {
  const regex = new RegExp(query, 'gi');
  const content = document.querySelector('.content');
  const text = content.textContent;

  if (regex.test(text)) {
    // Found match in current chapter
    const matches = text.match(regex);
    console.log(`Found ${matches.length} matches for "${query}"`);
  } else {
    console.log(`No matches found for "${query}"`);
  }
}

// Export functions for global use
window.showChapter = showChapter;
window.nextChapter = nextChapter;
window.previousChapter = previousChapter;
window.searchDocs = searchDocs;
