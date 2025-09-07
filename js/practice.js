// Practice Session Management
// Handles practice logic, session flow, and character progression

class PracticeSession {
    constructor(characters, options = {}) {
        this.characters = characters || [];
        this.options = {
            sessionType: options.sessionType || 'character-practice',
            level: options.level || 'hsk-3',
            timeLimit: options.timeLimit || null, // in minutes
            shuffleCharacters: options.shuffleCharacters || false,
            autoProgress: options.autoProgress || false,
            ...options
        };
        
        this.startTime = Date.now();
        this.results = new Map();
        this.currentIndex = 0;
        this.isActive = true;
        this.timeSpent = new Map(); // Track time per character
        this.characterStartTime = null;
        
        this.init();
    }
    
    init() {
        // Shuffle characters if requested
        if (this.options.shuffleCharacters) {
            this.characters = this.shuffleArray([...this.characters]);
        }
        
        // Initialize results for each character
        this.characters.forEach(char => {
            this.results.set(char, {
                character: char,
                status: 'not-practiced',
                attempts: 0,
                timeSpent: 0,
                startTime: null,
                endTime: null,
                strokes: [],
                feedback: []
            });
        });
        
        // Set up time tracking
        this.setupTimeTracking();
        
        console.log(`🎯 Practice session initialized with ${this.characters.length} characters`);
    }
    
    setupTimeTracking() {
        // Track time spent on each character
        this.timeTracker = setInterval(() => {
            if (this.characterStartTime) {
                const currentChar = this.characters[this.currentIndex];
                const result = this.results.get(currentChar);
                if (result) {
                    const timeSpent = Date.now() - this.characterStartTime;
                    result.timeSpent = timeSpent;
                }
            }
        }, 1000);
    }
    
    startCharacterPractice(index) {
        if (index < 0 || index >= this.characters.length) return false;
        
        // End previous character tracking
        this.endCharacterPractice();
        
        this.currentIndex = index;
        this.characterStartTime = Date.now();
        
        const char = this.characters[index];
        const result = this.results.get(char);
        if (result && !result.startTime) {
            result.startTime = Date.now();
        }
        
        console.log(`📝 Started practicing character: ${char}`);
        return true;
    }
    
    endCharacterPractice() {
        if (this.characterStartTime) {
            const char = this.characters[this.currentIndex];
            const result = this.results.get(char);
            if (result) {
                result.endTime = Date.now();
                result.timeSpent = result.endTime - (result.startTime || this.characterStartTime);
            }
            
            this.characterStartTime = null;
        }
    }
    
    setCharacterStatus(character, status, feedback = null) {
        const result = this.results.get(character);
        if (!result) return false;
        
        const previousStatus = result.status;
        result.status = status;
        result.attempts++;
        
        if (feedback) {
            result.feedback.push({
                timestamp: Date.now(),
                status: status,
                feedback: feedback
            });
        }
        
        // Automatic progression logic
        if (this.options.autoProgress && status === 'mastered') {
            this.nextCharacter();
        }
        
        console.log(`✅ ${character} status updated: ${previousStatus} → ${status}`);
        return true;
    }
    
    nextCharacter() {
        if (this.currentIndex < this.characters.length - 1) {
            return this.startCharacterPractice(this.currentIndex + 1);
        } else {
            // Session complete
            this.completeSession();
            return false;
        }
    }
    
    previousCharacter() {
        if (this.currentIndex > 0) {
            return this.startCharacterPractice(this.currentIndex - 1);
        }
        return false;
    }
    
    goToCharacter(index) {
        return this.startCharacterPractice(index);
    }
    
    addStroke(strokeData) {
        const char = this.characters[this.currentIndex];
        const result = this.results.get(char);
        
        if (result) {
            result.strokes.push({
                timestamp: Date.now(),
                data: strokeData,
                pressure: strokeData.pressure || 0.5,
                duration: strokeData.duration || 0
            });
        }
    }
    
    getProgress() {
        const total = this.characters.length;
        const practiced = Array.from(this.results.values())
            .filter(r => r.status !== 'not-practiced').length;
        const mastered = Array.from(this.results.values())
            .filter(r => r.status === 'mastered').length;
        
        return {
            total,
            practiced,
            mastered,
            remaining: total - practiced,
            percentagePracticed: total > 0 ? Math.round((practiced / total) * 100) : 0,
            percentagemastered: practiced > 0 ? Math.round((mastered / practiced) * 100) : 0
        };
    }
    
