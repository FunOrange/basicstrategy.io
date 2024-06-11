import { type Card, Rank, Suit } from '@/types/blackjack-analyzer-rs';
import { rankToString } from '@/utils/blackjack-utils';
import { cn } from '@/utils/css';
import { match } from 'ts-pattern';

export interface CardProps {
  card: Card;
  sideways?: boolean;
}
export default function Card({ card, sideways }: CardProps) {
  if (card.face_down) {
    return (
      <div
        className={cn(
          'select-none',
          'border rounded shadow w-[114px] h-[156px] bg-gray-50',
          'grid grid-cols-[10px_1fr_10px] gap-x-2 overflow-hidden',
        )}
      >
        <div
          className='text-[200px] leading-[156px] mt-[-3px] text-[#2a2a6f]'
          style={{
            transform: 'scaleX(1.18)',
            marginLeft: '-18px',
          }}
        >
          🂠
        </div>
      </div>
    );
  }

  const color = match(card.suit)
    .with(Suit.Hearts, Suit.Diamonds, () => 'text-red-600')
    .with(Suit.Clubs, Suit.Spades, () => 'text-black')
    .exhaustive();
  const rankString = rankToString(card.rank);
  const suitString = match(card.suit)
    .with(Suit.Hearts, () => '♥')
    .with(Suit.Diamonds, () => '♦')
    .with(Suit.Clubs, () => '♣')
    .with(Suit.Spades, () => '♠')
    .exhaustive();
  return (
    <div
      className={cn(
        'select-none',
        'p-2 border rounded shadow w-[114px] h-[156px] bg-gray-50',
        'grid grid-cols-[10px_1fr_10px] gap-x-2',
        color,
        sideways && 'rotate-90 origin-center ml-5 mt-[-32px]',
      )}
    >
      <div className='flex flex-col items-center'>
        <span className='leading-[1]'>{rankString}</span>
        <span className='leading-[1]'>{suitString}</span>
      </div>
      {match(card.rank)
        .with(Rank.Ace, () => (
          <div
            className={cn(
              'flex items-center justify-center',
              card.suit === Suit.Spades ? 'text-7xl leading-[66px]' : 'text-3xl',
            )}
          >
            {suitString}
          </div>
        ))
        .with(Rank.Two, () => (
          <div className='grid grid-rows-2 py-1 text-3xl'>
            <div className='flex justify-center'>{suitString}</div>
            <div className='flex justify-center rotate-180'>{suitString}</div>
          </div>
        ))
        .with(Rank.Three, () => (
          <div className='grid grid-rows-3 py-1 text-3xl'>
            <div className='flex justify-center'>{suitString}</div>
            <div className='flex justify-center'>{suitString}</div>
            <div className='flex justify-center rotate-180'>{suitString}</div>
          </div>
        ))
        .with(Rank.Four, () => (
          <div className='grid grid-rows-2 py-1 text-3xl'>
            <div className='flex justify-between'>
              <div>{suitString}</div>
              <div>{suitString}</div>
            </div>
            <div className='flex justify-between rotate-180'>
              <div>{suitString}</div>
              <div>{suitString}</div>
            </div>
          </div>
        ))
        .with(Rank.Five, () => (
          <div className='grid grid-rows-3 py-1 text-3xl'>
            <div className='flex justify-between'>
              <div>{suitString}</div>
              <div>{suitString}</div>
            </div>
            <div className='flex justify-center'>{suitString}</div>
            <div className='flex justify-between rotate-180'>
              <div>{suitString}</div>
              <div>{suitString}</div>
            </div>
          </div>
        ))
        .with(Rank.Six, () => (
          <div className='grid grid-rows-3 py-1 text-3xl'>
            <div className='flex justify-between'>
              <div>{suitString}</div>
              <div>{suitString}</div>
            </div>
            <div className='flex justify-between'>
              <div>{suitString}</div>
              <div>{suitString}</div>
            </div>
            <div className='flex justify-between rotate-180'>
              <div>{suitString}</div>
              <div>{suitString}</div>
            </div>
          </div>
        ))
        .with(Rank.Seven, () => (
          <div className='grid grid-rows-[4fr_4fr_4fr_5fr] py-1 text-3xl'>
            <div className='relative w-full'>
              <div className='absolute flex justify-between w-full'>
                <div>{suitString}</div>
                <div>{suitString}</div>
              </div>
            </div>
            <div className='relative w-full'>
              <div className='absolute flex justify-center w-full'>{suitString}</div>
            </div>
            <div className='relative w-full'>
              <div className='absolute flex justify-between w-full'>
                <div>{suitString}</div>
                <div>{suitString}</div>
              </div>
            </div>
            <div />
            <div className='flex justify-between rotate-180'>
              <div>{suitString}</div>
              <div>{suitString}</div>
            </div>
          </div>
        ))
        .with(Rank.Eight, () => (
          <div className='grid grid-rows-5 pb-3 text-3xl'>
            <div className='relative w-full'>
              <div className='absolute flex justify-between w-full'>
                <div>{suitString}</div>
                <div>{suitString}</div>
              </div>
            </div>
            <div className='relative w-full'>
              <div className='absolute flex justify-center w-full'>{suitString}</div>
            </div>
            <div className='relative w-full'>
              <div className='absolute flex justify-between w-full'>
                <div>{suitString}</div>
                <div>{suitString}</div>
              </div>
            </div>
            <div className='relative w-full'>
              <div className='absolute flex justify-center w-full rotate-180'>
                <div>{suitString}</div>
              </div>
            </div>
            <div className='relative w-full'>
              <div className='absolute flex justify-between w-full rotate-180'>
                <div>{suitString}</div>
                <div>{suitString}</div>
              </div>
            </div>
          </div>
        ))
        .with(Rank.Nine, () => (
          <div className='grid grid-rows-[4fr_5fr_4fr] text-3xl'>
            <div className='flex justify-between'>
              <div>{suitString}</div>
              <div>{suitString}</div>
            </div>
            <div className='grid h-full grid-rows-3 mt-[-10px]'>
              <div className='relative w-full'>
                <div className='absolute flex justify-between w-full'>
                  <div>{suitString}</div>
                  <div>{suitString}</div>
                </div>
              </div>
              <div className='relative w-full'>
                <div className='absolute flex justify-center w-full'>{suitString}</div>
              </div>
              <div className='relative w-full'>
                <div className='absolute flex justify-between w-full'>
                  <div>{suitString}</div>
                  <div>{suitString}</div>
                </div>
              </div>
            </div>
            <div className='flex justify-between rotate-180'>
              <div>{suitString}</div>
              <div>{suitString}</div>
            </div>
          </div>
        ))
        .with(Rank.Ten, () => (
          <div className='grid grid-rows-[1fr_auto_1fr] py-4 text-3xl mt-[-16px]'>
            <div className='grid grid-rows-3'>
              <div className='relative w-full'>
                <div className='absolute flex justify-between w-full'>
                  <div>{suitString}</div>
                  <div>{suitString}</div>
                </div>
              </div>
              <div className='relative w-full'>
                <div className='absolute flex justify-center w-full'>{suitString}</div>
              </div>
              <div className='relative w-full'>
                <div className='absolute flex justify-between w-full'>
                  <div>{suitString}</div>
                  <div>{suitString}</div>
                </div>
              </div>
            </div>

            <div className='h-2' />

            <div className='grid grid-rows-3'>
              <div className='relative w-full'>
                <div className='absolute flex justify-between w-full'>
                  <div>{suitString}</div>
                  <div>{suitString}</div>
                </div>
              </div>
              <div className='relative w-full'>
                <div className='absolute flex justify-center w-full'>{suitString}</div>
              </div>
              <div className='relative w-full'>
                <div className='absolute flex justify-between w-full'>
                  <div>{suitString}</div>
                  <div>{suitString}</div>
                </div>
              </div>
            </div>
          </div>
        ))
        .with(Rank.Jack, () => <div className={cn('flex items-center justify-center text-5xl leading-[66px]')}>🃟</div>)
        .with(Rank.Queen, () => <div className={cn('flex items-center justify-center text-5xl leading-[66px]')}>♕</div>)
        .with(Rank.King, () => <div className={cn('flex items-center justify-center text-5xl leading-[66px]')}>♔</div>)
        .otherwise(() => (
          <div />
        ))}
      <div className='flex flex-col items-center rotate-180'>
        <span className='leading-[1]'>{rankString}</span>
        <span className='leading-[1]'>{suitString}</span>
      </div>
    </div>
  );
}
