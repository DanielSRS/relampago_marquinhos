import type {
    UserGroup,
    ErrorResponse,
    ChargeRecord,
  } from '../../main.types.ts';
  import { curry } from '../../utils.ts';
  
  /**
   * Se o cliente existe
   * Se a recarga existe
   * Se a recarga é desse cliente
   */
export const payment = curry(
  (
    users: UserGroup,
    chargeGroup: ChargeRecord,
    data: {
      userId: number;
      chargeId: number; 
    },
  ) => {
    const { userId, chargeId } = data;

    const user = users[userId];
    if (!user) {
      return {
        message: 'ERROR: User does not exist',
        success: false,
        error: 'this field is not optional',
      } satisfies ErrorResponse<unknown>;
    }

    const existsAndBelongs = Object.values(chargeGroup).some(
    (recharge) => recharge.chargeId === chargeId && recharge.userId === userId
    );

    if (!existsAndBelongs) {
      return {
        message: 'Recharge not found or does not belong to the user.',
        success: false,
        error: 'this field is not optional',
      } satisfies ErrorResponse<unknown>;
    }
  }
);