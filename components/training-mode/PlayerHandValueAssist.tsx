'use client';
import { HandValue } from '@/types/blackjack-analyzer-js-bindings';
import { Tag, TagProps } from 'antd';
import { match } from 'ts-pattern';

export interface PlayerHandValueAssistProps {
  playerHandValue: HandValue;
}
export function PlayerHandValueAssist({ playerHandValue }: PlayerHandValueAssistProps) {
  const color: TagProps['color'] = match(playerHandValue)
    .with({ kind: 'Hard' }, (hand) =>
      hand.value <= 2
        ? undefined
        : [9, 10, 11].includes(hand.value)
        ? 'green'
        : [12, 13, 14, 15, 16].includes(hand.value)
        ? 'yellow'
        : hand.value >= 17
        ? 'red'
        : undefined,
    )
    .with({ kind: 'Soft', value: 19 }, () => 'red')
    .with({ kind: 'Soft', value: 20 }, () => 'red')
    .with({ kind: 'Blackjack' }, () => 'warning')
    .otherwise(() => 'gray');
  return (
    <Tag color={color}>
      {match(playerHandValue)
        .with({ kind: 'Hard' }, (hand) => hand.value)
        .with({ kind: 'Soft' }, (hand) => `${hand.value - 10}/${hand.value}`)
        .with({ kind: 'Blackjack' }, () => 'Blackjack')
        .otherwise(() => undefined)}
    </Tag>
  );
}
