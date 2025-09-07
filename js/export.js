// Results Export System
// Generates formatted results for integration with Chinese study system

class ResultsExporter {
    static generateResults(session, characters) {
        const results = {
            date: session.date || new Date().toISOString().split('T')[0],
            duration: Math.round(session.duration / 60000), // Convert to minutes
            totalCharacters: characters.length,
            mastered: [],
            needsWork: [],
            notPracticed: [],
            sessionType: session.type || 'character-practice',
            level: session.level || 'hsk-3'
        };
        
        // Categorize characters by status
        for (const [char, data] of session.results.entries()) {
            switch (data.status) {
                case 'mastered':
                    results.mastered.push(char);
                    break;
                case 'needs-work':
                    results.needsWork.push(char);
                    break;
                case 'not-practiced':
                    results.notPracticed.push(char);
                    break;
            }
        }
        
        return this.formatForFleetingNotes(results, session);
    }
    
    static formatForFleetingNotes(results, session) {
        const date = results.date;
        const duration = results.duration;
        const totalChars = results.totalCharacters;
        
        // Calculate success rate
        const practiced = results.mastered.length + results.needsWork.length;
        const successRate = practiced > 0 ? Math.round((results.mastered.length / practiced) * 100) : 0;
        
        let output = `#chinese-writing-results\n\n`;
        output += `🎯 CHINESE WRITING PRACTICE - ${date}\n\n`;
        
        // Session summary
        output += `**Session:** ${this.formatSessionType(results.sessionType)} | `;
        output += `**Duration:** ${duration} min | `;
        output += `**Characters:** ${totalChars}\n\n`;
        
        // Status breakdown
        if (results.mastered.length > 0) {
            output += `**MASTERED ✅** (${results.mastered.length}): ${results.mastered.join(',')}  \n`;
        }
        if (results.needsWork.length > 0) {
            output += `**NEEDS WORK ⚠️** (${results.needsWork.length}): ${results.needsWork.join(',')}  \n`;
        }
        if (results.notPracticed.length > 0) {
            output += `**NOT PRACTICED ❌** (${results.notPracticed.length}): ${results.notPracticed.join(',')}  \n`;
        }
        
        output += `\n`;
        
        // Detailed breakdown if we have attempt data
        if (this.hasDetailedData(session)) {
            output += `**Details:**\n`;
            
            // Show details for practiced characters
            const allPracticed = [...results.mastered, ...results.needsWork];
            for (const char of allPracticed) {
                const data = session.results.get(char);
                const charData = session.characterData?.[char];
                const pinyin = charData?.pinyin || '';
                const status = data.status === 'mastered' ? 'mastered' : 'needs work';
                
                output += `• ${char}${pinyin ? ` (${pinyin})` : ''}: ${data.attempts || 1} attempts → ${status}  \n`;
            }
            output += `\n`;
        }
        
        // Raw data for automation
        output += `**Raw Data:** `;
        output += `mastered:${results.mastered.join(',')}|`;
        output += `needs_work:${results.needsWork.join(',')}|`;
        output += `not_practiced:${results.notPracticed.join(',')}|`;
        output += `duration:${duration}|`;
        output += `session:${date}|`;
        output += `success_rate:${successRate}`;
        
        return output;
    }
    
    static formatSessionType(type) {
        const types = {
            'character-practice': 'Character Practice',
            'deep-dive': 'Character Deep Dive',
            'review': 'Review Session',
            'test': 'Practice Test',
            'stroke-order': 'Stroke Order Practice',
            'quick-practice': 'Quick Practice'
        };
        
        return types[type] || 'Practice Session';
    }
    
    static hasDetailedData(session) {
        // Check if we have detailed attempt data
        for (const [char, data] of session.results.entries()) {
            if (data.attempts && data.attempts > 0) {
                return true;
            }
        }
        return false;
    }
    
    static generateCSV(session, characters) {
        let csv = 'Character,Pinyin,Meaning,Status,Attempts,Duration\n';
        
        for (const char of characters) {
            const result = session.results.get(char);
            const charData = session.characterData?.[char];
            
            const row = [
                char,
                charData?.pinyin || '',
                charData?.meaning || '',
                result?.status || 'not-practiced',
                result?.attempts || 0,
                Math.round((result?.timeSpent || 0) / 1000) // Convert to seconds
            ];
            
            csv += row.map(field => `"${field}"`).join(',') + '\n';
        }
        
        return csv;
    }
    
