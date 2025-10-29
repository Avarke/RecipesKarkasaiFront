/**
 * Response to valid login request.
 */
interface LogInResponse {
  userId: number;
  userTitle: string;
  jwt: string;
};

//
export type {
    LogInResponse
}