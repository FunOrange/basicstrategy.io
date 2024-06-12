'use client';
import BarGraph from '@/components/BarGraph';
import Card from '@/components/Card';
import FadeOut from '@/components/abstract/FadeOut';
import { getHint, getHintDetails } from '@/constants/blackjack-hints';
import { rules } from '@/constants/blackjack-rules';
import useGameAudio from '@/hooks/useGameAudio';
import {
  GameState,
  PlayerAction,
  type BlackjackJsBindings as Blackjack,
  type BlackjackState,
  Rank,
} from '@/types/blackjack-analyzer-js-bindings';
import { handOutcomeToString, playerActionToString, rankToNumber, rankToString } from '@/utils/blackjack-utils';
import { cn } from '@/utils/css';
import { sleep } from '@/utils/time';
import { Button, ButtonProps, Tag, TagProps, Tooltip } from 'antd';
import Image from 'next/image';
import { sum } from 'ramda';
import { useEffect, useMemo, useState } from 'react';
import { Pattern, isMatching, match } from 'ts-pattern';

const GAME_TICK_MS = 260;

export interface TrainingModeProps {
  Blackjack: Blackjack;
  back: () => void;
}
export function TrainingMode({ Blackjack, back }: TrainingModeProps) {
  const play = useGameAudio();
  const [game, setGame] = useState<BlackjackState>();
  const [allowedActions, setAllowedActions] = useState<PlayerAction[]>([]);

  // #region player feedback
  const [lastDecision, setLastDecision] = useState<{ correct: boolean; correctMove: PlayerAction } | undefined>(
    undefined,
  );
  useEffect(() => {
    const timeout = setTimeout(() => {
      setLastDecision(undefined);
    }, 1500);
    return () => clearTimeout(timeout);
  }, [lastDecision]);

  const [showingHint, setShowingHint] = useState(false);
  const hint = useMemo(() => {
    if (game?.state === GameState.PlayerTurn) {
      const hintEnum = getHint(Blackjack, game);
      console.debug('hintEnum', hintEnum);
      return getHintDetails(hintEnum);
    } else {
      return undefined;
    }
  }, [Blackjack, game]);
  // #endregion player feedback

  const init = () => {
    const bet = 1;
    let game = Blackjack.init_state(bet, rules);
    runUntilPlayerTurn(game);
  };
  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePlayerAction = async (action: PlayerAction) => {
    const correctAction = Blackjack.get_optimal_move(game!);
    const actionIsCorrect = action === correctAction;
    if (action === PlayerAction.Hit) {
      play.dealCard();
    }
    if (actionIsCorrect) {
      play.correct();
    } else {
      play.incorrect();
    }
    setLastDecision({ correct: actionIsCorrect, correctMove: correctAction });
    let _game = Blackjack.next_state(game!, action);
    runUntilPlayerTurn(_game);
  };

  const runUntilPlayerTurn = async (game: BlackjackState) => {
    setGame(game);
    while (![GameState.PlayerTurn, GameState.GameOver].includes(game.state)) {
      await sleep(GAME_TICK_MS);
      console.debug('game.state', game.state);
      if (game.state === GameState.Dealing || game.state === GameState.DealerTurn) {
        play.dealCard();
      }
      game = Blackjack.next_state(game!);
      setGame(game);
    }
    if (game.state === GameState.PlayerTurn) {
      setAllowedActions(Blackjack.get_allowed_actions(game));
    }
  };

  if (game !== undefined) {
    return (
      <div className='flex flex-col py-16 h-full max-h-[860px]'>
        <div className='flex flex-col items-center justify-between h-full'>
          {/* top */}
          <div className='flex flex-col gap-6 items-center'>
            <div className='flex gap-2 min-h-[156px]'>
              {game.dealer_hand.map((card, i) => (
                <Card key={i} card={card} />
              ))}
            </div>
            {(() => {
              const dealerHandValue = Blackjack.get_dealer_hand_value(game);
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
                <Tooltip
                  placement='left'
                  open={showingHint && Boolean(hint?.dealerTooltip)}
                  title={hint?.dealerTooltip}
                >
                  <Tag color={color}>
                    {match(dealerHandValue)
                      .with({ kind: 'Hard' }, (hand) => hand.value)
                      .with({ kind: 'Soft' }, (hand) => hand.value)
                      .with({ kind: 'Blackjack' }, () => 'Blackjack')
                      .otherwise(() => undefined)}
                  </Tag>
                </Tooltip>
              );
            })()}
          </div>
          {/* middle */}
          <div className='text-center text-gray-500'>
            {game.state === GameState.PlayerTurn && lastDecision === undefined && (
              <Tooltip
                color='#ccc'
                trigger='hover'
                title={
                  <div className={`w-[580px] h-[600px]`}>
                    <Image src='/images/TECHOPEDIA-DEALERS-CARD-TABLE.png' fill alt='Basic strategy table' />
                  </div>
                }
                placement='right'
              >
                <Button type='dashed' className='w-full bg-gray-50 text-slate-400 cursor-default text-xs'>
                  Hover to show basic strategy table
                </Button>
              </Tooltip>
            )}
            {game.state === GameState.GameOver &&
              (() => {
                const handOutcomes = Blackjack.get_game_outcome(game);
                if (handOutcomes.length === 1) {
                  const handOutcome = handOutcomes[0];
                  return handOutcomeToString(handOutcome);
                } else if (handOutcomes.length >= 2) {
                  if (handOutcomes.every(isMatching({ kind: 'Surrendered' }))) {
                    return 'Surrendered.';
                  } else {
                    return handOutcomes
                      .map((handOutcome, i) =>
                        match(handOutcome)
                          .with({ kind: 'Won', reason: Pattern.any }, () => `Hand ${i + 1} won!`)
                          .with({ kind: 'Lost', reason: Pattern.any }, () => `Hand ${i + 1} lost.`)
                          .with({ kind: 'Push' }, () => `Hand ${i + 1} push.`)
                          .with({ kind: 'Surrendered' }, () => 'Surrender.')
                          .exhaustive(),
                      )
                      .join(' ');
                  }
                }
              })()}
          </div>
          {/* bottom */}
          <div className='flex flex-col items-center gap-4'>
            {(() => {
              const playerHandValue = Blackjack.get_player_hand_value(game);
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
                <Tooltip
                  title={hint?.playerTooltip}
                  open={showingHint && Boolean(hint?.playerTooltip)}
                  placement='left'
                >
                  <Tag color={color}>
                    {match(playerHandValue)
                      .with({ kind: 'Hard' }, (hand) => hand.value)
                      .with({ kind: 'Soft' }, (hand) => `${hand.value - 10}/${hand.value}`)
                      .with({ kind: 'Blackjack' }, () => 'Blackjack')
                      .otherwise(() => undefined)}
                  </Tag>
                </Tooltip>
              );
            })()}
            <div className='flex min-h-[156px] gap-x-60'>
              {game.player_hands.map((hand, i) => (
                <div key={i} className={cn('flex ml-[-70px]', i !== game.hand_index && 'opacity-40')}>
                  {hand.map((card, j) => {
                    const sideways = game.bets[i] > game.starting_bet && j === hand.length - 1;
                    return (
                      <div key={j} className='w-7 overflow-visible' style={{ zIndex: j }}>
                        <Card card={card} sideways={sideways} />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className='flex flex-col gap-2 mt-4'>
          <div className='min-h-6 text-center'>
            <FadeOut isVisible={lastDecision !== undefined}>
              <div className={lastDecision?.correct ? 'text-green-500' : 'text-red-500'}>
                {lastDecision?.correct
                  ? 'Correct!'
                  : `Incorrect. You should have ${match(lastDecision?.correctMove)
                      .with(PlayerAction.DoubleDown, () => 'doubled down')
                      .with(PlayerAction.Hit, () => 'hit')
                      .with(PlayerAction.Stand, () => 'stood')
                      .with(PlayerAction.Split, () => 'split')
                      .with(PlayerAction.Surrender, () => 'surrendered')
                      .otherwise(() => '')}.`}
              </div>
            </FadeOut>
          </div>
          <div className='relative'>
            {game.state === GameState.GameOver && (
              <Button className='absolute w-full h-full z-10' onClick={init}>
                Play again
              </Button>
            )}
            <div className='grid grid-cols-5 gap-1'>
              {[
                PlayerAction.DoubleDown,
                PlayerAction.Hit,
                PlayerAction.Stand,
                PlayerAction.Split,
                PlayerAction.Surrender,
              ].map((action, i) => {
                const isPlayerTurn = game.state === GameState.PlayerTurn;
                const props: ButtonProps = {
                  children: playerActionToString(action),
                };
                props.disabled = !isPlayerTurn || !allowedActions.includes(action);
                props.className = cn('h-24', props.disabled && 'opacity-50');
                props.onClick = () => handlePlayerAction(action);
                const tooltip = isPlayerTurn
                  ? match(action)
                      .with(PlayerAction.DoubleDown, () => 'Double down')
                      .with(PlayerAction.Hit, () => 'Hit')
                      .with(PlayerAction.Stand, () => {
                        const playerHandValue = Blackjack.get_player_hand_value(game);
                        const playerHandNumber =
                          match(playerHandValue)
                            .with({ kind: 'Hard' }, ({ value }) => value)
                            .with({ kind: 'Soft' }, ({ value }) => value)
                            .otherwise(() => undefined) ?? 0;
                        const lessThan17 = playerHandNumber < 17;

                        const iterations = 100_000;
                        const { results, runtimeMs } = (() => {
                          if (game.state === GameState.PlayerTurn) {
                            const startTime = performance.now();
                            const results = Blackjack.simulate_dealer_stand_outcome(
                              rankToNumber(game.dealer_hand[0].rank),
                              iterations,
                            );
                            const endTime = performance.now();
                            return { results, runtimeMs: endTime - startTime };
                          } else {
                            return { results: new Map(), runtimeMs: 0 };
                          }
                        })();
                        const entries = Array.from(results.entries());
                        const truncatedEntries = entries.filter(([key]) => key <= 21);
                        truncatedEntries.push([
                          'B',
                          entries.filter(([key]) => key > 21).reduce((acc, [, value]) => acc + value, 0),
                        ]);
                        const simulationResults = truncatedEntries
                          .map(([key, value]) => {
                            const normalizedY = value / iterations;
                            return {
                              x: key,
                              y: Math.round(normalizedY * 100),
                              color:
                                key < playerHandNumber || key === 'B'
                                  ? ('green' as const)
                                  : key === playerHandNumber
                                  ? ('yellow' as const)
                                  : ('red' as const),
                            };
                          })
                          .sort((a, b) => (a.x === 'B' ? 1 : b.x === 'B' ? -1 : a.x - b.x));

                        const winChance = sum(
                          simulationResults
                            .filter(({ x, y }) => x < playerHandNumber || x === 'B')
                            .map(({ x, y }) => y),
                        );
                        const pushChance = sum(
                          simulationResults.filter(({ x, y }) => x === playerHandNumber).map(({ x, y }) => y),
                        );
                        const loseChance = sum(
                          simulationResults
                            .filter(({ x, y }) => x > playerHandNumber && x !== 'B')
                            .map(({ x, y }) => y),
                        );
                        const tooltip = (
                          <div className='flex flex-col items-center gap-1'>
                            <div>
                              When the dealer&apos;s upcard is{' '}
                              <b>{rankToString(game.dealer_hand[0]?.rank ?? Rank.Two, true)}</b>, dealer&apos;s final
                              hand will be:
                            </div>
                            <div className='px-2'>
                              <BarGraph data={simulationResults} />
                              <div className='text-xs opacity-50'>
                                Ran {iterations.toLocaleString()} simulations in {runtimeMs.toFixed(2)} ms
                              </div>
                            </div>
                            {lessThan17 ? (
                              <div>
                                Win: <span className='text-green-500'>{winChance}%</span>, Lose:{' '}
                                <span className='text-red-500'>{loseChance}%</span>
                              </div>
                            ) : (
                              <div>
                                Win: <span className='text-green-500'>{winChance}%</span>, Push:{' '}
                                <span className='text-yellow-500'>{pushChance}%</span>, Lose:{' '}
                                <span className='text-red-500'>{loseChance}%</span>
                              </div>
                            )}
                          </div>
                        );
                        return tooltip;
                      })
                      .otherwise(() => undefined)
                  : undefined;
                const showTooltip = !props.disabled && Boolean(tooltip);
                return showTooltip ? (
                  <Tooltip key={i} title={tooltip} placement='bottom'>
                    <Button {...props} />
                  </Tooltip>
                ) : (
                  <Button key={i} {...props} />
                );
              })}
            </div>
          </div>
          <Tooltip trigger='hover' title={hint?.hint} open={showingHint} onOpenChange={(open) => setShowingHint(open)}>
            <Button type='dashed' className='w-full bg-gray-50 text-slate-400 cursor-default text-xs'>
              {game?.state === GameState.PlayerTurn && Boolean(hint) ? 'Hint available!' : 'No hint available'}
            </Button>
          </Tooltip>
          <Button onClick={back} type='text'>
            Quit
          </Button>
        </div>
      </div>
    );
  }
}
