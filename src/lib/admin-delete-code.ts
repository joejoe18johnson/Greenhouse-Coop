/** Admin must type this exactly to confirm permanent customer deletion. */
export const DELETE_USER_CONFIRMATION_PHRASE = "DeleteUser";

export function verifyDeleteUserConfirmation(input: string): boolean {
  return input.trim() === DELETE_USER_CONFIRMATION_PHRASE;
}
