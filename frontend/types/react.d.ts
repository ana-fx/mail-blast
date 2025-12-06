declare module 'react' {
  export = React;
  export as namespace React;
  
  namespace React {
    type ReactNode = any;
    type ReactElement = any;
    type ComponentType<P = {}> = any;
    type FC<P = {}> = any;
    
    function useState<T>(initial: T): [T, (value: T) => void];
    function useEffect(effect: () => void | (() => void), deps?: any[]): void;
    function useContext<T>(context: any): T;
    function useMemo<T>(factory: () => T, deps: any[]): T;
    function useCallback<T>(callback: T, deps: any[]): T;
  }
}

declare module 'react-dom' {
  export function render(element: any, container: any): any;
}