    getSessionStats() {
        const duration = Date.now() - this.startTime;
        const progress = this.getProgress();
        
        const results = Array.from(this.results.values());
        const totalAttempts = results.reduce((sum, r) => sum + r.attempts, 0);
        const averageTimePerCharacter = progress.practiced > 0 
            ? Math.round(duration / progress.practiced / 1000) : 0;
        
        return {
            duration: Math.round(duration / 1000), // in seconds
            durationMinutes: Math.round(duration / 60000), // in minutes
            ...progress,
            totalAttempts,
            averageAttempts: progress.practiced > 0 ? Math.round(totalAttempts / progress.practiced) : 0,
            averageTimePerCharacter, // in seconds
            charactersPerMinute: duration > 0 ? Math.round((progress.practiced * 60000) / duration) : 0
        };
    }
    
    getCharacterAnalysis() {
        const analysis = {
            mastered: [],
            needsWork: [],
            notPracticed: [],
            mostDifficult: null,
            quickestmastered: null,
            slowestmastered: null
        };
        
        let maxAttempts = 0;
        let minMasteryTime = Infinity;
        let maxMasteryTime = 0;
        
        for (const [char, result] of this.results.entries()) {
            switch (result.status) {
                case 'mastered':
                    analysis.mastered.push({
                        character: char,
                        attempts: result.attempts,
                        timeSpent: result.timeSpent
                    });
                    
                    if (result.timeSpent < minMasteryTime) {
                        minMasteryTime = result.timeSpent;
                        analysis.quickestmastered = char;
                    }
                    if (result.timeSpent > maxMasteryTime) {
                        maxMasteryTime = result.timeSpent;
                        analysis.slowestmastered = char;
                    }
                    break;
                    
                case 'needs-work':
                    analysis.needsWork.push({
                        character: char,
                        attempts: result.attempts,
                        timeSpent: result.timeSpent
                    });
                    
                    if (result.attempts > maxAttempts) {
                        maxAttempts = result.attempts;
                        analysis.mostDifficult = char;
                    }
                    break;
                    
                case 'not-practiced':
                default:
                    analysis.notPracticed.push({ character: char });
                    break;
            }
        }
        
        return analysis;
    }
    
    getRecommendations() {
        const analysis = this.getCharacterAnalysis();
        const stats = this.getSessionStats();
        const recommendations = [];
        
        // Practice completion recommendations
        if (analysis.notPracticed.length > 0) {
            recommendations.push({
                type: 'completion',
                priority: 'high',
                message: `Complete practice for ${analysis.notPracticed.length} remaining characters: ${analysis.notPracticed.map(c => c.character).join(', ')}`
            });
        }
        
        // Difficulty recommendations
        if (analysis.needsWork.length > 0) {
            recommendations.push({
                type: 'review',
                priority: 'medium',
                message: `Review these challenging characters: ${analysis.needsWork.map(c => c.character).join(', ')}`
            });
        }
        
        // Pace recommendations
        if (stats.averageTimePerCharacter > 120) { // More than 2 minutes per character
            recommendations.push({
                type: 'pace',
                priority: 'low',
                message: 'Consider practicing at a faster pace to improve fluency'
            });
        } else if (stats.averageTimePerCharacter < 30) { // Less than 30 seconds per character
            recommendations.push({
                type: 'pace',
                priority: 'low',
                message: 'Consider spending more time on each character to improve accuracy'
            });
        }
        
        // Success recommendations
        if (stats.percentagemastered >= 80) {
            recommendations.push({
                type: 'success',
                priority: 'positive',
                message: 'Excellent progress! Consider moving to more advanced characters'
            });
        } else if (stats.percentagemastered < 50) {
            recommendations.push({
                type: 'improvement',
                priority: 'medium',
                message: 'Focus on stroke order and character structure to improve mastery rate'
            });
        }
        
        return recommendations;
    }
    
    pauseSession() {
        this.isActive = false;
        this.endCharacterPractice();
        
        if (this.timeTracker) {
            clearInterval(this.timeTracker);
        }
        
        console.log('⏸️ Session paused');
    }
    
    resumeSession() {
        this.isActive = true;
        this.setupTimeTracking();
        
        if (this.currentIndex < this.characters.length) {
            this.characterStartTime = Date.now();
        }
        
        console.log('▶️ Session resumed');
    }
    
    completeSession() {
        this.isActive = false;
        this.endCharacterPractice();
        
        if (this.timeTracker) {
            clearInterval(this.timeTracker);
        }
        
        const stats = this.getSessionStats();
        const analysis = this.getCharacterAnalysis();
        
        console.log('🏁 Session completed:', stats);
        
        return {
            completed: true,
            stats,
            analysis,
            recommendations: this.getRecommendations()
        };
    }
    
    exportSession() {
        return {
            characters: this.characters,
            options: this.options,
            startTime: this.startTime,
            duration: Date.now() - this.startTime,
            results: Object.fromEntries(this.results),
            stats: this.getSessionStats(),
            analysis: this.getCharacterAnalysis(),
            completed: !this.isActive
        };
    }
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    destroy() {
        this.pauseSession();
        this.results.clear();
        console.log('🗑️ Practice session destroyed');
    }
}

// Export for global use
window.PracticeSession = PracticeSession;