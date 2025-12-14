/**
 * Response to valid login request.
 */
interface LogInResponse {
  accessToken: string;
  userId: string;
  userName: string;
};

//
export type {
    LogInResponse
}