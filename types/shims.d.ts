declare module 'lucide-react';
declare module 'wagmi';
declare module '@wagmi/core';
declare module 'next/navigation';
declare module 'next/link';
declare module 'react' {
  export function useState<T>(initialState: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void];
  export function useEffect(effect: (...args: any[]) => any, deps?: any[]): void;
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare namespace React {
  type MouseEvent = any;
}
