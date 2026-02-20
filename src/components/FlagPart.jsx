import React, { useMemo } from 'react'
import { useGLTF, Edges } from '@react-three/drei'
import * as THREE from 'three'

export default function FlagPart({ material, ...props }) {
  const { nodes } = useGLTF('/models/flag-high-pennant.glb')

  const defaultMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#faefe6',
    roughness: 0.8
  }), [])

  const activeMaterial = material || defaultMaterial

  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes['flag-high-pennant_1'].geometry} material={activeMaterial} castShadow receiveShadow>
        <Edges color="#000000" threshold={15} />
      </mesh>
    </group>
  )
}

useGLTF.preload('/models/flag-high-pennant.glb')
