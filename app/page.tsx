"use client";
import { BlackjackState, GameState, PlayerAction } from "@/types/blackjack";
import { JsBindings as BlackjackJsBindings } from "@/types/blackjack-analyzer-rs-bindings";
import { BlackjackRuleset, DoubleDownOn, MaxHandsAfterSplit, SplitAces } from "@/types/ruleset";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [Blackjack, setBlackjack] = useState<BlackjackJsBindings>();
  useEffect(() => {
    (async () => {
      const Blackjack = await import("@/local_packages/blackjack-analyzer-rs");
      setBlackjack(Blackjack as any as BlackjackJsBindings);
    })();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Get started by editing&nbsp;
          <code className="font-mono font-bold">app/page.tsx</code>
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:size-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            By{" "}
            <Image
              src="/vercel.svg"
              alt="Vercel Logo"
              className="dark:invert"
              width={100}
              height={24}
              priority
            />
          </a>
        </div>
      </div>

      <div className="relative z-[-1] flex place-items-center before:absolute before:h-[300px] before:w-full before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 sm:before:w-[480px] sm:after:w-[240px] before:lg:h-[360px]">
        <Image
          className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
          src="/next.svg"
          alt="Next.js Logo"
          width={180}
          height={37}
          priority
        />
      </div>

      {Boolean(Blackjack) && <Game Blackjack={Blackjack!} />}
    </main>
  );
}

function Game({ Blackjack }: { Blackjack: BlackjackJsBindings }) {
  const [game, setGame] = useState<BlackjackState>();
  const [allowedActions, setAllowedActions] = useState<PlayerAction[]>([]);

  const init = async () => {
    const rules: BlackjackRuleset = Blackjack.create_ruleset(
      /*surrender*/ true,
      /*dealer_stands_on_all_17*/ true,
      /*dealer_peeks*/ true,
      /*split_aces*/ SplitAces.Twice,
      /*hit_on_split_ace*/ false,
      /*max_hands_after_split*/ MaxHandsAfterSplit.Three,
      /*double_down_on*/ DoubleDownOn.Any,
      /*double_after_split*/ true,
      /*double_on_split_ace*/ false,
      /*blackjack_payout*/ 3.0 / 2.0,
      /*ace_and_ten_counts_as_blackjack*/ true,
      /*split_ace_can_be_blackjack*/ false
    );
    console.debug("rules", rules);
    const game = Blackjack.init_state(1, rules);
    console.debug("game", game);
    setGame(game);
  };

  const nextState = () => {
    const _game = Blackjack.next_state(game!);
    console.debug("_game", _game);
    setGame(_game);
    if (_game.state === GameState.PlayerTurn) {
      const allowed_actions = Blackjack.allowed_actions(_game);
      console.debug("allowed_actions", allowed_actions);
      setAllowedActions(allowed_actions);
    }
  };

  const handlePlayerAction = (action: PlayerAction) => {
    const _game = Blackjack.next_state(game!, action);
    console.debug("_game", _game);
    setGame(_game);
  };

  return (
    <div className="flex flex-col gap-2">
      {!game && (
        <button
          className="rounded transition-colors bg-slate-700 hover:bg-slate-600 px-4 py-2"
          onClick={init}
        >
          init
        </button>
      )}
      {game && game.state !== GameState.PlayerTurn ? (
        <button
          className="rounded transition-colors bg-slate-700 hover:bg-slate-600 px-4 py-2"
          onClick={nextState}
        >
          Next state
        </button>
      ) : (
        Object.values([
          PlayerAction.Hit,
          PlayerAction.Stand,
          PlayerAction.DoubleDown,
          PlayerAction.Split,
          PlayerAction.Surrender,
        ]).map(
          (action, i) =>
            allowedActions.includes(action as PlayerAction) && (
              <button
                className="rounded transition-colors bg-slate-700 hover:bg-slate-600 px-4 py-2"
                key={i}
                onClick={() => handlePlayerAction(action as PlayerAction)}
              >
                {action}
              </button>
            )
        )
      )}
    </div>
  );
}
