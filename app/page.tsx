'use client';
import { CompetitiveMode } from '@/components/CompetitiveMode';
import { TrainingMode } from '@/components/TrainingMode';
import { type BlackjackJsBindings as Blackjack } from '@/types/blackjack-analyzer-rs';
import { Button } from 'antd';
import { useEffect, useState } from 'react';

enum GameMode {
  Competitive = 'Competitive',
  Training = 'Training',
}

export default function Home() {
  const [Blackjack, setBlackjack] = useState<Blackjack>();
  useEffect(() => {
    (async () => {
      const Blackjack = await import('@/local_packages/blackjack-analyzer-rs');
      setBlackjack(Blackjack as any as Blackjack);
    })();
  }, []);

  const [gameMode, setGameMode] = useState<GameMode | undefined>(undefined);

  return (
    <main className='flex items-center justify-center w-screen h-screen'>
      {!gameMode && (
        <div className='grid grid-cols-2 gap-2 max-w-52 w-full'>
          <Button className='h-24' onClick={() => setGameMode(GameMode.Training)}>
            Training
          </Button>
          <Button className='h-24' onClick={() => setGameMode(GameMode.Competitive)}>
            Start game
          </Button>
        </div>
      )}
      {Boolean(Blackjack) && gameMode === GameMode.Competitive && (
        <CompetitiveMode Blackjack={Blackjack!} back={() => setGameMode(undefined)} />
      )}
      {Boolean(Blackjack) && gameMode === GameMode.Training && <TrainingMode Blackjack={Blackjack!} />}
    </main>
  );
}
