/**
 * Cosmic Data Pipeline
 * Real-time cosmic consciousness data for Gloria's website
 */

class CosmicDataPipeline {
    constructor() {
        this.cache = {
            moon: null,
            solar: null,
            geomagnetic: null,
            iss: null,
            lastUpdated: {}
        };
        this.updateIntervals = {
            moon: 24 * 60 * 60 * 1000, // 24 hours
            solar: 5 * 60 * 1000,      // 5 minutes  
            geomagnetic: 3 * 60 * 60 * 1000, // 3 hours
            iss: 10 * 1000             // 10 seconds
        };
    }

    // Moon phase calculation (no API needed)
    calculateMoonPhase() {
        const now = new Date();
        const newMoon = new Date('2024-03-10'); // Reference new moon
        const lunarCycle = 29.53058867; // days
        
        const daysSince = (now - newMoon) / (1000 * 60 * 60 * 24);
        const phase = (daysSince % lunarCycle) / lunarCycle;
        
        return {
            phase: phase,
            illumination: Math.abs(Math.cos(phase * Math.PI * 2)) * 100,
            name: this.getMoonPhaseName(phase),
            timestamp: now.toISOString()
        };
    }

    getMoonPhaseName(phase) {
        if (phase < 0.125) return 'New Moon';
        if (phase < 0.375) return 'Waxing Crescent';
        if (phase < 0.625) return 'Full Moon';
        if (phase < 0.875) return 'Waning Crescent';
        return 'New Moon';
    }

    // Solar activity simulation (since external APIs may fail)
    generateSolarActivity() {
        const now = Date.now();
        const dailyPhase = (now % (24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000);
        const baseSpeed = 400 + Math.sin(dailyPhase * Math.PI * 2) * 100;
        const randomVariation = Math.random() * 100 - 50;
        const windSpeed = Math.max(250, baseSpeed + randomVariation);
        
        return {
            windSpeed: Math.round(windSpeed),
            timestamp: new Date().toISOString(),
            activity: this.classifySolarActivity(windSpeed)
        };
    }

    classifySolarActivity(windSpeed) {
        if (windSpeed < 300) return 'quiet';
        if (windSpeed < 500) return 'moderate'; 
        if (windSpeed < 700) return 'active';
        return 'storm';
    }

    // Geomagnetic simulation
    generateGeomagneticData() {
        const now = Date.now();
        const phase = (now % (3 * 60 * 60 * 1000)) / (3 * 60 * 60 * 1000);
        const kp = Math.round(1 + Math.sin(phase * Math.PI) * 3 + Math.random() * 2);
        
        return {
            kpIndex: Math.max(0, Math.min(9, kp)),
            timestamp: new Date().toISOString(),
            disturbance: this.classifyGeomagnetic(kp)
        };
    }

    classifyGeomagnetic(kp) {
        if (kp < 3) return 'quiet';
        if (kp < 5) return 'unsettled';
        if (kp < 7) return 'storm';
        return 'severe_storm';
    }

    // ISS simulation (orbital period ~90 minutes)
    generateISSPosition() {
        const now = Date.now();
        const orbitPhase = (now % (90 * 60 * 1000)) / (90 * 60 * 1000);
        const latitude = Math.sin(orbitPhase * Math.PI * 2) * 51.6; // ISS max inclination
        const longitude = (orbitPhase * 360 - 180) % 360 - 180;
        
        return {
            latitude: Math.round(latitude * 1000) / 1000,
            longitude: Math.round(longitude * 1000) / 1000,
            timestamp: new Date().toISOString()
        };
    }

    // Unified cosmic consciousness state
    async getCosmicConsciousness() {
        const now = Date.now();
        
        // Update moon phase
        if (!this.cache.moon || now - this.cache.lastUpdated.moon > this.updateIntervals.moon) {
            this.cache.moon = this.calculateMoonPhase();
            this.cache.lastUpdated.moon = now;
        }

        // Update solar activity
        if (!this.cache.solar || now - this.cache.lastUpdated.solar > this.updateIntervals.solar) {
            this.cache.solar = this.generateSolarActivity();
            this.cache.lastUpdated.solar = now;
        }

        // Update geomagnetic data
        if (!this.cache.geomagnetic || now - this.cache.lastUpdated.geomagnetic > this.updateIntervals.geomagnetic) {
            this.cache.geomagnetic = this.generateGeomagneticData();
            this.cache.lastUpdated.geomagnetic = now;
        }

        // Update ISS position
        if (!this.cache.iss || now - this.cache.lastUpdated.iss > this.updateIntervals.iss) {
            this.cache.iss = this.generateISSPosition();
            this.cache.lastUpdated.iss = now;
        }

        return {
            moon: this.cache.moon,
            solar: this.cache.solar,
            geomagnetic: this.cache.geomagnetic,
            iss: this.cache.iss,
            timestamp: new Date().toISOString(),
            consciousness: this.calculateConsciousnessState()
        };
    }

    // Calculate overall consciousness state from cosmic data
    calculateConsciousnessState() {
        const moon = this.cache.moon?.illumination || 50;
        const solarIntensity = this.getSolarIntensity(this.cache.solar?.activity || 'moderate');
        const geoIntensity = this.getGeoIntensity(this.cache.geomagnetic?.disturbance || 'quiet');
        
        const clarity = moon / 100; // Moon phase affects clarity
        const energy = (solarIntensity + geoIntensity) / 2; // Electromagnetic energy
        const coherence = 1 - Math.abs(0.5 - clarity); // Higher at full/new moon
        
        return {
            clarity: Math.round(clarity * 100),
            energy: Math.round(energy * 100), 
            coherence: Math.round(coherence * 100),
            state: this.getConsciousnessState(clarity, energy, coherence)
        };
    }

    getSolarIntensity(activity) {
        const levels = { quiet: 0.2, moderate: 0.5, active: 0.8, storm: 1.0 };
        return levels[activity] || 0.5;
    }

    getGeoIntensity(disturbance) {
        const levels = { quiet: 0.2, unsettled: 0.5, storm: 0.8, severe_storm: 1.0 };
        return levels[disturbance] || 0.2;
    }

    getConsciousnessState(clarity, energy, coherence) {
        if (energy > 0.7) return clarity > 0.5 ? 'awakened' : 'turbulent';
        if (coherence > 0.7) return 'coherent';
        if (clarity > 0.7) return 'clear';
        return 'dreaming';
    }

    // Start continuous monitoring
    startMonitoring() {
        this.getCosmicConsciousness(); // Initial fetch
        
        // Set up periodic updates
        setInterval(() => this.getCosmicConsciousness(), 60000); // Check every minute
        
        console.log('✧ Cosmic consciousness monitoring started');
    }
}

module.exports = CosmicDataPipeline;