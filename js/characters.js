// Character Data Management
// Handles character metadata, stroke order, and practice data

class CharacterManager {
    static async loadCharacterData(characters) {
        const data = {};
        
        // Load character data (in a real app, this might come from an API or database)
        const characterDatabase = CharacterManager.getCharacterDatabase();
        
        for (const char of characters) {
            data[char] = characterDatabase[char] || {
                character: char,
                pinyin: 'unknown',
                meaning: 'Unknown meaning',
                strokes: 0,
                radical: '',
                hskLevel: 0
            };
        }
        
        console.log(`📚 Loaded data for ${characters.length} characters`);
        return data;
    }
    
    static getCharacterDatabase() {
        // Character database with metadata
        // In production, this would come from a proper database or API
        return {
            '停': {
                character: '停',
                pinyin: 'tíng',
                meaning: 'stop, halt, park',
                strokes: 11,
                radical: '亻',
                hskLevel: 3,
                components: ['亻', '亭'],
                strokeOrder: ['丿', '丨', '丶', '一', '丨', '𠃍', '一', '丨', '丨', '𠃍', '一'],
                examples: ['停车 (tíngchē) - park a car', '停止 (tíngzhǐ) - stop']
            },
            '锁': {
                character: '锁',
                pinyin: 'suǒ',
                meaning: 'lock, chain',
                strokes: 12,
                radical: '钅',
                hskLevel: 3,
                components: ['钅', '贝'],
                examples: ['上锁 (shàngsuǒ) - lock up', '锁门 (suǒmén) - lock the door']
            },
            '偷': {
                character: '偷',
                pinyin: 'tōu',
                meaning: 'steal, secretly',
                strokes: 11,
                radical: '亻',
                hskLevel: 3,
                components: ['亻', '俞'],
                examples: ['偷东西 (tōu dōngxi) - steal things', '偷偷 (tōutōu) - secretly']
            },
            '担': {
                character: '担',
                pinyin: 'dān',
                meaning: 'carry, shoulder, burden',
                strokes: 8,
                radical: '扌',
                hskLevel: 3,
                components: ['扌', '旦'],
                examples: ['担心 (dānxīn) - worry', '担负 (dānfù) - bear, shoulder']
            },
            '台': {
                character: '台',
                pinyin: 'tái',
                meaning: 'platform, stage, Taiwan',
                strokes: 5,
                radical: '口',
                hskLevel: 2,
                components: ['厶', '口'],
                examples: ['台湾 (Táiwān) - Taiwan', '舞台 (wǔtái) - stage']
            },
            '演': {
                character: '演',
                pinyin: 'yǎn',
                meaning: 'perform, act,演',
                strokes: 14,
                radical: '氵',
                hskLevel: 3,
                components: ['氵', '寅'],
                examples: ['演出 (yǎnchū) - performance', '演员 (yǎnyuán) - actor']
            },
            '唱': {
                character: '唱',
                pinyin: 'chàng',
                meaning: 'sing, chant',
                strokes: 11,
                radical: '口',
                hskLevel: 3,
                components: ['口', '昌'],
                examples: ['唱歌 (chànggē) - sing songs', '合唱 (héchàng) - chorus']
            },
            '歌': {
                character: '歌',
                pinyin: 'gē',
                meaning: 'song, sing',
                strokes: 14,
                radical: '欠',
                hskLevel: 2,
                components: ['可', '欠'],
                examples: ['唱歌 (chànggē) - sing songs', '歌手 (gēshǒu) - singer']
            }
        };
    }
    
    static getStrokeOrder(character) {
        const data = this.getCharacterDatabase()[character];
        return data?.strokeOrder || [];
    }
    
    static getExamples(character) {
        const data = this.getCharacterDatabase()[character];
        return data?.examples || [];
    }
    
    static getComponents(character) {
        const data = this.getCharacterDatabase()[character];
        return data?.components || [];
    }
    
    static getRadical(character) {
        const data = this.getCharacterDatabase()[character];
        return data?.radical || '';
    }
    
    static getHSKLevel(character) {
        const data = this.getCharacterDatabase()[character];
        return data?.hskLevel || 0;
    }
    
