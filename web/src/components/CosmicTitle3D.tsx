import { Canvas } from '@react-three/fiber';
import { Text3D, Center, Float, Environment } from '@react-three/drei';

// You need a font file in your public folder or usually loaded from a URL for Text3D.
// Using a standard google font JSON hosted by standard pmndrs/drei assets or similar.
const FONT_URL = "https://threejs.org/examples/fonts/helvetiker_bold.typeface.json";

function AnimatedText() {
    return (
        <group>
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                <Center top position={[0, 0.5, 0]}>
                    <Text3D
                        font={FONT_URL}
                        size={0.8}
                        height={0.2}
                        curveSegments={12}
                        bevelEnabled
                        bevelThickness={0.02}
                        bevelSize={0.02}
                        bevelOffset={0}
                        bevelSegments={5}
                    >
                        COSMIC
                        <meshStandardMaterial
                            color="#06b6d4" // cyan
                            emissive="#06b6d4"
                            emissiveIntensity={0.2}
                            roughness={0.1}
                            metalness={0.8}
                        />
                    </Text3D>
                </Center>
            </Float>

            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                <Center bottom position={[0, -0.6, 0]}>
                    <Text3D
                        font={FONT_URL}
                        size={0.6}
                        height={0.15}
                        curveSegments={12}
                        bevelEnabled
                        bevelThickness={0.02}
                        bevelSize={0.02}
                        bevelOffset={0}
                        bevelSegments={5}
                    >
                        DATA FUSION
                        <meshStandardMaterial
                            color="#8b5cf6" // purple
                            emissive="#8b5cf6"
                            emissiveIntensity={0.2}
                            roughness={0.1}
                            metalness={0.8}
                        />
                    </Text3D>
                </Center>
            </Float>
        </group>
    );
}

export function CosmicTitle3D() {
    return (
        <div className="w-full h-[300px] pointer-events-none">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                {/* Lighting */}
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <spotLight position={[-10, 10, -10]} intensity={0.5} />

                {/* Environment for shiny reflections */}
                <Environment preset="city" />

                <AnimatedText />
            </Canvas>
        </div>
    );
}
