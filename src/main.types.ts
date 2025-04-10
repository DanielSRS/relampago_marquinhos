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
  hasPaid: boolean;
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
    onUse: -1,
    location: {
      x,
      y,
    },
    reservations: [],
    suggestions: [],
  };
}

export type RequestResponseMap = {
  reserve: {
    input: {
      userId: number;
      stationId: number;
    };
    output: Response<undefined> | ErrorResponse<undefined>;
  };
  getSuggestions: {
    input: Car;
    output: Response<Station[]>;
  };
  registerStation: {
    input: Station;
    output: Response<Station> | ErrorResponse<string>;
  };
  registerUser: {
    input: User;
    output: Response<User> | ErrorResponse<unknown>;
  };
  startCharging: {
    input: {
      stationId: number;
      userId: number;
      battery_level: number;
    };
    output: Response<Charge> | ErrorResponse<string>;
  };
  endCharging: {
    input: {
      chargeId: number;
      stationId: number;
      userId: number;
      battery_level: number;
    };
    output: Response<Charge> | ErrorResponse<string>;
  };
  rechargeList: {
    input: {
      userId: number;
    };
    output: Response<Charge[]> | ErrorResponse<string>;
  };
  payment: {
    input: {
      userId: number;
      chargeId: number;
      hasPaid: boolean;
    };
    output: Response<Charge> | ErrorResponse<string>;
  };
};

export type RequestHandler<K extends keyof RequestResponseMap> = (
  data: RequestResponseMap[K]['input'],
) => RequestResponseMap[K]['output'];

type DefinedEndpoints = keyof RequestResponseMap;

type ApiRequest = {
  type: DefinedEndpoints;
  data: RequestResponseMap[DefinedEndpoints]['input'];
};

export type Request = ApiRequest;

export type Response<T> = {
  message: string;
  success: true;
  data: T;
};

export type ErrorResponse<T> = {
  message: string;
  success: false;
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
