import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAIkNpRY0qSU8P57vR3RbHNJ0LJfd8yS64",
  authDomain: "newstaredu-8b53e.firebaseapp.com",
  projectId: "newstaredu-8b53e",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Set language to Vietnamese
auth.languageCode = 'vi';

// Initialize reCAPTCHA verifier
export const setupRecaptcha = (containerId: string) => {
  return new RecaptchaVerifier(auth, containerId, {
    size: 'normal',
    callback: () => {
      console.log('✅ reCAPTCHA verified');
    },
    'expired-callback': () => {
      console.log('❌ reCAPTCHA expired');
    }
  });
};

// Send OTP to phone number
export const sendOTP = async (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => {
  try {
    // Phone number must be in E.164 format: +84xxxxxxxxx
    const formattedPhone = phoneNumber.startsWith('+84') 
      ? phoneNumber 
      : phoneNumber.startsWith('0')
      ? `+84${phoneNumber.slice(1)}`
      : `+84${phoneNumber}`;

    const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
    return confirmationResult;
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};

// Verify OTP code
export const verifyOTP = async (confirmationResult: any, code: string) => {
  try {
    const result = await confirmationResult.confirm(code);
    return result.user;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

export default app;
