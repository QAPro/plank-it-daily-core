-- Fix Auth OTP long expiry warning by setting reasonable timeouts
-- Set OTP expiry to 10 minutes (600 seconds) for email confirmations
-- Set password reset expiry to 1 hour (3600 seconds)
-- These values provide good security while maintaining usability

UPDATE auth.config 
SET value = '600' 
WHERE parameter = 'email_confirm_expiry';

UPDATE auth.config 
SET value = '3600' 
WHERE parameter = 'password_reset_expiry';