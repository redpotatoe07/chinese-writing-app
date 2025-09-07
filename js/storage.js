// Local Storage Management
// Handles persistence of practice sessions and user data

class PracticeStorage {
    constructor() {
        this.storageKey = 'chinese-writing-app';
        this.version = '1.0';
        this.init();
    }
    
    init() {
        try {
            // Check if localStorage is available
            if (typeof Storage === 'undefined') {
                console.warn('⚠️ LocalStorage not available, data will not persist');
                this.available = false;
                return;
            }
            
            this.available = true;
            
            // Initialize storage structure if needed
            if (!localStorage.getItem(this.storageKey)) {
                this.initializeStorage();
            }
            
            // Check for version updates
            this.checkVersion();
            
            console.log('💾 Storage initialized successfully');
        } catch (error) {
            console.error('Failed to initialize storage:', error);
            this.available = false;
        }
    }
    
    initializeStorage() {
        const initialData = {
            version: this.version,
            sessions: [],
            settings: {
                brushSize: 8,
                brushColor: '#000000',
                showPressureIndicator: true,
                autoSave: true,
                soundEffects: false
            },
            statistics: {
                totalSessions: 0,
                totalCharacters: 0,
                totalPracticeTime: 0,
                charactersmastered: 0,
                lastSession: null
            }
        };
        
        localStorage.setItem(this.storageKey, JSON.stringify(initialData));
        console.log('🏗️ Storage initialized with default data');
    }
    
    checkVersion() {
        const data = this.getData();
        if (data.version !== this.version) {
            console.log(`🔄 Migrating storage from ${data.version} to ${this.version}`);
            this.migrateData(data);
        }
    }
    
    migrateData(oldData) {
        // Handle version migration if needed
        const newData = {
            ...oldData,
            version: this.version
        };
        
        // Add any new fields that might be missing
        if (!newData.settings) {
            newData.settings = {
                brushSize: 8,
                brushColor: '#000000',
                showPressureIndicator: true,
                autoSave: true,
                soundEffects: false
            };
        }
        
        if (!newData.statistics) {
            newData.statistics = {
                totalSessions: 0,
                totalCharacters: 0,
                totalPracticeTime: 0,
                charactersmastered: 0,
                lastSession: null
            };
        }
        
        localStorage.setItem(this.storageKey, JSON.stringify(newData));
        console.log('✅ Data migration completed');
    }
    
