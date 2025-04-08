import type { User, Response, UserGroup } from '../../main.types.ts';
import { curry } from '../../utils.ts';

export const registerUser = curry((cars: UserGroup, newUser: User) => {
  // Verificar se a carro ja existe ????

  cars[newUser.id] = newUser;

  return {
    message: 'User registered',
    success: true,
    data: newUser,
  } satisfies Response<User>;
});
