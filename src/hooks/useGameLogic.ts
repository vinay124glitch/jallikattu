import { useState, useEffect, useCallback, useRef } from "react";
import { useGameSounds } from "./useGameSounds";

interface HumanData {
  id: number;
  position: [number, number, number];
  attached: boolean;
  color: string;
  speed: number;
  rotation: number;
  actionName?: string | null;
  actionId?: number;
}

const HUMAN_COLORS = ["#c0392b", "#2980b9", "#27ae60", "#8e44ad", "#d35400", "#16a085"];
const ARENA_RADIUS = 16;
const WALK_SPEED = 4;
const CHARGE_SPEED = 10;
const ATTACH_DISTANCE = 1.2;
const SHAKE_DURATION = 500;
const GAME_DURATION = 60;
const NUM_HUMANS = 1;
const PLAYER_MAX_STAMINA = 100;
const PLAYER_MAX_HEALTH = 100;
const BULL_MAX_STAMINA = 100;
const DODGE_STAMINA_COST = 30;
const SPRINT_STAMINA_COST = 20; // per second
const STAMINA_REGEN = 15; // per second
const BULL_VISION_RANGE = 12;

type BullState = "IDLE" | "PATROL" | "ALERT" | "CHARGE" | "RECOVER";

export const useGameLogic = () => {
  const [gameState, setGameState] = useState<"menu" | "playing" | "gameover">("menu");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [bullPosition, setBullPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [bullRotation, setBullRotation] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [isCharging, setIsCharging] = useState(false);
  const [humans, setHumans] = useState<HumanData[]>([]);
  const [bullSpeed, setBullSpeed] = useState(0);
  const [actionName, setActionName] = useState<string | null>(null);
  const [actionId, setActionId] = useState(0);
  const [controlledHumanId, setControlledHumanId] = useState<number | null>(null);
  const [bullState, setBullState] = useState<BullState>("IDLE");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");

  // New Professional Features
  const [playerStamina, setPlayerStamina] = useState(PLAYER_MAX_STAMINA);
  const [playerHealth, setPlayerHealth] = useState(PLAYER_MAX_HEALTH);
  const [isDodging, setIsDodging] = useState(false);
  const [bullMood, setBullMood] = useState<"calm" | "alert" | "aggressive" | "furious">("calm");
  const [bullAggression, setBullAggression] = useState(0);
  const [bullStamina, setBullStamina] = useState(BULL_MAX_STAMINA);
  const [cameraShake, setCameraShake] = useState(0);
  const [timeScale, setTimeScale] = useState(1.0);
  const [playerLives, setPlayerLives] = useState(3);

  const keysRef = useRef<Set<string>>(new Set());
  const lastTimeRef = useRef(0);
  const bullPosRef = useRef<[number, number, number]>([0, 0, 0]);
  const bullTargetRef = useRef<number | null>(null); // Id of targeted human
  const attackCooldownRef = useRef(0);
  const dodgeCooldownRef = useRef(0);
  const bullStaminaRef = useRef(BULL_MAX_STAMINA);
  const bullAggressionRef = useRef(0);
  const stepCooldownRef = useRef(0);
  const bullStateTimerRef = useRef(0);
  const bullPatrolTargetRef = useRef<[number, number] | null>(null);
  const prevAttachedRef = useRef<Set<number>>(new Set());
  const humanActionQueueRef = useRef<{ name: string, id: number } | null>(null);
  const deathSequenceRef = useRef(false);

  const sounds = useGameSounds();

  const initHumans = useCallback(() => {
    return Array.from({ length: NUM_HUMANS }, (_, i) => {
      const angle = (i / NUM_HUMANS) * Math.PI * 2;
      return {
        id: i,
        position: [Math.cos(angle) * 10, 0, Math.sin(angle) * 10] as [number, number, number],
        attached: false,
        color: HUMAN_COLORS[i % HUMAN_COLORS.length],
        speed: 2.5 + Math.random() * 2,
        rotation: Math.random() * Math.PI * 2,
      };
    });
  }, []);

  const startGame = useCallback(() => {
    setGameState("playing");
    setScore(0);
    setTimeLeft(GAME_DURATION);
    const initialBullPos: [number, number, number] = [0, 0, 0];
    setBullPosition(initialBullPos);
    bullPosRef.current = initialBullPos;
    setBullRotation(0);
    setBullSpeed(0);
    const initialHumans = initHumans();
    setHumans(initialHumans);
    setControlledHumanId(0); // User controls the first human
    setPlayerStamina(PLAYER_MAX_STAMINA);
    setPlayerHealth(PLAYER_MAX_HEALTH);
    setBullStamina(BULL_MAX_STAMINA);
    bullStaminaRef.current = BULL_MAX_STAMINA;
    setBullMood("calm");
    setBullAggression(0);
    bullAggressionRef.current = 0;
    setIsDodging(false);
    setTimeScale(1.0);
    deathSequenceRef.current = false;
    dodgeCooldownRef.current = 0;
    prevAttachedRef.current = new Set();
    attackCooldownRef.current = 0;
    setBullState("IDLE");
    bullStateTimerRef.current = 3;
    bullPatrolTargetRef.current = null;
    setPlayerLives(3);
    sounds.startGame();
  }, [initHumans, sounds]);

  // Key listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase());

      if (e.key === " " && gameState === "playing" && controlledHumanId !== null && !isDodging && dodgeCooldownRef.current <= 0) {
        e.preventDefault();
        if (playerStamina >= DODGE_STAMINA_COST) {
          setIsDodging(true);
          setPlayerStamina(s => Math.max(0, s - DODGE_STAMINA_COST));
          dodgeCooldownRef.current = 1.0; // 1 second cooldown
          setTimeout(() => setIsDodging(false), 300); // Dodge duration
        }
      }

      const keyToAction: Record<string, string> = {
        '1': 'flying kick',
        '2': 'knee punch',
        '3': 'hurricane kick',
        '4': 'slash',
        '5': 'defeated',
        '6': 'falling',
      };

      if (keyToAction[e.key] && gameState === "playing" && controlledHumanId !== null && !isDodging) {
        humanActionQueueRef.current = { name: keyToAction[e.key], id: Date.now() };
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => keysRef.current.delete(e.key.toLowerCase());

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState, controlledHumanId, playerStamina, isDodging, difficulty]);

  useEffect(() => {
    if (gameState !== "playing") return;

    const loop = (time: number) => {
      let delta = lastTimeRef.current ? (time - lastTimeRef.current) / 1000 : 0.016;
      lastTimeRef.current = time;

      // Apply Slow-Mo TimeScale
      delta *= deathSequenceRef.current ? 0.2 : 1.0;

      // 1. Core State Update
      setHumans((prevHumans) => {
        if (controlledHumanId === null) return prevHumans;

        const keys = keysRef.current;
        let hdx = 0, hdz = 0;
        if (keys.has("arrowup") || keys.has("w")) hdz -= 1;
        if (keys.has("arrowdown") || keys.has("s")) hdz += 1;
        if (keys.has("arrowleft") || keys.has("a")) hdx -= 1;
        if (keys.has("arrowright") || keys.has("d")) hdx += 1;

        // Calculate Human Movements
        const actionToApply = humanActionQueueRef.current;
        humanActionQueueRef.current = null;

        if (actionToApply && controlledHumanId !== null) {
          const attackMoves = ['flying kick', 'knee punch', 'hurricane kick', 'slash'];
          if (attackMoves.includes(actionToApply.name)) {
            const player = prevHumans.find(h => h.id === controlledHumanId);
            if (player) {
              const bdx = player.position[0] - bullPosRef.current[0];
              const bdz = player.position[2] - bullPosRef.current[2];
              const dist = Math.sqrt(bdx * bdx + bdz * bdz);
              if (dist < 4.5) {
                bullStaminaRef.current -= 15; // Decreased human attack damage from 25
                setCameraShake(0.5);
                sounds.playShakeOff();
                if (bullStaminaRef.current <= 0) {
                  setBullState("RECOVER");
                  setIsCharging(false);
                  bullStateTimerRef.current = 5;
                }
              }
            }
          }
        }

        const updatedHumans = prevHumans.map((h) => {
          if (h.id === controlledHumanId) {
            if (h.attached) return h;

            const isSprinting = keys.has("shift") && playerStamina > 0 && (hdx !== 0 || hdz !== 0);
            if (isSprinting) {
              setPlayerStamina(s => Math.max(0, s - SPRINT_STAMINA_COST * delta));
            } else {
              setPlayerStamina(s => Math.min(PLAYER_MAX_STAMINA, s + STAMINA_REGEN * delta));
            }

            if (hdx !== 0 || hdz !== 0 || isDodging) {
              const len = Math.sqrt(hdx * hdx + hdz * hdz) || 1;
              let moveSpeed = isSprinting ? 7 : 5;
              if (isDodging) moveSpeed = 15;

              const nx = h.position[0] + (hdx / len) * moveSpeed * delta;
              const nz = h.position[2] + (hdz / len) * moveSpeed * delta;
              const dist = Math.sqrt(nx * nx + nz * nz);
              if (dist < ARENA_RADIUS) {
                return {
                  ...h,
                  actionName: actionToApply ? actionToApply.name : h.actionName,
                  actionId: actionToApply ? actionToApply.id : h.actionId,
                  position: [nx, 0, nz] as [number, number, number],
                  rotation: Math.atan2(hdx, hdz),
                };
              }
            }
            return {
              ...h,
              actionName: actionToApply ? actionToApply.name : h.actionName,
              actionId: actionToApply ? actionToApply.id : h.actionId,
            };
          } else {
            if (h.attached) return h;
            const bdx = h.position[0] - bullPosRef.current[0];
            const bdz = h.position[2] - bullPosRef.current[2];
            const dist = Math.sqrt(bdx * bdx + bdz * bdz);
            if (dist < 8) {
              const speed = h.speed * delta;
              const nvx = (bdx / dist);
              const nvz = (bdz / dist);
              const nx = h.position[0] + nvx * speed;
              const nz = h.position[2] + nvz * speed;
              const adist = Math.sqrt(nx * nx + nz * nz);
              if (adist < ARENA_RADIUS) {
                return {
                  ...h,
                  position: [nx, 0, nz] as [number, number, number],
                  rotation: Math.atan2(nvx, nvz),
                };
              }
            }
          }
          return h;
        });

        // 2. Bull AI State Machine Logic
        bullStateTimerRef.current -= delta;

        const diffMult = difficulty === "easy" ? 0.7 : (difficulty === "hard" ? 1.4 : 1.0);
        const aggroMult = difficulty === "easy" ? 0.5 : (difficulty === "hard" ? 1.5 : 1.0);

        let targetX = bullPosRef.current[0];
        let targetZ = bullPosRef.current[2];
        let currentMoveSpeed = 0;
        let shouldTurn = false;

        const available = updatedHumans.filter(h => !h.attached);
        let nearestHuman: HumanData | null = null;
        let minDist = BULL_VISION_RANGE;

        available.forEach(h => {
          const dx = h.position[0] - bullPosRef.current[0];
          const dz = h.position[2] - bullPosRef.current[2];
          const d = Math.sqrt(dx * dx + dz * dz);
          if (d < minDist) {
            minDist = d;
            nearestHuman = h;
          }
        });

        switch (bullState) {
          case "IDLE":
            currentMoveSpeed = 0;
            if (nearestHuman && (minDist < 6 || bullAggressionRef.current > 40)) {
              setBullState("ALERT");
              bullStateTimerRef.current = 2;
              bullTargetRef.current = nearestHuman.id;
            } else if (bullStateTimerRef.current <= 0) {
              setBullState("PATROL");
              bullStateTimerRef.current = 4 + Math.random() * 4;
              const angle = Math.random() * Math.PI * 2;
              const r = Math.random() * (ARENA_RADIUS - 4);
              bullPatrolTargetRef.current = [Math.cos(angle) * r, Math.sin(angle) * r];
            }
            break;

          case "PATROL":
            currentMoveSpeed = WALK_SPEED * diffMult;
            if (bullPatrolTargetRef.current) {
              const dx = bullPatrolTargetRef.current[0] - bullPosRef.current[0];
              const dz = bullPatrolTargetRef.current[1] - bullPosRef.current[2];
              const d = Math.sqrt(dx * dx + dz * dz);
              if (d < 1 || bullStateTimerRef.current <= 0) {
                setBullState("IDLE");
                bullStateTimerRef.current = 2 + Math.random() * 3;
                bullPatrolTargetRef.current = null;
              } else {
                targetX = bullPatrolTargetRef.current[0];
                targetZ = bullPatrolTargetRef.current[1];
                shouldTurn = true;
              }
            }
            if (nearestHuman && minDist < 8) {
              setBullState("ALERT");
              bullStateTimerRef.current = 1.5;
              bullTargetRef.current = nearestHuman.id;
            }
            break;

          case "ALERT":
            currentMoveSpeed = 0;
            shouldTurn = true;
            if (nearestHuman) {
              bullTargetRef.current = nearestHuman.id;
              targetX = nearestHuman.position[0];
              targetZ = nearestHuman.position[2];
            }
            if (bullStateTimerRef.current <= 0) {
              if (nearestHuman) {
                setBullState("CHARGE");
                setIsCharging(true);
                setCameraShake(0.6);
                bullStateTimerRef.current = 5;
              } else {
                setBullState("IDLE");
                bullStateTimerRef.current = 2;
              }
            }
            break;

          case "CHARGE":
            const chargeTarget = updatedHumans.find(h => h.id === bullTargetRef.current);
            if (!chargeTarget || chargeTarget.attached || bullStaminaRef.current <= 0) {
              setBullState("RECOVER");
              setIsCharging(false);
              bullStateTimerRef.current = 3;
            } else {
              targetX = chargeTarget.position[0];
              targetZ = chargeTarget.position[2];
              const dx = targetX - bullPosRef.current[0];
              const dz = targetZ - bullPosRef.current[2];
              const d = Math.sqrt(dx * dx + dz * dz);
              currentMoveSpeed = CHARGE_SPEED * diffMult * (bullMood === "furious" ? 1.45 : 1.1); // Buffed speeds
              shouldTurn = true;
              if (d < 1.5) {
                setBullState("RECOVER");
                setIsCharging(false);
                bullStateTimerRef.current = 4;
                setCameraShake(0.4);
              } else if (bullStateTimerRef.current <= 0) {
                setBullState("RECOVER");
                setIsCharging(false);
                bullStateTimerRef.current = 3;
              }
            }
            break;

          case "RECOVER":
            currentMoveSpeed = WALK_SPEED * 0.5 * diffMult;
            shouldTurn = false;
            if (bullStateTimerRef.current <= 0) {
              setBullState("PATROL");
              bullStateTimerRef.current = 3;
            }
            break;
        }

        // Apply Rotation and Movement
        if (shouldTurn) {
          const tdx = targetX - bullPosRef.current[0];
          const tdz = targetZ - bullPosRef.current[2];
          const targetRotation = Math.atan2(tdx, tdz);
          let rotDiff = targetRotation - bullRotation;
          while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
          while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
          // Increased turn multipliers for a more reactive bull
          const turnMult = bullMood === "furious" ? 8 : (bullMood === "aggressive" ? 6 : 5);
          const newRotation = bullRotation + rotDiff * delta * turnMult;
          setBullRotation(newRotation);
        }

        if (currentMoveSpeed > 0) {
          const nx = bullPosRef.current[0] + Math.sin(bullRotation) * currentMoveSpeed * delta;
          const nz = bullPosRef.current[2] + Math.cos(bullRotation) * currentMoveSpeed * delta;
          const bDist = Math.sqrt(nx * nx + nz * nz);
          if (bDist < ARENA_RADIUS) {
            bullPosRef.current = [nx, 0, nz];
            setBullPosition([nx, 0, nz]);
            setBullSpeed(currentMoveSpeed);
            stepCooldownRef.current -= delta;
            if (stepCooldownRef.current <= 0) {
              sounds.playStep();
              stepCooldownRef.current = isCharging ? 0.15 : 0.4;
            }
          } else if (bullState === "CHARGE") {
            setBullState("RECOVER");
            setIsCharging(false);
            bullStateTimerRef.current = 3;
            setCameraShake(0.6);
            setBullSpeed(0);
          } else {
            setBullSpeed(0);
          }
        } else {
          setBullSpeed(0);
        }

        // Common Aggression & Stamina
        const tDist = nearestHuman ? minDist : 100;
        bullAggressionRef.current += delta * 2.5 * aggroMult; // Faster aggression gain
        if (tDist < 5) bullAggressionRef.current += delta * 15 * aggroMult;
        if (isCharging) {
          bullStaminaRef.current -= delta * 15;
        } else if (bullState === "IDLE" || bullState === "RECOVER") {
          bullStaminaRef.current += delta * 12;
        } else {
          bullStaminaRef.current += delta * 2;
        }
        bullStaminaRef.current = Math.max(0, Math.min(BULL_MAX_STAMINA, bullStaminaRef.current));
        setBullStamina(bullStaminaRef.current);

        const agg = bullAggressionRef.current;
        let mood: "calm" | "alert" | "aggressive" | "furious" = "calm";
        if (agg > 80) mood = "furious";
        else if (agg > 50) mood = "aggressive";
        else if (agg > 20) mood = "alert";
        setBullMood(mood);
        setBullAggression(agg);

        attackCooldownRef.current -= delta;
        if (nearestHuman && tDist < 3 && attackCooldownRef.current <= 0) {
          setActionName(Math.random() > 0.7 ? "BACK KICK" : "Bull_game_rig|Action");
          setActionId(id => id + 1);
          attackCooldownRef.current = 2.0 + Math.random() * 2;
          if (Math.random() > 0.7) {
            setIsShaking(true);
            sounds.playShakeOff();
            setCameraShake(0.4);
            setTimeout(() => setIsShaking(false), SHAKE_DURATION);
          }
        }

        // Collision Check & Attach
        const targetId = bullTargetRef.current;
        return updatedHumans.map(h => {
          if (isShaking && h.attached) {
            const angle = Math.random() * Math.PI * 2;
            return {
              ...h,
              attached: false,
              position: [bullPosRef.current[0] + Math.cos(angle) * 3, 0, bullPosRef.current[2] + Math.sin(angle) * 3] as [number, number, number],
            };
          }
          if (targetId !== null && h.id === targetId && tDist < ATTACH_DISTANCE && !isDodging) {
            if (h.id === controlledHumanId) {
              // Bull hits player — increased damage for high strength
              const damage = isCharging ? 40 : 25;
              setPlayerHealth(prev => {
                const newHealth = Math.max(0, prev - damage);
                if (newHealth <= 0 && !deathSequenceRef.current) {
                  deathSequenceRef.current = true;
                  setTimeScale(0.25);
                  setCameraShake(1.2);
                  sounds.playGameOver();

                  const nextLives = playerLives - 1;
                  setPlayerLives(nextLives);

                  if (nextLives <= 0) {
                    setTimeout(() => {
                      setGameState("gameover");
                      setScore(Math.floor(GAME_DURATION - timeLeft));
                      setTimeScale(1.0);
                    }, 2500);
                  } else {
                    // Respawn sequence
                    setTimeout(() => {
                      deathSequenceRef.current = false;
                      setPlayerHealth(PLAYER_MAX_HEALTH);
                      setTimeScale(1.0);
                      setHumans(prevH => prevH.map(hum => {
                        if (hum.id === controlledHumanId) {
                          const angle = Math.random() * Math.PI * 2;
                          return {
                            ...hum,
                            attached: false,
                            position: [Math.cos(angle) * 12, 0, Math.sin(angle) * 12] as [number, number, number],
                          };
                        }
                        return hum;
                      }));
                    }, 2500);
                  }
                }
                return newHealth;
              });

              if (playerHealth - damage <= 0) {
                return { ...h, attached: true }; // Trigger Dying.fbx
              }

              setCameraShake(0.8);
              return h;
            } else {
              return { ...h, attached: true };
            }
          }
          return h;
        });
      });

      setCameraShake(s => Math.max(0, s - delta * 2));
      dodgeCooldownRef.current -= delta;
      frameRef.current = requestAnimationFrame(loop);
    };

    const frameRef = { current: requestAnimationFrame(loop) };
    return () => cancelAnimationFrame(frameRef.current);
  }, [gameState, controlledHumanId, sounds, isDodging, bullRotation, isCharging, bullMood, timeLeft, bullState, playerStamina, difficulty, playerLives]);

  // Timer
  useEffect(() => {
    if (gameState !== "playing") return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setGameState("gameover");
          setScore(GAME_DURATION);
          sounds.playGameOver();
          sounds.stopAmbient();
          return 0;
        }
        setScore(GAME_DURATION - (t - 1));
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState, sounds]);

  const attachedCount = humans.filter((h) => h.attached).length;

  return {
    gameState,
    score,
    timeLeft,
    bullPosition,
    bullRotation,
    isShaking,
    isCharging,
    bullSpeed,
    actionName,
    actionId,
    humans,
    attachedCount,
    playerStamina,
    playerHealth,
    bullMood,
    bullStamina,
    cameraShake,
    isDodging,
    timeScale,
    playerLives,
    bullState,
    difficulty,
    setDifficulty,
    startGame,
  };
};