    getData() {
        if (!this.available) return null;
        
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Failed to get data from storage:', error);
            return null;
        }
    }
    
    saveData(data) {
        if (!this.available) return false;
        
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Failed to save data to storage:', error);
            return false;
        }
    }
    
    saveSession(session) {
        if (!this.available) return false;
        
        try {
            const data = this.getData();
            if (!data) return false;
            
            // Convert session results Map to object for storage
            const sessionData = {
                id: session.id || this.generateSessionId(),
                date: session.date || new Date().toISOString().split('T')[0],
                startTime: session.startTime,
                duration: session.duration,
                type: session.type || 'character-practice',
                level: session.level || 'hsk-3',
                results: Object.fromEntries(session.results || new Map()),
                characters: session.characters || [],
                completed: session.completed || false,
                savedAt: Date.now()
            };
            
            // Find existing session or add new one
            const existingIndex = data.sessions.findIndex(s => s.id === sessionData.id);
            if (existingIndex >= 0) {
                data.sessions[existingIndex] = sessionData;
            } else {
                data.sessions.push(sessionData);
            }
            
            // Keep only last 50 sessions
            if (data.sessions.length > 50) {
                data.sessions = data.sessions.slice(-50);
            }
            
            // Update statistics
            this.updateStatistics(data, sessionData);
            
            return this.saveData(data);
        } catch (error) {
            console.error('Failed to save session:', error);
            return false;
        }
    }
    
    loadSession(sessionId) {
        const data = this.getData();
        if (!data) return null;
        
        const session = data.sessions.find(s => s.id === sessionId);
        if (!session) return null;
        
        // Convert results object back to Map
        session.results = new Map(Object.entries(session.results));
        
        return session;
    }
    
    getRecentSessions(limit = 10) {
        const data = this.getData();
        if (!data) return [];
        
        return data.sessions
            .sort((a, b) => b.savedAt - a.savedAt)
            .slice(0, limit)
            .map(session => ({
                ...session,
                results: new Map(Object.entries(session.results))
            }));
    }
    
    deleteSession(sessionId) {
        const data = this.getData();
        if (!data) return false;
        
        data.sessions = data.sessions.filter(s => s.id !== sessionId);
        return this.saveData(data);
    }
    
    updateStatistics(data, sessionData) {
        const stats = data.statistics;
        
        // Update totals
        stats.totalSessions++;
        stats.totalCharacters += sessionData.characters?.length || 0;
        stats.totalPracticeTime += sessionData.duration || 0;
        stats.lastSession = sessionData.date;
        
        // Count mastered characters
        if (sessionData.results) {
            const mastered = Object.values(sessionData.results)
                .filter(result => result.status === 'mastered').length;
            stats.charactersmastered += mastered;
        }
        
        console.log('📊 Statistics updated');
    }
    
    getStatistics() {
        const data = this.getData();
        return data?.statistics || null;
    }
    
    saveSettings(settings) {
        if (!this.available) return false;
        
        const data = this.getData();
        if (!data) return false;
        
        data.settings = { ...data.settings, ...settings };
        return this.saveData(data);
    }
    
    getSettings() {
        const data = this.getData();
        return data?.settings || {
            brushSize: 8,
            brushColor: '#000000',
            showPressureIndicator: true,
            autoSave: true,
            soundEffects: false
        };
    }
    
    exportData() {
        const data = this.getData();
        if (!data) return null;
        
        return {
            ...data,
            exportedAt: new Date().toISOString(),
            appVersion: this.version
        };
    }
    
    importData(importedData) {
        if (!this.available) return false;
        
        try {
            // Validate imported data
            if (!importedData.version || !importedData.sessions) {
                throw new Error('Invalid data format');
            }
            
            // Merge with existing data
            const currentData = this.getData() || { sessions: [], settings: {}, statistics: {} };
            
            const mergedData = {
                version: this.version,
                sessions: [...currentData.sessions, ...importedData.sessions],
                settings: { ...currentData.settings, ...importedData.settings },
                statistics: this.mergeStatistics(currentData.statistics, importedData.statistics)
            };
            
            // Remove duplicates and sort
            mergedData.sessions = this.removeDuplicateSessions(mergedData.sessions);
            
            return this.saveData(mergedData);
        } catch (error) {
            console.error('Failed to import data:', error);
            return false;
        }
    }
    
    removeDuplicateSessions(sessions) {
        const seen = new Set();
        return sessions
            .filter(session => {
                const key = `${session.date}-${session.startTime}`;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            })
            .sort((a, b) => b.savedAt - a.savedAt);
    }
    
    mergeStatistics(current, imported) {
        return {
            totalSessions: (current.totalSessions || 0) + (imported.totalSessions || 0),
            totalCharacters: (current.totalCharacters || 0) + (imported.totalCharacters || 0),
            totalPracticeTime: (current.totalPracticeTime || 0) + (imported.totalPracticeTime || 0),
            charactersmastered: (current.charactersmastered || 0) + (imported.charactersmastered || 0),
            lastSession: Math.max(
                new Date(current.lastSession || 0).getTime(),
                new Date(imported.lastSession || 0).getTime()
            )
        };
    }
    
    clearData() {
        if (!this.available) return false;
        
        try {
            localStorage.removeItem(this.storageKey);
            this.initializeStorage();
            console.log('🗑️ Storage cleared and reinitialized');
            return true;
        } catch (error) {
            console.error('Failed to clear storage:', error);
            return false;
        }
    }
    
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    getStorageSize() {
        if (!this.available) return 0;
        
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? data.length : 0;
        } catch (error) {
            return 0;
        }
    }
    
    getStorageInfo() {
        const data = this.getData();
        return {
            available: this.available,
            version: data?.version || 'unknown',
            sessionsCount: data?.sessions?.length || 0,
            storageSize: this.getStorageSize(),
            lastUpdated: data?.statistics?.lastSession || null
        };
    }
}

// Export for global use
window.PracticeStorage = PracticeStorage;