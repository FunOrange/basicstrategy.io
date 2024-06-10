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
      {gameMode === undefined && (
        <div className='flex flex-col gap-3'>
          <h1 className='text-4xl font-bold'>basicstrategy.io</h1>
          <p className='max-w-screen-md text-sm'>
            Blackjack has long been a favorite among casino-goers, celebrated for its <b>low house edge (0.5%)</b>.
            Unlike many other casino games, where luck is the predominant factor, Blackjack rewards those who understand
            and apply optimal strategies. By mastering basic Blackjack strategy, you can significantly improve your
            chances of winning and make the most of every hand dealt.
          </p>
          <p className='max-w-screen-md text-sm'>
            Playing Blackjack on this site will force you to follow <b>basic strategy</b>, which is the optimal way to
            play every hand. You will be able to see how your decisions compare to the optimal strategy, and you can use
            this information to improve your game.
          </p>
          <div className='grid grid-cols-2 gap-2 max-w-screen-md w-full'>
            <Button className='h-52' onClick={() => setGameMode(GameMode.Training)}>
              <div className='flex flex-col items-center gap-2'>
                <h3 className='text-xl'>Training</h3>
                <div>Learn basic strategy</div>
              </div>
            </Button>
            <Button className='h-52' onClick={() => setGameMode(GameMode.Competitive)}>
              <div className='flex flex-col items-center gap-2'>
                <h3 className='text-xl'>Start game</h3>
                <div>Play for score and compete on the leaderboards</div>
              </div>
            </Button>
          </div>
        </div>
      )}
      {Boolean(Blackjack) && gameMode === GameMode.Competitive && (
        <CompetitiveMode Blackjack={Blackjack!} back={() => setGameMode(undefined)} />
      )}
      {Boolean(Blackjack) && gameMode === GameMode.Training && (
        <TrainingMode Blackjack={Blackjack!} back={() => setGameMode(undefined)} />
      )}
    </main>
  );
}
