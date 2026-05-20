export interface JwtPayload {
  userId: string;
  organizationId: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  role: string;
}
