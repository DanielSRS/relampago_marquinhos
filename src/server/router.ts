import { curry } from '../utils.ts';
import type {
  Request,
  RequestResponseMap,
  RequestHandler,
} from '../main.types.ts';

export type ServerRouter = (request: Request) => () => void;

type Routes<T extends keyof RequestResponseMap> = Record<T, RequestHandler<T>>;

export function createRouter() {
  type Keys = keyof RequestResponseMap;
  const routes: Partial<Routes<Keys>> = {};
  const s = {
    add<T extends keyof RequestResponseMap>(path: T, fn: RequestHandler<T>) {
      routes[path] = fn as unknown as (typeof routes)[T];
      return s;
    },
    all() {
      return routes;
    },
  };
  return s;
}

export const serverRouter = curry(
  (routes: Routes<keyof RequestResponseMap>, request: Request) => {
    return routes[request.type];
  },
);
