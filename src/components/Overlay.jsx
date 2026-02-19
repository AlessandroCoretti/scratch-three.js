import { useScroll } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useState } from 'react'

const Section = (props) => {
    return (
        <section
            style={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                // Always align left
                alignItems: 'flex-start',
                paddingLeft: '10vw', // Fixed left padding
                paddingRight: '5vw',
            }}>
            <div style={{ textAlign: 'left' }}>
                <h1 style={{
                    fontSize: '6vw',
                    margin: 0,
                    lineHeight: '0.8em',
                    textTransform: 'uppercase',
                    letterSpacing: '-0.02em',
                    fontWeight: 'normal',
                    fontFamily: 'Georgia, serif',
                    color: '#2b2b2b'
                }}>
                    {props.title}
                </h1>
                <p style={{
                    fontSize: '1.2vw',
                    marginTop: '2em',
                    lineHeight: '1.6em',
                    opacity: 0.8,
                    maxWidth: '400px',
                    marginLeft: 0, // Always 0
                    fontFamily: 'Georgia, serif',
                    fontStyle: 'italic',
                    color: '#444444'
                }}>
                    {props.description}
                </p>
            </div>
        </section>
    )
}

export default function Overlay() {
    return (
        // Restrict entire overlay to Left 50% of screen
        <div style={{ width: '50vw', fontFamily: 'Georgia, serif' }}>
            <Section
                title="The Sketch"
                description="A conceptual draft of the digital ocean. Hand-drawn using Three.js lines."
            />
            {/* Removed 'right' prop to enforce consistency */}
            <Section
                title="Wireframe"
                description="The underlying structure of the virtual waves, exposed on paper."
            />
            <Section
                title="Blueprint"
                description="Technical specifications of the procedural generation algorithms."
            />
        </div>
    )
}
