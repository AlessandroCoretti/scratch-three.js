import * as THREE from 'three'

// High-Frequency Diagonal Rolling Wave
// Styled to match the isometric voxel reference
// Harmonious Rolling Wave (Single Diagonal)
export function getWaveHeight(x, z, time) {
    // Single diagonal wave for clean, constant oblique motion
    // Frequency: 0.4 (Smooth)
    // Speed: 1.0 (Gentle)
    return Math.sin((x + z) * 0.4 + time * 1.0) * 0.6;
}
