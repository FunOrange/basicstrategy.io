import { cn } from '@/utils/css';
import { match } from 'ts-pattern';

export interface BarGraphProps {
  data: {
    x: string | number;
    y: number;
    color?: 'red' | 'orange' | 'yellow' | 'white' | 'green' | 'slate' | 'pink' | 'rose';
  }[];
}
export default function BarGraph({ data }: BarGraphProps) {
  return (
    <div className='grid items-end gap-[1px]' style={{ gridTemplateColumns: `repeat(${data.length}, 1fr)` }}>
      {data.map(({ x, y, color }) => {
        const yNormalized = y / Math.max(...data.map(({ y }) => y));
        const yPercent = Math.round(yNormalized * 100);
        const { textColor, bgColor } = color
          ? match(color)
              .with('red', () => ({ textColor: 'text-red-500', bgColor: 'bg-red-500' }))
              .with('pink', () => ({ textColor: 'text-pink-500', bgColor: 'bg-pink-500' }))
              .with('rose', () => ({ textColor: 'text-rose-500', bgColor: 'bg-rose-500' }))
              .with('orange', () => ({ textColor: 'text-orange-500', bgColor: 'bg-orange-500' }))
              .with('yellow', () => ({ textColor: 'text-yellow-500', bgColor: 'bg-yellow-500' }))
              .with('white', () => ({ textColor: 'text-gray-100', bgColor: 'bg-gray-100' }))
              .with('green', () => ({ textColor: 'text-green-500', bgColor: 'bg-green-500' }))
              .with('slate', () => ({ textColor: 'text-slate-500', bgColor: 'bg-slate-500' }))
              .exhaustive()
          : { textColor: 'text-white-500', bgColor: 'bg-white-500' };
        return (
          <div key={x} className='flex flex-col items-center justify-end gap-1 h-[100px] w-7'>
            <div className={cn('text-xs', textColor)}>{y ? `${y}%` : y}</div>
            <div className={cn('w-full', bgColor)} style={{ height: `${Math.round(yPercent)}%` }} />
            <div className={cn('text-xs', textColor)}>{x}</div>
          </div>
        );
      })}
    </div>
  );
}
