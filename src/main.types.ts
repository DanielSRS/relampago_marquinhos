export interface Car {
  id: number;
  location: Position;
}

export interface Position {
  x: number;
  y: number;
}

export type StationState = 'avaliable' | 'charging-car' | 'reserved';

export type Charge = {
  chargeId: number;
  userId: number;
  stationId: number;
  startTime: Date;
  endTime: Date;
  cost: number;
};

export type Station = {
  id: number;
  location: Position;
  reservations: number[];
  suggestions: number[];
} & (
  | {
      state: 'charging-car';
      // Id de uma recarga
      onUse: number;
    }
  | {
      state: 'avaliable';
    }
  | {
      state: 'reserved';
    }
);

export type User = Omit<Car, 'location'>;

export type StationGroup = Record<number, Station>;
export type ChargeRecord = Record<number, Charge>;
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onUse: undefined as any,
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
  startChaging: {
    stationId: number;
    userId: number;
  };
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
    }
  | {
      type: 'startChaging';
      data: {
        stationId: number;
        userId: number;
      };
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
