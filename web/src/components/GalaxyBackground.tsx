import { useRef, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

export function GalaxyBackground() {
    return (
        <div className="absolute inset-0 -z-10 bg-cosmic-900 pointer-events-none">
            <Canvas camera={{ position: [0, 6, 8], fov: 60 }}>
                <MilkyWay />
                {/* Add some ambient stars for depth */}
                <Stars />
            </Canvas>
        </div>
    )
}

function MilkyWay(props: any) {
    const ref = useRef<any>(null)

    // Generate Spiral Galaxy Particles
    const particles = useMemo(() => {
        const count = 8000; // Number of stars
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        const galaxyColorInside = new THREE.Color('#ff6030'); // Orange/Red center
        const galaxyColorOutside = new THREE.Color('#1b3984'); // Blue arms

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;

            // Radius
            const radius = Math.random() * 5 + 0.5; // Avoid center hole
            // Spin angle (spiral effect)
            const spinAngle = radius * 3;
            // Branch angle (3 arms)
            const branchAngle = (i % 3) * ((Math.PI * 2) / 3);

            // Randomness
            const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5 * radius;
            const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5 * radius;
            const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5 * radius;

            positions[i3 + 0] = Math.cos(branchAngle + spinAngle) * radius + randomX; // x
            positions[i3 + 1] = randomY * 0.5; // y (flattened disk)
            positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ; // z (using z as depth in horizontal plane for this formula, but standard threejs y is up. Let's map to x, z plane)

            // Color mix
            const mixedColor = galaxyColorInside.clone();
            mixedColor.lerp(galaxyColorOutside, radius / 5);

            colors[i3 + 0] = mixedColor.r;
            colors[i3 + 1] = mixedColor.g;
            colors[i3 + 2] = mixedColor.b;
        }

        return { positions, colors };
    }, []);

    useFrame((state, delta) => {
        if (ref.current) {
            // Rotate the entire galaxy
            ref.current.rotation.y += delta * 0.05;
        }
    })

    return (
        <group rotation={[Math.PI / 6, 0, 0]} {...props}>
            <points ref={ref}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={particles.positions.length / 3}
                        array={particles.positions}
                        itemSize={3}
                        args={[particles.positions, 3]}
                    />
                    <bufferAttribute
                        attach="attributes-color"
                        count={particles.colors.length / 3}
                        array={particles.colors}
                        itemSize={3}
                        args={[particles.colors, 3]}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.03}
                    sizeAttenuation={true}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                    vertexColors={true}
                    transparent={true}
                    opacity={0.8}
                />
            </points>
        </group>
    )
}

function Stars() {
    const ref = useRef<any>(null)
    // Simple background stars
    const points = useMemo(() => {
        const count = 2000;
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 40; // Wide spread
        }
        return positions;
    }, [])

    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.y -= delta * 0.01;
        }
    })

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={points.length / 3}
                    array={points}
                    itemSize={3}
                    args={[points, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.02}
                color="#ffffff"
                sizeAttenuation={true}
                depthWrite={false}
                transparent
                opacity={0.4}
            />
        </points>
    )
}
