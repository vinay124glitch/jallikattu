import GameScene from "@/components/game/GameScene";
import GameHUD from "@/components/game/GameHUD";
import { useGameLogic } from "@/hooks/useGameLogic";

const Index = () => {
  const {
    gameState,
    score,
    timeLeft,
    bullPosition,
    bullRotation,
    isShaking,
    humans,
    attachedCount,
    isCharging,
    bullSpeed,
    actionName,
    actionId,
    playerStamina,
    bullMood,
    bullStamina,
    cameraShake,
    bullState,
    difficulty,
    setDifficulty,
    playerHealth,
    playerLives,
    timeScale,
    startGame,
  } = useGameLogic();

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-background">
      <GameHUD
        score={score}
        timeLeft={timeLeft}
        attachedCount={attachedCount}
        totalHumans={humans.length}
        playerStamina={playerStamina}
        bullStamina={bullStamina}
        bullMood={bullMood}
        gameState={gameState}
        onStart={startGame}
        onRestart={startGame}
        bullState={bullState}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        playerHealth={playerHealth}
        playerLives={playerLives}
      />
      <GameScene
        bullPosition={bullPosition}
        bullRotation={bullRotation}
        isShaking={isShaking}
        humans={humans}
        gameState={gameState}
        isCharging={isCharging}
        bullSpeed={bullSpeed}
        actionName={actionName}
        actionId={actionId}
        cameraShake={cameraShake}
        bullMood={bullMood}
        bullState={bullState}
        isDying={timeScale < 0.5}
      />
    </div>
  );
};

export default Index;
