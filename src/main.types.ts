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
  reservations: number[];
  suggestions: number[];
}

export type User = Omit<Car, 'location'>;

export type StationGroup = Record<number, Station>;
export type UserGroup = Record<number, User>;

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
    reservations: [],
    suggestions: [],
  };
}

export type RequestMap = {
  reserve: {
    userId: number;
    stationId: number;
  };
  getSuggestions: Car;
  registerStation: Station;
  registerUser: User;
};

export type Request =
  | {
      type: 'reserve';
      data: {
        userId: number;
        stationId: number;
      };
    }
  | {
      type: 'getSuggestions';
      data: Car;
    }
  | {
      type: 'registerStation';
      data: Station;
    }
  | {
      type: 'registerUser';
      data: User;
    };

export type Response<T> = {
  message: string;
  success: boolean;
  data: T;
};

export type ErrorResponse<T> = {
  message: string;
  success: boolean;
  error: T;
};

export type Reservations = Record<number, number[]>;

export function Car(id: number, x: number, y: number): Car {
  return {
    id,
    location: {
      x,
      y,
    },
  };
}
