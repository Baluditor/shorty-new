export type UserModel = {
  uid: string;
  email: string | null;
  displayName: string;
  username: string;
  photoURL: string | null;
  createdAt: string | undefined;
  lastLoginAt: string | undefined;
  onboardingCompleted: boolean;
  onboardingStep: number;
};
