// Chinese Writing App - Main Application Controller
// Project: tp-003
// Started: September 7, 2025

class ChineseWritingApp {
    constructor() {
        this.characters = [];
        this.currentIndex = 0;
        this.session = {
            startTime: Date.now(),
            results: new Map(),
            duration: 0
        };
        this.canvas = null;
        this.storage = null;
        
        this.init();
    }
    
    async init() {
        try {
            console.log('🚀 Initializing Chinese Writing App...');
            
            // Initialize storage
            this.storage = new PracticeStorage();
            
            // Parse URL parameters for character input
            this.parseURLParameters();
            
            // Initialize character data
            await this.initializeCharacters();
            
            // Initialize canvas
            this.canvas = new DrawingCanvas('practice-canvas');
            
            // Initialize UI components
            this.initializeUI();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Load first character
            this.loadCharacter(0);
            
            // Hide loading screen
            this.hideLoadingScreen();
            
            console.log('✅ App initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize app:', error);
            this.showError('Failed to initialize the application. Please refresh and try again.');
        }
    }
    
    parseURLParameters() {
        const params = new URLSearchParams(window.location.search);
        
        // Get character list from URL
        const chars = params.get('chars') || params.get('characters');
        if (chars) {
            this.characters = chars.split(/[,|]/).map(char => char.trim()).filter(char => char);
            console.log(`📝 Loaded ${this.characters.length} characters from URL:`, this.characters);
        }
        
        // Get session info
        this.session.date = params.get('session') || new Date().toISOString().split('T')[0];
        this.session.type = params.get('type') || 'character-practice';
        this.session.level = params.get('level') || 'hsk-3';
        
        console.log('📅 Session info:', this.session);
    }
    
    async initializeCharacters() {
        // If no characters from URL, use default test characters
        if (this.characters.length === 0) {
            this.characters = ['停', '锁', '偷', '担', '台', '演', '唱', '歌'];
            console.log('🎯 Using default test characters');
        }
        
        // Initialize character data with metadata
        this.characterData = await CharacterManager.loadCharacterData(this.characters);
        
        // Initialize practice results for each character
        this.characters.forEach(char => {
            this.session.results.set(char, {
                character: char,
                status: 'not-practiced', // 'mastered', 'needs-work', 'not-practiced'
                attempts: 0,
                timeSpent: 0,
                lastPracticed: null
            });
        });
        
        console.log(`📚 Initialized ${this.characters.length} characters with metadata`);
    }
    
    initializeUI() {
        // Update character counter
        this.updateCharacterCounter();
        
        // Populate character selector
        this.populateCharacterSelector();
        
        // Update progress bar
        this.updateProgressBar();
        
        // Start session timer
        this.startSessionTimer();
    }
    
    setupEventListeners() {
        // Character navigation
        document.getElementById('prev-char')?.addEventListener('click', () => this.previousCharacter());
        document.getElementById('next-char')?.addEventListener('click', () => this.nextCharacter());
        document.getElementById('next-character-btn')?.addEventListener('click', () => this.nextCharacter());
        
        // Status buttons
        document.getElementById('status-mastered')?.addEventListener('click', () => this.setCharacterStatus('mastered'));
        document.getElementById('status-needs-work')?.addEventListener('click', () => this.setCharacterStatus('needs-work'));
        document.getElementById('status-not-practiced')?.addEventListener('click', () => this.setCharacterStatus('not-practiced'));
        
        // Canvas controls
        document.getElementById('clear-btn')?.addEventListener('click', () => this.canvas.clear());
        document.getElementById('undo-btn')?.addEventListener('click', () => this.canvas.undo());
        document.getElementById('redo-btn')?.addEventListener('click', () => this.canvas.redo());
        
        // Brush size
        document.getElementById('brush-slider')?.addEventListener('input', (e) => {
            this.canvas.setBrushSize(parseInt(e.target.value));
        });
        
        // Export functionality
        document.getElementById('export-btn')?.addEventListener('click', () => this.showExportModal());
        document.getElementById('copy-results')?.addEventListener('click', () => this.copyResults());
        document.getElementById('close-modal')?.addEventListener('click', () => this.hideExportModal());
        
        // Character selector clicks
        document.getElementById('character-list')?.addEventListener('click', (e) => {
            if (e.target.classList.contains('character-item')) {
                const index = parseInt(e.target.dataset.index);
                this.loadCharacter(index);
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Prevent context menu on canvas (iPad optimization)
        document.getElementById('practice-canvas')?.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    loadCharacter(index) {
        if (index < 0 || index >= this.characters.length) return;
        
        this.currentIndex = index;
        const char = this.characters[index];
        const data = this.characterData[char];
        const result = this.session.results.get(char);
        
        // Update character display
        document.getElementById('display-character').textContent = char;
        document.getElementById('character-pinyin').textContent = data?.pinyin || '';
        document.getElementById('character-meaning').textContent = data?.meaning || '';
        document.getElementById('character-strokes').textContent = data?.strokes ? `${data.strokes} strokes` : '';
        
        // Update status buttons
        this.updateStatusButtons(result.status);
        
        // Update character selector
        this.updateCharacterSelector();
        
        // Clear canvas for new character
        this.canvas.clear();
        
        // Update navigation buttons
        this.updateNavigationButtons();
        
        console.log(`📝 Loaded character: ${char} (${index + 1}/${this.characters.length})`);
    }
    
    setCharacterStatus(status) {
        const char = this.characters[this.currentIndex];
        const result = this.session.results.get(char);
        
        result.status = status;
        result.attempts++;
        result.lastPracticed = Date.now();
        
        this.updateStatusButtons(status);
        this.updateCharacterSelector();
        this.updateProgressBar();
        
        // Auto-save progress
        this.storage.saveSession(this.session);
        
        console.log(`✅ Set ${char} status to: ${status}`);
    }
    
    updateStatusButtons(activeStatus) {
        const buttons = ['status-mastered', 'status-needs-work', 'status-not-practiced'];
        buttons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.classList.remove('active');
                if (id.includes(activeStatus.replace('-', '-'))) {
                    btn.classList.add('active');
                }
            }
        });
    }
    
    populateCharacterSelector() {
        const container = document.getElementById('character-list');
        if (!container) return;
        
        container.innerHTML = '';
        this.characters.forEach((char, index) => {
            const item = document.createElement('div');
            item.className = 'character-item';
            item.textContent = char;
            item.dataset.index = index;
            
            const result = this.session.results.get(char);
            if (result.status !== 'not-practiced') {
                item.classList.add(result.status);
            }
            
            container.appendChild(item);
        });
    }
    
    updateCharacterSelector() {
        const items = document.querySelectorAll('.character-item');
        items.forEach((item, index) => {
            item.classList.remove('active');
            if (index === this.currentIndex) {
                item.classList.add('active');
            }
            
            // Update status styling
            const char = this.characters[index];
            const result = this.session.results.get(char);
            
            item.classList.remove('mastered', 'needs-work');
            if (result.status !== 'not-practiced') {
                item.classList.add(result.status);
            }
        });
    }
    
    updateCharacterCounter() {
        const counter = document.getElementById('character-counter');
        if (counter) {
            counter.textContent = `${this.currentIndex + 1}/${this.characters.length} Characters`;
        }
    }
    
    updateProgressBar() {
        const practiced = Array.from(this.session.results.values())
            .filter(r => r.status !== 'not-practiced').length;
        const percentage = (practiced / this.characters.length) * 100;
        
        const fill = document.getElementById('progress-fill');
        const text = document.getElementById('progress-text');
        
        if (fill) fill.style.width = `${percentage}%`;
        if (text) text.textContent = `${Math.round(percentage)}% Complete`;
    }
    
    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-char');
        const nextBtn = document.getElementById('next-char');
        
        if (prevBtn) prevBtn.disabled = this.currentIndex === 0;
        if (nextBtn) nextBtn.disabled = this.currentIndex === this.characters.length - 1;
    }
    