    static getDifficulty(character) {
        const data = this.getCharacterDatabase()[character];
        if (!data) return 'unknown';
        
        // Determine difficulty based on stroke count and HSK level
        const strokes = data.strokes || 0;
        const hskLevel = data.hskLevel || 0;
        
        if (hskLevel <= 1 && strokes <= 5) return 'easy';
        if (hskLevel <= 2 && strokes <= 8) return 'easy';
        if (hskLevel <= 3 && strokes <= 12) return 'medium';
        if (hskLevel <= 4 || strokes <= 16) return 'medium';
        return 'hard';
    }
    
    static validateCharacter(char) {
        // Check if character is a valid Chinese character
        const chineseRegex = /[\u4e00-\u9fff]/;
        return chineseRegex.test(char);
    }
    
    static filterCharactersByHSK(characters, maxLevel) {
        return characters.filter(char => {
            const level = this.getHSKLevel(char);
            return level > 0 && level <= maxLevel;
        });
    }
    
    static sortCharactersByDifficulty(characters) {
        const difficultyOrder = { 'easy': 1, 'medium': 2, 'hard': 3, 'unknown': 4 };
        
        return characters.sort((a, b) => {
            const diffA = this.getDifficulty(a);
            const diffB = this.getDifficulty(b);
            
            const orderA = difficultyOrder[diffA] || 4;
            const orderB = difficultyOrder[diffB] || 4;
            
            if (orderA !== orderB) {
                return orderA - orderB;
            }
            
            // If same difficulty, sort by stroke count
            const strokesA = this.getCharacterDatabase()[a]?.strokes || 999;
            const strokesB = this.getCharacterDatabase()[b]?.strokes || 999;
            
            return strokesA - strokesB;
        });
    }
    
    static getCharacterStats(characters) {
        const stats = {
            total: characters.length,
            byHSK: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, unknown: 0 },
            byDifficulty: { easy: 0, medium: 0, hard: 0, unknown: 0 },
            avgStrokes: 0,
            totalStrokes: 0
        };
        
        let totalStrokes = 0;
        
        characters.forEach(char => {
            const data = this.getCharacterDatabase()[char];
            if (data) {
                const hskLevel = data.hskLevel || 0;
                if (hskLevel > 0 && hskLevel <= 6) {
                    stats.byHSK[hskLevel]++;
                } else {
                    stats.byHSK.unknown++;
                }
                
                const difficulty = this.getDifficulty(char);
                stats.byDifficulty[difficulty]++;
                
                totalStrokes += data.strokes || 0;
            } else {
                stats.byHSK.unknown++;
                stats.byDifficulty.unknown++;
            }
        });
        
        stats.totalStrokes = totalStrokes;
        stats.avgStrokes = characters.length > 0 ? Math.round(totalStrokes / characters.length) : 0;
        
        return stats;
    }
    
    static searchCharacters(query, maxResults = 10) {
        const database = this.getCharacterDatabase();
        const results = [];
        
        const lowerQuery = query.toLowerCase();
        
        for (const [char, data] of Object.entries(database)) {
            if (results.length >= maxResults) break;
            
            // Search in character, pinyin, and meaning
            if (char === query || 
                data.pinyin.toLowerCase().includes(lowerQuery) ||
                data.meaning.toLowerCase().includes(lowerQuery)) {
                results.push({
                    character: char,
                    ...data,
                    relevance: this.calculateRelevance(query, char, data)
                });
            }
        }
        
        // Sort by relevance
        return results.sort((a, b) => b.relevance - a.relevance);
    }
    
    static calculateRelevance(query, char, data) {
        let relevance = 0;
        const lowerQuery = query.toLowerCase();
        
        // Exact character match gets highest relevance
        if (char === query) relevance += 100;
        
        // Pinyin matches
        if (data.pinyin.toLowerCase() === lowerQuery) relevance += 80;
        if (data.pinyin.toLowerCase().startsWith(lowerQuery)) relevance += 60;
        if (data.pinyin.toLowerCase().includes(lowerQuery)) relevance += 40;
        
        // Meaning matches
        if (data.meaning.toLowerCase().includes(lowerQuery)) relevance += 30;
        
        // Boost common characters (lower HSK level)
        if (data.hskLevel && data.hskLevel <= 3) relevance += 10;
        
        return relevance;
    }
}

// Export for global use
window.CharacterManager = CharacterManager;