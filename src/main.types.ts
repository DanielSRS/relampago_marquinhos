export interface Car {
  /**
   * Id do carro. O id deve ser um número inteiro.
   * O id deve ser único para cada carro.
   * @example 1
   */
  id: number;
  /**
   * Localização do carro.
   */
  location: Position;
  /**
   * Nivel da bateria do carro. O valor deve ser entre 0 e 100.
   * 0 significa que o carro está sem bateria e 100 significa
   * que o carro está totalmente carregado.
   * O valor deve ser um número inteiro.
   * @example 75
   * @example 100
   */
  batteryLevel: number;
}
/**
 * Representa a posição dentro do sistema de coordenadas.
 * O sistema de coordenadas é um plano cartesiano.
 * O ponto (0, 0) representa o canto inferior esquerdo do plano.
 * O ponto (x, y) representa a posição do carro ou da estação de carga.
 * O ponto (x, y) é um número inteiro.
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * O estado da estação de carga.
 * O estado pode ser 'avaliable', 'charging-car' ou 'reserved'.
 * 'avaliable' significa que a estação está disponível para uso.
 * 'charging-car' significa que a estação está em uso e está
 * carregando um carro.
 * 'reserved' significa que a estação está reservada para um carro.
 */
export type StationState = 'avaliable' | 'charging-car' | 'reserved';

/**
 * Representa uma recarga.
 * Uma recarga é uma operação de carga de um carro em uma estação.
 * A recarga tem um id, um id de usuário, um id de estação,
 * um horário de início, um horário de término, um custo e um
 * status de pagamento.
 */
export type Charge = {
  /**
   * Id da recarga. O id deve ser um número inteiro.
   * O id deve ser único para cada recarga.
   * @example 1
   */
  chargeId: number;
  /**
   * Id do usuário. O id deve ser um número inteiro.
   * O id deve ser único para cada usuário.
   * O usuário associado ao id deve existir.
   */
  userId: number;
  /**
   * Id da estação. O id deve ser um número inteiro.
   * O id deve ser único para cada estação.
   * A estação associada ao id deve existir.
   */
  stationId: number;
  /**
   * Horário de início da recarga.
   * O horário deve ser uma data válida.
   */
  startTime: Date;
  /**
   * Horário de término da recarga.
   */
  endTime: Date;
  /**
   * Custo da recarga.
   */
  cost: number;
  /**
   * Status de pagamento da recarga.
   * true indica que a recarga foi paga.
   */
  hasPaid: boolean;
};

/**
 * Representa uma estação de carga.
 * Uma estação de carga é um ponto de recarga de um carro.
 * A estação tem um id, uma localização, um estado e uma lista de
 * reservas.
 */
export type Station = {
  /**
   * Id da estação. O id deve ser um número inteiro.
   * O id deve ser único para cada estação.
   */
  id: number;
  /**
   * Localização da estação no sistema de coordenadas.
   */
  location: Position;
  /**
   * Fila de espera da estação.
   * A fila de espera é uma lista de ids de usuários que
   * reservaram a estação.
   */
  reservations: number[];
  /**
   * Lista de carros/usuários para os quais a estação foi recomendada.
   * É usado pelo algoritmo de recomendação para distribuir a demanda
   * pelas estações de recarga
   */
  suggestions: number[];
} & STATION_STATE;

/**
 * Estado da estação.
 * O estado pode ser 'avaliable', 'charging-car' ou 'reserved'.
 * 'avaliable' significa que a estação está disponível para uso.
 * 'charging-car' significa que a estação está em uso e está
 * carregando um carro.
 * 'reserved' significa que a estação está reservada para um carro.
 *
 * Quando o estado for 'charging-car', o id da recarga
 * deve ser passado no campo onUse.
 */
type STATION_STATE =
  | {
      state: 'charging-car';
      /**
       * Id da recarga em uso.
       * O id deve ser um número inteiro.
       * O representa uma recarga existente.
       *
       * @see {Charge}
       */
      onUse: number;
    }
  | {
      state: 'avaliable';
    }
  | {
      state: 'reserved';
    };

export type User = Omit<Car, 'location'>;

export type StationGroup = Record<number, Station>;
export type ChargeRecord = Record<number, Charge>;
export type UserGroup = Record<number, User>;

/**
 * Cria uma nova estação de carga.
 * @param id O id da estação. O id deve ser um número inteiro.
 * @param x A coordenada x da estação no sistema de coordenadas.
 * @param y A coordenada y da estação no sistema de coordenadas.
 * @param state O estado da estação.
 * @returns Uma nova estação de carga.
 * @example
 * const station = Station(1, 10, 20, 'avaliable');
 * // station = {
 * // {
 * //   id: 1,
 * //   location: { x: 10, y: 20 },
 * //   state: 'avaliable',
 * //   reservations: [],
 * //   suggestions: [],
 * // }
 */
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

export type ApiRequestHandler<K extends keyof RequestResponseMap> = (
  data: RequestResponseMap[K]['input'],
) => RequestResponseMap[K]['output'];

export type RequestHandler<K extends keyof RequestResponseMap> = {
  data: RequestResponseMap[K]['input'];
  res: RequestResponseMap[K]['output'];
};

type DefinedEndpoints = keyof RequestResponseMap;

type ApiRequest = {
  type: DefinedEndpoints;
  data: RequestResponseMap[DefinedEndpoints]['input'];
};

export type Request = ApiRequest;

/**
 * Representa uma resposta da API.
 * Representa uma resposta de sucesso.
 */
export type Response<T> = {
  /**
   * Mensagem de sucesso
   */
  message: string;
  success: true;
  /**
   * Dados retornados pela API.
   * Os dados podem ser de qualquer tipo.
   * O tipo dos dados depende do endpoint da API.
   * @example { id: 1, name: 'Bom dia' }
   * @example null
   * @example undefined
   * @example [{ id: 1, name: 'Boa tarde' }]
   */
  data: T;
};

/**
 * Representa uma resposta de erro da API.
 */
export type ErrorResponse<T> = {
  /**
   * Mensagem de erro.
   */
  message: string;
  success: false;
  /**
   * Erro retornado pela API.
   * O erro pode ser de qualquer tipo.
   * O tipo do erro depende do endpoint da API.
   */
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
    batteryLevel: 0,
  };
}
