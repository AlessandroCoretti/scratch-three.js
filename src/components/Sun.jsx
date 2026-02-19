import { useRef, forwardRef } from 'react'
import * as THREE from 'three'

const Sun = forwardRef((props, ref) => {
    return (
        <group ref={ref} {...props}>
            {/* Core Sun (Solid White Paper) */}
            <mesh>
                <sphereGeometry args={[1.5, 32, 32]} />
                <meshBasicMaterial color="#ffffff" />
            </mesh>

            {/* Sketch Halo (Wireframe) */}
            <mesh>
                <sphereGeometry args={[1.6, 16, 16]} />
                <meshBasicMaterial color="#eaddcf" wireframe />
            </mesh>
        </group>
    )
})

export default Sun
