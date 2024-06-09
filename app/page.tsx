import Home from '@/app/Home';
import { Metadata } from 'next';

export const metadata: Metadata = {
  robots: 'index, follow',
  title: 'basicstrategy.io - Blackjack basic strategy trainer',
  description:
    'Learn basic strategy for Blackjack, the optimal way to play every hand. Play for score and compete on the leaderboards.',
  keywords:
    'blackjack, basic strategy, trainer, learn, practice, improve, game, score, leaderboard, competitive, training, strategy',
  openGraph: {
    siteName: 'basicstrategy.io',
    url: 'https://basicstrategy.io',
    title: 'basicstrategy.io - Blackjack basic strategy trainer',
    description:
      'Learn basic strategy for Blackjack, the optimal way to play every hand. Play for score and compete on the leaderboards.',
  },
};

export default function App() {
  return <Home />;
}
