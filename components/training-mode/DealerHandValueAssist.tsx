'use client';
import { HandValue } from '@/types/blackjack-analyzer-js-bindings';
import { Tag, TagProps } from 'antd';
import { match } from 'ts-pattern';
export interface DealerHandValueAssistProps {
  dealerHandValue: HandValue;
}
export default function DealerHandValueAssist({ dealerHandValue }: DealerHandValueAssistProps) {
  const color: TagProps['color'] = match(dealerHandValue)
    .with({ kind: 'Hard' }, (hand) =>
      hand.value === 2
        ? 'blue'
        : hand.value === 3
        ? 'cyan'
        : hand.value === 4
        ? 'lime'
        : [5, 6].includes(hand.value)
        ? 'green'
        : [7, 8, 9].includes(hand.value)
        ? undefined
        : hand.value === 10
        ? 'red'
        : undefined,
    )
    .with({ kind: 'Soft', value: 11 }, () => 'magenta')
    .with({ kind: 'Blackjack' }, () => 'warning')
    .otherwise(() => 'gray');
  return (
    <Tag color={color}>
      {match(dealerHandValue)
        .with({ kind: 'Hard' }, (hand) => hand.value)
        .with({ kind: 'Soft' }, (hand) => hand.value)
        .with({ kind: 'Blackjack' }, () => 'Blackjack')
        .otherwise(() => undefined)}
    </Tag>
  );
}
