import React, { useMemo } from 'react'
import { useGLTF, Edges } from '@react-three/drei'
import * as THREE from 'three'

export default function ShipPart({ material, ...props }) {
  const { nodes } = useGLTF('/models/ship-pirate-large.glb')

  const defaultMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#faefe6',
    roughness: 0.8
  }), [])

  const activeMaterial = material || defaultMaterial

  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes['ship-pirate-large_1'].geometry} material={activeMaterial} castShadow receiveShadow>
        <Edges color="#000000" threshold={15} />
        <mesh geometry={nodes['sail-b'].geometry} material={activeMaterial} position={[0, 4.547, -5.357]} castShadow receiveShadow>
          <Edges color="#000000" threshold={15} />
        </mesh>
        <mesh geometry={nodes['sail-a'].geometry} material={activeMaterial} position={[0, 3.139, -0.356]} castShadow receiveShadow>
          <Edges color="#000000" threshold={15} />
        </mesh>
        <mesh geometry={nodes['flag-c'].geometry} material={activeMaterial} position={[0, 5.681, 4.215]} castShadow receiveShadow>
          <Edges color="#000000" threshold={15} />
        </mesh>
        <mesh geometry={nodes['flag-c_1'].geometry} material={activeMaterial} position={[0, 8.838, -0.343]} castShadow receiveShadow>
          <Edges color="#000000" threshold={15} />
        </mesh>
        <mesh geometry={nodes['flag-c_2'].geometry} material={activeMaterial} position={[0, 8.238, -5.357]} castShadow receiveShadow>
          <Edges color="#000000" threshold={15} />
        </mesh>
      </mesh>
    </group>
  )
}

useGLTF.preload('/models/ship-pirate-large.glb')
