import { useState, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ScrollControls, Scroll, Environment, Float, PerspectiveCamera, useScroll, Cloud } from '@react-three/drei'
import { EffectComposer, Noise, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import Sea from './components/Sea'
import Ship from './components/Ship'
import Island from './components/Island'
import Overlay from './components/Overlay'
import Sun from './components/Sun'
import Letter from './components/Letter'
import Birds from './components/Birds'

function CameraController() {
  const scroll = useScroll()
  const vec = new THREE.Vector3()

  useFrame((state) => {
    const t = scroll.offset // [0, 1] over 5 pages

    const lookAtTarget = new THREE.Vector3(0, 0, 0)
    let x, y, z

    if (t < 0.2) {
      // PHASE 1: ISOMETRIC FIXED (Scene 1) - Restored to perfect 0.2
      x = 20
      y = 20
      z = 20
    } else if (t < 0.35) {
      // PHASE 2 (0.2 - 0.35): TRANSITION TO FRONTAL
      const p = (t - 0.2) / 0.15
      x = THREE.MathUtils.lerp(20, 0, p)
      y = THREE.MathUtils.lerp(20, 15, p)
      z = THREE.MathUtils.lerp(20, -35, p)
    } else if (t < 0.75) {
      // PHASE 3 (0.35 - 0.75): STABLE FRONTAL - THE VOYAGE
      x = 0
      y = 15
      z = -35
    } else if (t < 0.9) {
      // PHASE 4 (0.75 - 0.9): TO ISLAND SIDE
      const p = (t - 0.75) / 0.15
      x = THREE.MathUtils.lerp(0, -25, p)
      y = THREE.MathUtils.lerp(15, 15, p)
      z = THREE.MathUtils.lerp(-35, 10, p)
    } else {
      // PHASE 5 (0.9 - 1.0): LETTER REVEAL ZOOM OUT
      const p = (t - 0.9) / 0.1
      x = THREE.MathUtils.lerp(-25, 80, p)
      y = THREE.MathUtils.lerp(15, 40, p)
      z = THREE.MathUtils.lerp(10, 80, p)
      lookAtTarget.y = THREE.MathUtils.lerp(0, -20, p)
    }

    state.camera.position.lerp(vec.set(x, y, z), 0.1)
    state.camera.lookAt(lookAtTarget)
  })
  return null
}

function LightingController() {
  const scroll = useScroll()
  const light = useRef()
  const sun = useRef()
  const vec = new THREE.Vector3()

  useFrame((state) => {
    const t = scroll.offset
    let x, y, z
    const targetIntensity = { val: 1.5 }
    let sunScale = 0
    const sunPos = new THREE.Vector3(0, -25, 70)

    if (t < 0.2) {
      // PHASE 1: Natural light, Sun Hidden
      x = 8
      y = 15
      z = 8
      sunScale = 0
      targetIntensity.val = 1.5
    } else if (t < 0.35) {
      // PHASE 2: DRAMATIC SUNRISE (Finish by start of Voyage S3)
      const p = (t - 0.2) / 0.15
      x = THREE.MathUtils.lerp(8, 0, p)
      y = THREE.MathUtils.lerp(15, -25, p)
      z = THREE.MathUtils.lerp(8, 70, p)
      sunScale = THREE.MathUtils.smoothstep(p, 0.1, 0.8)
      targetIntensity.val = THREE.MathUtils.lerp(1.5, 0.8, p)
    } else {
      // PHASE 3, 4 & 5: Static Sunset (Always visible during voyage)
      x = 0
      y = -25
      z = 70
      sunScale = 1
      targetIntensity.val = 0.8
    }

    vec.set(x, y, z)

    if (light.current) {
      light.current.position.copy(vec)
      light.current.intensity = targetIntensity.val
    }
    if (sun.current) {
      sun.current.position.copy(sunPos)
      sun.current.scale.setScalar(sunScale)
    }
  })

  return (
    <>
      <directionalLight
        ref={light}
        position={[8, 15, 8]}
        intensity={1.5}
        color="#ffffff"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <Sun ref={sun} position={[15, 10, 15]} />
    </>
  )
}

function FogController() {
  const scroll = useScroll()
  const fogRef = useRef()

  useFrame((state) => {
    if (!fogRef.current) return
    const t = scroll.offset

    // SCROLL-CONTROLLED CLEARING:
    // Fog starts getting thinner at 0.45 and is fully clear by 0.7
    const p = THREE.MathUtils.smoothstep(t, 0.45, 0.7)

    // Smoothly shift fog between dense and clear based on S3 scroll
    fogRef.current.near = THREE.MathUtils.lerp(10, 20, p)
    fogRef.current.far = THREE.MathUtils.lerp(60, 200, p)
  })

  return <fog ref={fogRef} attach="fog" args={['#eed9bd', 10, 60]} />
}

function MovingClouds() {
  const scroll = useScroll()
  const group = useRef()

  useFrame((state) => {
    if (!group.current) return
    const t = scroll.offset

    // SCROLL-CONTROLLED PARTING:
    // Start parting at 0.45, fully open and faded by 0.75
    // Using smoothstep for a premium, non-linear feel
    const p = THREE.MathUtils.smoothstep(t, 0.45, 0.75)

    // 1. DISSOLVE EFFECT: Linked to scroll progress
    const opacity = THREE.MathUtils.clamp((1 - p) * 0.4, 0, 0.4)

    // NO SHRINKING: Scale remains stable
    group.current.scale.setScalar(1.0)

    // 2. PARTING LOGIC: Separation linked to scroll
    const separationFactor = p * 40 // Dramatic lateral move

    // Efficiently hide/show group
    group.current.visible = opacity > 0.001

    if (group.current.visible) {
      // 3. SEPARATION: Move each child cloud laterally
      group.current.children.forEach((cloud) => {
        if (!cloud.userData.initialX) cloud.userData.initialX = cloud.position.x

        const direction = cloud.userData.initialX < 0 ? -1 : 1
        cloud.position.x = cloud.userData.initialX + direction * separationFactor

        // Update Material for dissolve
        if (cloud.material) {
          cloud.material.opacity = opacity
          cloud.material.transparent = true
          cloud.material.depthWrite = false
        }
      })
    }
  })

  return (
    <group ref={group}>
      {/* SHROUDING THE SHIP: Lower Y positions (0.5 to 3) to wrap around the hull and sails */}
      <Cloud position={[-8, 0.5, -5]} speed={0.1} opacity={0.5} segments={12} color="#eed9bd" bounce={0.5} concentration={0.5} />
      <Cloud position={[8, 1, 5]} speed={0.15} opacity={0.5} segments={12} color="#eed9bd" bounce={0.3} concentration={0.5} />
      <Cloud position={[0, 2, -10]} speed={0.12} opacity={0.5} segments={12} color="#eed9bd" bounce={0.4} concentration={0.5} />
      <Cloud position={[-12, 0.8, 12]} speed={0.08} opacity={0.5} segments={12} color="#eed9bd" bounce={0.2} concentration={0.5} />
      <Cloud position={[15, 3, -15]} speed={0.18} opacity={0.5} segments={12} color="#eed9bd" bounce={0.3} concentration={0.5} />
      <Cloud position={[-5, 2.5, 8]} speed={0.1} opacity={0.5} segments={12} color="#eed9bd" bounce={0.4} concentration={0.5} />
      <Cloud position={[5, 1.5, -20]} speed={0.13} opacity={0.5} segments={12} color="#eed9bd" bounce={0.3} concentration={0.5} />
    </group>
  )
}

function IslandController() {
  const scroll = useScroll()
  const ref = useRef()

  useFrame(() => {
    if (!ref.current) return
    const t = scroll.offset
    // Appear during Scene 4 arrival (0.75 - 0.88)
    const visibility = t > 0.75 ? THREE.MathUtils.smoothstep(t, 0.75, 0.88) : 0
    ref.current.scale.setScalar(visibility * 0.2) // Much smaller scale
    ref.current.visible = visibility > 0
  })

  return <Island ref={ref} position={[0, 0.5, -2.2]} rotation={[0, 0, 0]} />
}

export default function App() {
  return (
    <>
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[20, 20, 20]} fov={25} onUpdate={c => c.lookAt(0, 0, 0)} />

        <color attach="background" args={['#eed9bd']} />

        <ambientLight intensity={0.8} />
        <Environment preset="city" environmentIntensity={0.5} />

        <ScrollControls pages={5} damping={0.25}>
          <FogController />
          <MovingClouds />
          <CameraController />
          <LightingController />

          <Float speed={2} rotationIntensity={0} floatIntensity={0}>
            <group position={[0, 0, 0]}>
              <Sea />
              <Ship />
              <IslandController />
              <Birds count={8} />
              <Letter />
            </group>
          </Float>

          <Scroll html>
            <Overlay />
          </Scroll>
        </ScrollControls>

        <EffectComposer disableNormalPass>
        </EffectComposer>
      </Canvas>
    </>
  )
}
