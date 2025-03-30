import { curry } from '../utils.ts';
import type { Request, RequestMap } from '../main.types.ts';

export type ServerRouter = (request: Request) => () => void;

type Routes<T extends keyof RequestMap> = Record<
  T,
  (data: RequestMap[T]) => void
>;

export function createRouter() {
  const routes: Partial<Routes<keyof RequestMap>> = {};
  const s = {
    add<T extends keyof RequestMap>(
      path: T,
      fn: (data: RequestMap[T]) => unknown,
    ) {
      routes[path] = fn;
      return s;
    },
    all() {
      return routes;
    },
  };
  return s;
}

export const serverRouter = curry(
  (routes: Routes<keyof RequestMap>, request: Request) => {
    return routes[request.type];
  },
);
