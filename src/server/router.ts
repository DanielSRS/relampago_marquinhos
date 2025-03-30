import { curry } from '../utils.ts';
import type { Request } from '../main.types.ts';

export type ServerRouter = (request: Request) => () => void;

type Routes = Record<Request['type'], (data: Request['data']) => void>;

export function createRouter() {
  const routes: Partial<Routes> = {};
  const s = {
    add(path: Request['type'], fn: (data: Request['data']) => void) {
      routes[path] = fn;
      return s;
    },
    all() {
      return routes;
    },
  };
  return s;
}

export const serverRouter = curry((routes: Routes, request: Request) => {
  return routes[request.type];
});