    previousCharacter() {
        if (this.currentIndex > 0) {
            this.loadCharacter(this.currentIndex - 1);
            this.updateCharacterCounter();
        }
    }
    
    nextCharacter() {
        if (this.currentIndex < this.characters.length - 1) {
            this.loadCharacter(this.currentIndex + 1);
            this.updateCharacterCounter();
        }
    }
    
    startSessionTimer() {
        setInterval(() => {
            this.session.duration = Date.now() - this.session.startTime;
            const minutes = Math.floor(this.session.duration / 60000);
            const seconds = Math.floor((this.session.duration % 60000) / 1000);
            
            const timer = document.getElementById('session-timer');
            if (timer) {
                timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }
    
    showExportModal() {
        const modal = document.getElementById('export-modal');
        const textarea = document.getElementById('export-text');
        
        if (modal && textarea) {
            textarea.value = ResultsExporter.generateResults(this.session, this.characters);
            modal.classList.add('active');
        }
    }
    
    hideExportModal() {
        const modal = document.getElementById('export-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }
    
    async copyResults() {
        const textarea = document.getElementById('export-text');
        if (textarea) {
            try {
                await navigator.clipboard.writeText(textarea.value);
                
                // Visual feedback
                const btn = document.getElementById('copy-results');
                const originalText = btn.textContent;
                btn.textContent = '✅ Copied!';
                setTimeout(() => {
                    btn.textContent = originalText;
                }, 2000);
                
                console.log('📋 Results copied to clipboard');
            } catch (error) {
                console.error('Failed to copy to clipboard:', error);
                // Fallback: select text for manual copy
                textarea.select();
            }
        }
    }
    
    handleKeyboard(e) {
        // Prevent default for our shortcuts
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Escape') {
            e.preventDefault();
        }
        
        switch (e.key) {
            case 'ArrowLeft':
                this.previousCharacter();
                break;
            case 'ArrowRight':
                this.nextCharacter();
                break;
            case ' ':
                this.canvas.clear();
                break;
            case 'Escape':
                this.hideExportModal();
                break;
            case '1':
                this.setCharacterStatus('mastered');
                break;
            case '2':
                this.setCharacterStatus('needs-work');
                break;
            case '3':
                this.setCharacterStatus('not-practiced');
                break;
        }
    }
    
    hideLoadingScreen() {
        const loading = document.getElementById('loading');
        if (loading) {
            setTimeout(() => {
                loading.style.opacity = '0';
                setTimeout(() => {
                    loading.style.display = 'none';
                }, 300);
            }, 500);
        }
    }
    
    showError(message) {
        console.error('💥 Error:', message);
        // Could implement a proper error modal here
        alert(message);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ChineseWritingApp();
});

// Make app available globally for debugging
window.ChineseWritingApp = ChineseWritingApp;