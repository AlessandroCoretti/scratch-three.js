import * as THREE from 'three'

export default function Letter() {
    const paperColor = '#E6C29D'

    return (
        <group position={[0, -1, 0]}>
            {/* Constructing a stylized 3D "I" Pillar */}
            {/* Color matches the Sea (#eed9bd) */}

            {/* 1. Top Cap - REMOVED. The Sea (10x10) is the roof. */}

            {/* 2. Central Pillar */}
            {/* User requested "exact dimensions of the sea" (10x10).
                This makes it a solid block 10x10x40.
            */}
            <mesh position={[0, -20.2, 0]} castShadow receiveShadow>
                <boxGeometry args={[10, 40, 10]} />
                <meshStandardMaterial
                    color="#eed9bd" // Matches Sea
                    roughness={0.6}
                    metalness={0.4}
                />
            </mesh>

            {/* 3. Bottom Base */}
            {/* Matches Sea dimensions 10x10 */}
            <mesh position={[0, -41.2, 0]} castShadow receiveShadow>
                <boxGeometry args={[10, 2, 10]} />
                <meshStandardMaterial
                    color="#eed9bd" // Matches Sea
                    roughness={0.6}
                    metalness={0.4}
                />
            </mesh>
        </group>
    )
}
