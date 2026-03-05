import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface DustEffectProps {
    active: boolean;
    position: [number, number, number];
    intensity?: number;
}

const DustEffect = ({ active, position, intensity = 1 }: DustEffectProps) => {
    const count = 20;
    const meshRef = useRef<THREE.InstancedMesh>(null);

    // Create particle data
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            temp.push({
                t: Math.random() * 2, // Lifetime offset
                speed: 0.5 + Math.random() * 0.5,
                x: (Math.random() - 0.5) * 1.5,
                z: (Math.random() - 0.5) * 1.5,
                scale: 0.1 + Math.random() * 0.3
            });
        }
        return temp;
    }, []);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame((_, delta) => {
        if (!meshRef.current) return;

        particles.forEach((p, i) => {
            if (active) {
                p.t += delta * p.speed;
                if (p.t > 1) {
                    p.t = 0;
                    // Reset position to be behind the source
                    p.x = (Math.random() - 0.5) * 1.0;
                    p.z = (Math.random() - 0.5) * 1.0;
                }
            } else {
                p.t = Math.min(1, p.t + delta); // Fade out
            }

            const s = p.scale * (1 - p.t); // Shrink over time
            dummy.scale.set(s, s, s);
            dummy.position.set(p.x, p.t * 0.8, p.z); // Rise up
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
        });

        meshRef.current.instanceMatrix.needsUpdate = true;
        meshRef.current.position.set(position[0], position[1], position[2]);
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial
                color="#b89a5a"
                transparent
                opacity={0.3}
                roughness={1}
                depthWrite={false}
            />
        </instancedMesh>
    );
};

export default DustEffect;
