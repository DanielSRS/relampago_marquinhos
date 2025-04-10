import { curry } from '../utils.ts';
import type {
  Request,
  RequestResponseMap,
  ApiRequestHandler,
} from '../main.types.ts';

export type ServerRouter = (request: Request) => () => void;

type Routes<T extends keyof RequestResponseMap> = Record<
  T,
  ApiRequestHandler<T>
>;

export function createRouter() {
  type Keys = keyof RequestResponseMap;
  const routes: Partial<Routes<Keys>> = {};
  const s = {
    add<T extends keyof RequestResponseMap>(path: T, fn: ApiRequestHandler<T>) {
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
