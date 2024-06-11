import { cn } from '@/utils/css';
import { match } from 'ts-pattern';

export interface BarGraphProps {
  data: { x: string | number; y: number; color?: 'red' | 'yellow' | 'white' | 'green' }[];
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
              .with('yellow', () => ({ textColor: 'text-yellow-500', bgColor: 'bg-yellow-500' }))
              .with('white', () => ({ textColor: 'text-white-500', bgColor: 'bg-white-500' }))
              .with('green', () => ({ textColor: 'text-green-500', bgColor: 'bg-green-500' }))
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
