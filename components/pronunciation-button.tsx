'use client';

import * as React from 'react';
import { Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const activeAudio = {
  current: null as HTMLAudioElement | null,
  reset: null as (() => void) | null,
};

export function PronunciationButton({
  type,
  word,
}: {
  type: 1 | 2;
  word: string;
}) {
  const [playing, setPlaying] = React.useState(false);
  const label = type === 1 ? '播放英式发音' : '播放美式发音';

  const stopPlaying = React.useCallback(() => {
    setPlaying(false);
  }, []);

  React.useEffect(() => {
    return () => {
      if (activeAudio.reset === stopPlaying) {
        activeAudio.reset = null;
      }
    };
  }, [stopPlaying]);

  function play() {
    const text = word.trim();
    if (!text) return;

    activeAudio.current?.pause();
    activeAudio.reset?.();

    const audio = new Audio(
      `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(
        text,
      )}&type=${type}`,
    );
    activeAudio.current = audio;
    activeAudio.reset = stopPlaying;

    setPlaying(true);
    audio.onended = stopPlaying;
    audio.onerror = stopPlaying;
    audio.play().catch(stopPlaying);
  }

  return (
    <Button
      aria-label={label}
      className="h-8 w-8 rounded-full"
      disabled={playing}
      onClick={play}
      size="icon"
      type="button"
      variant="ghost"
    >
      <Volume2 className="h-4 w-4" />
    </Button>
  );
}
