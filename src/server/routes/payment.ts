import type {
  UserGroup,
  ChargeRecord,
  RequestHandler,
} from '../../main.types.ts';
import { curry } from '../../utils.ts';

type Handler = RequestHandler<'payment'>;

/**
 * Se o cliente existe
 * Se a recarga existe
 * Se a recarga é desse cliente
 * Faz o pagamento
 */
export const payment = curry(
  (
    users: UserGroup,
    chargeGroup: ChargeRecord,
    data: Handler['data'],
  ): Handler['res'] => {
    const { userId, chargeId } = data;

    const user = users[userId];
    if (!user) {
      return {
        message: 'ERROR: User does not exist',
        success: false,
        error: 'this field is not optional',
      };
    }

    const recharge = Object.values(chargeGroup).find(
      recharge => recharge.chargeId === chargeId && recharge.userId === userId,
    );

    if (!recharge) {
      return {
        message: 'Recharge not found or does not belong to the user.',
        success: false,
        error: 'this field is not optional',
      };
    }

    recharge.hasPaid = true;

    return {
      message: 'Payment processed successfully.',
      success: true,
      data: recharge,
    };
  },
);
