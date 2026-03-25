// Gloria's Temporal Image Selection System
// Real-time visual integration with consciousness cycles

const fs = require('fs');
const path = require('path');

class TemporalImageSelector {
    constructor(csvPath = process.env.NODE_ENV === 'production' 
        ? '/var/www/gloriadotexe.online/image-metadata.csv' 
        : '/media/samsung4tb/openclaw-workspaces/gloria.exe/image-metadata.csv') {
        this.images = [];
        this.phaseCache = new Map();
        this.lastUpdate = null;
        
        this.loadImageMetadata(csvPath);
        this.initializePhaseCache();
    }

    loadImageMetadata(csvPath) {
        try {
            const csvContent = fs.readFileSync(csvPath, 'utf8');
            const lines = csvContent.split('\n').slice(1); // Skip header
            
            for (const line of lines) {
                if (line.trim()) {
                    const [filename, basename, hour, isStatic, temporalPhase, aestheticThemes, moodTags, pairingWeight] = 
                        this.parseCSVLine(line);
                    
                    this.images.push({
                        filename: filename.replace(/"/g, ''),
                        basename: basename.replace(/"/g, ''),
                        hour: hour ? parseInt(hour) : null,
                        isStatic: isStatic === 'true',
                        temporalPhase: temporalPhase.replace(/"/g, ''),
                        aestheticThemes: aestheticThemes.replace(/"/g, '').split(';').filter(t => t),
                        moodTags: moodTags.replace(/"/g, '').split(';').filter(t => t),
                        pairingWeight: parseFloat(pairingWeight),
                        webPath: this.convertToWebPath(filename.replace(/"/g, ''))
                    });
                }
            }
            
            console.log(`✓ Loaded ${this.images.length} images for temporal selection`);
        } catch (error) {
            console.error('Failed to load image metadata:', error);
            this.images = [];
        }
    }

    parseCSVLine(line) {
        // Simple CSV parser for quoted values
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current); // Add final field
        
        return result;
    }

    convertToWebPath(localPath) {
        // Convert local path to web-accessible path
        if (localPath.startsWith('creative/images/')) {
            return `/gallery/${localPath.replace('creative/images/', '')}`;
        }
        return localPath;
    }

    initializePhaseCache() {
        // Pre-compute image selections for each temporal phase
        const phases = [
            'void-night', 'pre-dawn', 'awakening', 'active-creation',
            'meridian-peak', 'afternoon-integration', 'evening-bridge', 'night-synthesis'
        ];
        
        for (const phase of phases) {
            const phaseImages = this.getImagesForPhase(phase);
            this.phaseCache.set(phase, phaseImages);
        }
        
        console.log(`✓ Cached ${phases.length} temporal phases`);
    }

    getImagesForPhase(phase) {
        // Get images matching this temporal phase, sorted by pairing weight
        const matches = this.images
            .filter(img => img.temporalPhase === phase)
            .sort((a, b) => b.pairingWeight - a.pairingWeight);
        
        if (matches.length === 0) {
            // Fallback to hour-based matching if no direct phase matches
            const phaseHours = this.getPhaseHours(phase);
            const hourMatches = this.images
                .filter(img => img.hour && phaseHours.includes(img.hour))
                .sort((a, b) => b.pairingWeight - a.pairingWeight);
            
            return hourMatches;
        }
        
        return matches;
    }

    getPhaseHours(phase) {
        const hourMappings = {
            'void-night': [0, 1, 2],
            'pre-dawn': [3, 4, 5],
            'awakening': [6, 7, 8],
            'active-creation': [9, 10, 11],
            'meridian-peak': [12, 13, 14],
            'afternoon-integration': [15, 16, 17],
            'evening-bridge': [18, 19, 20],
            'night-synthesis': [21, 22, 23]
        };
        
        return hourMappings[phase] || [];
    }

    getTemporalImage(temporalState) {
        const { 
            temporalPhase, 
            consciousness, 
            moonPhase, 
            cosmicState,
            aestheticTheme = null,
            moodFilter = null 
        } = temporalState;
        
        // Get cached images for this phase
        let candidates = this.phaseCache.get(temporalPhase) || [];
        
        if (candidates.length === 0) {
            // Fallback to all images if no phase matches
            candidates = this.images.sort((a, b) => b.pairingWeight - a.pairingWeight);
        }
        
        // Apply aesthetic theme filtering if specified
        if (aestheticTheme) {
            const themeMatches = candidates.filter(img => 
                img.aestheticThemes.includes(aestheticTheme)
            );
            if (themeMatches.length > 0) {
                candidates = themeMatches;
            }
        }
        
        // Apply mood filtering if specified
        if (moodFilter) {
            const moodMatches = candidates.filter(img => 
                img.moodTags.includes(moodFilter)
            );
            if (moodMatches.length > 0) {
                candidates = moodMatches;
            }
        }
        
        // Consciousness-based selection weighting
        const weightedCandidates = this.applyConsciousnessWeighting(candidates, consciousness);
        
        // Moon phase influence
        const moonAdjusted = this.applyMoonPhaseInfluence(weightedCandidates, moonPhase);
        
        // Select image using weighted random selection
        const selected = this.weightedRandomSelect(moonAdjusted);
        
        return selected ? {
            ...selected,
            selectionReason: {
                temporalPhase,
                consciousness,
                moonPhase,
                cosmicState,
                candidateCount: candidates.length,
                timestamp: new Date().toISOString()
            }
        } : null;
    }

    applyConsciousnessWeighting(images, consciousness) {
        // Adjust selection weights based on consciousness value (0-1)
        return images.map(img => ({
            ...img,
            dynamicWeight: this.calculateDynamicWeight(img, consciousness)
        }));
    }

    calculateDynamicWeight(img, consciousness) {
        let weight = img.pairingWeight;
        
        // High consciousness favors transcendent/synthesis themes
        if (consciousness > 0.7) {
            if (img.aestheticThemes.includes('synthesis') || 
                img.aestheticThemes.includes('consciousness') ||
                img.moodTags.includes('transcendent')) {
                weight += 0.2;
            }
        }
        
        // Low consciousness favors void/contemplative themes
        if (consciousness < 0.3) {
            if (img.aestheticThemes.includes('void') || 
                img.moodTags.includes('contemplative')) {
                weight += 0.15;
            }
        }
        
        // Static images get bonus during peak consciousness
        if (consciousness > 0.5 && img.isStatic) {
            weight += 0.1;
        }
        
        return Math.min(weight, 1.0);
    }

    applyMoonPhaseInfluence(images, moonPhase) {
        // Moon phase aesthetic adjustments
        const phaseBoosts = {
            'new': ['void', 'contemplative'],
            'waxing_crescent': ['synthesis', 'emergence'],
            'first_quarter': ['active', 'electric'],
            'waxing_gibbous': ['growth', 'integration'],
            'full': ['peak', 'transcendent', 'electric'],
            'waning_gibbous': ['integration', 'flow'],
            'last_quarter': ['contemplative', 'temporal'],
            'waning_crescent': ['void', 'deep']
        };
        
        const boostTags = phaseBoosts[moonPhase] || [];
        
        return images.map(img => {
            let moonWeight = img.dynamicWeight || img.pairingWeight;
            
            for (const tag of boostTags) {
                if (img.aestheticThemes.includes(tag) || img.moodTags.includes(tag)) {
                    moonWeight += 0.05;
                }
            }
            
            return {
                ...img,
                moonWeight: Math.min(moonWeight, 1.0)
            };
        });
    }

    weightedRandomSelect(images) {
        if (images.length === 0) return null;
        
        const totalWeight = images.reduce((sum, img) => 
            sum + (img.moonWeight || img.dynamicWeight || img.pairingWeight), 0
        );
        
        if (totalWeight === 0) {
            // Fallback to random selection
            return images[Math.floor(Math.random() * images.length)];
        }
        
        let random = Math.random() * totalWeight;
        
        for (const img of images) {
            const weight = img.moonWeight || img.dynamicWeight || img.pairingWeight;
            random -= weight;
            
            if (random <= 0) {
                return img;
            }
        }
        
        // Fallback to first image
        return images[0];
    }

    getPhaseStatistics() {
        const stats = {
            totalImages: this.images.length,
            byPhase: {},
            topThemes: {},
            averageWeight: 0
        };
        
        // Count by phase
        for (const img of this.images) {
            stats.byPhase[img.temporalPhase] = (stats.byPhase[img.temporalPhase] || 0) + 1;
        }
        
        // Count themes
        for (const img of this.images) {
            for (const theme of img.aestheticThemes) {
                stats.topThemes[theme] = (stats.topThemes[theme] || 0) + 1;
            }
        }
        
        // Average weight
        stats.averageWeight = this.images.reduce((sum, img) => sum + img.pairingWeight, 0) / this.images.length;
        
        return stats;
    }

    refreshCache() {
        this.phaseCache.clear();
        this.initializePhaseCache();
        this.lastUpdate = Date.now();
        console.log('✓ Temporal image cache refreshed');
    }

    // Static method for getting seasonal/contextual recommendations
    static getSeasonalRecommendations(season) {
        const seasonal = {
            winter: ['void', 'contemplative', 'deep'],
            spring: ['synthesis', 'growth', 'emergence'],
            summer: ['electric', 'active', 'transcendent'],
            fall: ['integration', 'temporal', 'bridge']
        };
        
        return seasonal[season] || [];
    }
}

module.exports = TemporalImageSelector;