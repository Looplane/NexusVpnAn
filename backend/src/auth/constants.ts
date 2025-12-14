
export const jwtConstants = {
  // In production, this must be an environment variable!
  secret: process.env.JWT_SECRET || 'DEV_SECRET_KEY_DO_NOT_USE_IN_PROD_12345',
};