    static generateJSON(session, characters) {
        const export_data = {
            metadata: {
                date: session.date || new Date().toISOString().split('T')[0],
                sessionType: session.type || 'character-practice',
                duration: session.duration,
                totalCharacters: characters.length,
                exportedAt: new Date().toISOString()
            },
            results: []
        };
        
        for (const char of characters) {
            const result = session.results.get(char);
            const charData = session.characterData?.[char];
            
            export_data.results.push({
                character: char,
                pinyin: charData?.pinyin || '',
                meaning: charData?.meaning || '',
                strokes: charData?.strokes || 0,
                hskLevel: charData?.hskLevel || 0,
                status: result?.status || 'not-practiced',
                attempts: result?.attempts || 0,
                timeSpent: result?.timeSpent || 0,
                lastPracticed: result?.lastPracticed || null
            });
        }
        
        return JSON.stringify(export_data, null, 2);
    }
    
    static generateMarkdownReport(session, characters) {
        const results = this.analyzeResults(session, characters);
        
        let report = `# Chinese Character Practice Report\n\n`;
        report += `**Date:** ${results.date}  \n`;
        report += `**Duration:** ${results.duration} minutes  \n`;
        report += `**Characters Practiced:** ${results.practiced}/${results.total}  \n`;
        report += `**Success Rate:** ${results.successRate}%  \n\n`;
        
        // Progress summary
        report += `## Progress Summary\n\n`;
        if (results.mastered.length > 0) {
            report += `### ✅ Mastered (${results.mastered.length})\n`;
            results.mastered.forEach(char => {
                const charData = session.characterData?.[char];
                report += `- **${char}** (${charData?.pinyin || ''}) - ${charData?.meaning || ''}\n`;
            });
            report += `\n`;
        }
        
        if (results.needsWork.length > 0) {
            report += `### ⚠️ Needs More Practice (${results.needsWork.length})\n`;
            results.needsWork.forEach(char => {
                const charData = session.characterData?.[char];
                report += `- **${char}** (${charData?.pinyin || ''}) - ${charData?.meaning || ''}\n`;
            });
            report += `\n`;
        }
        
        if (results.notPracticed.length > 0) {
            report += `### ❌ Not Practiced (${results.notPracticed.length})\n`;
            results.notPracticed.forEach(char => {
                const charData = session.characterData?.[char];
                report += `- **${char}** (${charData?.pinyin || ''}) - ${charData?.meaning || ''}\n`;
            });
            report += `\n`;
        }
        
        // Recommendations
        report += `## Recommendations\n\n`;
        if (results.needsWork.length > 0) {
            report += `- Focus on these characters in your next session: ${results.needsWork.join(', ')}\n`;
        }
        if (results.notPracticed.length > 0) {
            report += `- Complete practice for: ${results.notPracticed.join(', ')}\n`;
        }
        if (results.successRate < 70) {
            report += `- Consider reviewing stroke order or slowing down practice pace\n`;
        }
        if (results.successRate >= 80) {
            report += `- Great progress! Consider moving to more challenging characters\n`;
        }
        
        return report;
    }
    
    static analyzeResults(session, characters) {
        const analysis = {
            date: session.date || new Date().toISOString().split('T')[0],
            duration: Math.round(session.duration / 60000),
            total: characters.length,
            mastered: [],
            needsWork: [],
            notPracticed: [],
            practiced: 0,
            successRate: 0,
            averageAttempts: 0,
            totalAttempts: 0
        };
        
        let totalAttempts = 0;
        let practicedsCount = 0;
        
        for (const char of characters) {
            const result = session.results.get(char);
            
            switch (result?.status) {
                case 'mastered':
                    analysis.mastered.push(char);
                    practicedsCount++;
                    break;
                case 'needs-work':
                    analysis.needsWork.push(char);
                    practicedsCount++;
                    break;
                case 'not-practiced':
                default:
                    analysis.notPracticed.push(char);
                    break;
            }
            
            if (result?.attempts) {
                totalAttempts += result.attempts;
            }
        }
        
        analysis.practiced = practicedsCount;
        analysis.successRate = practicedsCount > 0 ? Math.round((analysis.mastered.length / practicedsCount) * 100) : 0;
        analysis.totalAttempts = totalAttempts;
        analysis.averageAttempts = practicedsCount > 0 ? Math.round(totalAttempts / practicedsCount) : 0;
        
        return analysis;
    }
}

// Export for global use
window.ResultsExporter = ResultsExporter;