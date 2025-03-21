export interface Car {
  id: number;
  location: Position;
}

export interface Position {
  x: number;
  y: number;
}

export type StationState = 'avaliable' | 'charging-car' | 'reserved';

export interface Station {
  id: number;
  state: StationState;
  location: Position;
}

export function Station(
  id: number,
  x: number,
  y: number,
  state: StationState,
): Station {
  return {
    id,
    state,
    location: {
      x,
      y,
    },
  };
}

export function Car(id: number, x: number, y: number): Car {
  return {
    id,
    location: {
      x,
      y,
    },
  };
}
