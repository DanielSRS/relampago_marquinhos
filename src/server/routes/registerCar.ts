import type {
  User,
  Response,
  UserGroup,
  RequestHandler,
} from '../../main.types.ts';
import { curry } from '../../utils.ts';

type Handler = RequestHandler<'registerUser'>;

export const registerUser = curry(
  (cars: UserGroup, data: Handler['data']): Handler['res'] => {
    // Verificar se a carro ja existe ????

    cars[data.id] = data;

    return {
      message: 'User registered',
      success: true,
      data: data,
    } satisfies Response<User>;
  },
);
