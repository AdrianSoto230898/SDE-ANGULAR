export interface User {
  avatar: string;
  displayName: string;
  mail: string;
  userPrincipalName: string;
  sdeSession?: {
    name?: string;
    email?: string;
    sigla?: string;
  };
}