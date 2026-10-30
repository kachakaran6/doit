export interface UserViewModel {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: UserViewModel;
}
