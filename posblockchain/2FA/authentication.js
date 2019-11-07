import * as speakeasy from 'speakeasy';
 
function getTwoFactorAuthenticationCode() {
  const secretCode = speakeasy.generateSecret({
    name: process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME,
  });
  return {
    otpauthUrl : secretCode.otpauth_url,
    base32: secretCode.base32,
  };
}