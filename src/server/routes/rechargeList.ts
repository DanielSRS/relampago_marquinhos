import type {
  UserGroup,
  ChargeRecord,
  RequestHandler,
} from '../../main.types.ts';
import { curry, Logger } from '../../utils.ts';

/**
 * Retorna a lista de recibos de recargas associados a um user
 * Se o cliente existe
 */
export const rechargeList = curry(
  (
    users: UserGroup,
    chargeGroup: ChargeRecord,
    data: {
      userId: number;
    },
  ): ReturnType<RequestHandler<'rechargeList'>> => {
    const { userId } = data;

    const user = users[userId];
    if (!user) {
      return {
        message: 'ERROR: User does not exist',
        success: false,
        error: 'this field is not optional',
      };
    }

    const recharge_list = Object.values(chargeGroup).filter(
      charge => charge.userId === user.id,
    );

    Logger.debug('What is the value??: ', recharge_list);

    if (rechargeList.length === 0) {
      return {
        message:
          'WARNING: There is no recharge receipt associated with the user!',
        success: true,
        data: recharge_list,
      };
    } else {
      return {
        message: 'Recharge receipt list!',
        success: true,
        data: recharge_list,
      };
    }
  },
);
