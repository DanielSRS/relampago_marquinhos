export interface Car {
  id: number;
  location: Position;
}

export interface Position {
  x: number;
  y: number;
}

export interface Station {
  id: number;
  location: Position;
}

export function Station(id: number, x: number, y: number): Car {
  return {
    id,
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
