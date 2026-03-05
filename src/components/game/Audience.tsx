import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useFBX, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";

interface AudienceMemberProps {
    position: [number, number, number];
    rotation: number;
    color: string;
    animationPath: string;
}

const AudienceMember = ({ position, rotation, color, animationPath }: AudienceMemberProps) => {
    // Load the animation FBX
    const danceFbx = useFBX(animationPath) as any;

    // Clone model for unique instance
    const model = useMemo(() => SkeletonUtils.clone(danceFbx), [danceFbx]);

    // Animation clips
    const animations = useMemo(() => {
        const clips = [danceFbx.animations[0].clone()];
        clips[0].name = "dance";
        return clips;
    }, [danceFbx]);

    const { actions } = useAnimations(animations, model as any);

    // Apply color and settings
    useEffect(() => {
        model.traverse((child: any) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                if (child.material) {
                    child.material = child.material.clone();
                    const name = child.material.name.toLowerCase();
                    if (name.includes("body") || name.includes("shirt") || name.includes("clothes") || name.includes("mat")) {
                        child.material.color.set(color);
                    }
                }
            }
        });
    }, [model, color]);

    useEffect(() => {
        if (actions.dance) {
            actions.dance.play();
            // Randomize start time for organic look
            actions.dance.time = Math.random() * actions.dance.getClip().duration;
        }
    }, [actions]);

    return (
        <group position={position} rotation={[0, rotation, 0]}>
            <primitive object={model} scale={[0.015, 0.015, 0.015]} />
        </group>
    );
};

const DANCE_MODELS = [
    "/models/Dancing Twerk.fbx",
    "/models/Silly Dancing.fbx",
    "/models/Idle.fbx"
];
const HUMAN_COLORS = [
    "#c0392b", "#2980b9", "#27ae60", "#8e44ad", "#d35400",
    "#16a085", "#f1c40f", "#2c3e50", "#7f8c8d", "#e67e22",
    "#e74c3c", "#3498db"
];

const Banner = ({ position, rotation, color }: { position: [number, number, number], rotation: number, color: string }) => {
    return (
        <group position={position} rotation={[0, rotation, 0.1]}>
            <mesh position={[0, 1.5, 0]} castShadow>
                <boxGeometry args={[0.05, 3, 0.05]} />
                <meshStandardMaterial color="#3d2b1f" />
            </mesh>
            <mesh position={[0.4, 2.5, 0]} castShadow>
                <boxGeometry args={[0.8, 1.2, 0.05]} />
                <meshStandardMaterial color={color} />
            </mesh>
        </group>
    );
};

const Audience = () => {
    const tieredMembers = useMemo(() => {
        const members = [];

        // Ring 1: Near the fence (Dense)
        const count1 = 80;
        const radius1 = 19.3;
        for (let i = 0; i < count1; i++) {
            const angle = (i / count1) * Math.PI * 2;
            members.push({
                id: `r1-${i}`,
                position: [Math.cos(angle) * radius1, 0, Math.sin(angle) * radius1] as [number, number, number],
                rotation: -angle + Math.PI,
                color: HUMAN_COLORS[Math.floor(Math.random() * HUMAN_COLORS.length)],
                animationPath: DANCE_MODELS[Math.floor(Math.random() * DANCE_MODELS.length)]
            });
        }

        // Ring 2: Slightly back and higher
        const count2 = 100;
        const radius2 = 20.8;
        for (let i = 0; i < count2; i++) {
            const angle = (i / count2) * Math.PI * 2 + 0.03;
            members.push({
                id: `r2-${i}`,
                position: [Math.cos(angle) * radius2, 0.6, Math.sin(angle) * radius2] as [number, number, number],
                rotation: -angle + Math.PI,
                color: HUMAN_COLORS[Math.floor(Math.random() * HUMAN_COLORS.length)],
                animationPath: DANCE_MODELS[Math.floor(Math.random() * DANCE_MODELS.length)]
            });
        }

        // Ring 3: Further back and higher
        const count3 = 120;
        const radius3 = 22.4;
        for (let i = 0; i < count3; i++) {
            const angle = (i / count3) * Math.PI * 2 - 0.02;
            members.push({
                id: `r3-${i}`,
                position: [Math.cos(angle) * radius3, 1.25, Math.sin(angle) * radius3] as [number, number, number],
                rotation: -angle + Math.PI,
                color: HUMAN_COLORS[Math.floor(Math.random() * HUMAN_COLORS.length)],
                animationPath: DANCE_MODELS[Math.floor(Math.random() * DANCE_MODELS.length)]
            });
        }

        return members;
    }, []);

    const banners = useMemo(() => {
        const count = 12;
        return Array.from({ length: count }).map((_, i) => {
            const angle = (i / count) * Math.PI * 2;
            const r = 24.5;
            return {
                id: `banner-${i}`,
                position: [Math.cos(angle) * r, 0, Math.sin(angle) * r] as [number, number, number],
                rotation: -angle + Math.PI / 2,
                color: HUMAN_COLORS[i % HUMAN_COLORS.length]
            };
        });
    }, []);

    return (
        <group>
            {/* Background Tier Platform - Concrete Ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
                <ringGeometry args={[18.5, 26, 64]} />
                <meshStandardMaterial color="#2d2d2d" roughness={0.8} />
            </mesh>

            {/* Tier Supports */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.3, 0]}>
                <ringGeometry args={[20.1, 26, 64]} />
                <meshStandardMaterial color="#3d3d3d" roughness={0.9} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.9, 0]}>
                <ringGeometry args={[21.7, 26, 64]} />
                <meshStandardMaterial color="#4d4d4d" roughness={0.9} />
            </mesh>

            {tieredMembers.map((member) => (
                <AudienceMember key={member.id} {...member} />
            ))}

            {banners.map(b => (
                <Banner key={b.id} {...b} />
            ))}
        </group>
    );
};

// Preload to avoid pop-in
DANCE_MODELS.forEach(path => useFBX.preload(path));

export default Audience;
