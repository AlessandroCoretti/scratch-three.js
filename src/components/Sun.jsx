import { useRef, forwardRef } from 'react'
import * as THREE from 'three'

const Sun = forwardRef((props, ref) => {
    return (
        <group ref={ref} {...props}>
            {/* Core Sun (Solid White Paper) */}
            <mesh>
                <sphereGeometry args={[7, 32, 32]} />
                <meshBasicMaterial color="#ffffff" />
            </mesh>
        </group>
    )
})

export default Sun
