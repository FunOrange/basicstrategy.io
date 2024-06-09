import { sleep } from '@/utils/time';
import { useEffect, useRef } from 'react';

const queue: true[] = [];
let processingQueue = false;
const processQueueInterval = 80;

export default function useGameAudio() {
  const dealCardAudioRef = useRef<HTMLAudioElement[]>([]);
  const correctAudioRef = useRef<HTMLAudioElement | null>(null);
  const incorrectAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const loadAudio = (src: string, volume: number = 1) => {
      const audio = new Audio();
      audio.src = src;
      audio.load();
      audio.volume = volume;
      return audio;
    };
    dealCardAudioRef.current = [
      loadAudio('/audio/card-1.mp3'),
      loadAudio('/audio/card-2.mp3'),
      loadAudio('/audio/card-3.mp3'),
      loadAudio('/audio/card-4.mp3'),
      loadAudio('/audio/card-5.mp3'),
      loadAudio('/audio/card-6.mp3'),
      loadAudio('/audio/card-7.mp3'),
      loadAudio('/audio/card-8.mp3'),
      loadAudio('/audio/card-9.mp3'),
      loadAudio('/audio/card-10.mp3'),
    ];
    correctAudioRef.current = loadAudio('/audio/correct.mp3', 0.2);
    incorrectAudioRef.current = loadAudio('/audio/incorrect.mp3', 0.2);
  }, []);

  const playCardDealSound = () => {
    queue.push(true);
    processQueue();
  };

  const processQueue = async () => {
    if (processingQueue) return;
    processingQueue = true;

    try {
      while (queue.length) {
        queue.pop();
        let audio = dealCardAudioRef.current?.[Math.floor(Math.random() * dealCardAudioRef.current.length)];
        const isPlaying = (audio: HTMLAudioElement) => !audio.paused && !audio.ended && audio.currentTime > 0;
        while (isPlaying(audio)) {
          audio = dealCardAudioRef.current?.[Math.floor(Math.random() * dealCardAudioRef.current.length)];
        }
        audio.play();
        await sleep(processQueueInterval);
      }
    } finally {
      processingQueue = false;
    }
  };

  const play = {
    dealCard: playCardDealSound,
    correct: () => {
      correctAudioRef.current!.currentTime = 0;
      correctAudioRef.current!.play();
    },
    incorrect: () => {
      incorrectAudioRef.current!.currentTime = 0;
      incorrectAudioRef.current!.play();
    },
  };
  return play;
}
