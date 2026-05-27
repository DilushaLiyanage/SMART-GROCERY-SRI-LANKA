import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Phone, AlertCircle, ArrowLeft, Check, Shield, MessageSquare, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const RegisterPage = () => {
  const { register, login, checkUser, verifyOtp, otpLogin, user, error, loading } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Navigation redirect after user is logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'Customer') navigate('/select-location');
      else if (user.role === 'StoreAdmin') navigate('/store-admin');
      else if (user.role === 'Courier') navigate('/courier-dashboard');
      else if (user.role === 'SystemAdmin') navigate('/system-admin');
    }
  }, [user, navigate]);

  // Auth flow states: 'identify' | 'otp' | 'profile'
  const [step, setStep] = useState('identify');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [inputType, setInputType] = useState('email'); // 'email' or 'phone'
  
  // OTP states
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpInputs, setOtpInputs] = useState(['', '', '', '']);
  const otpRefs = [useRef(), useRef(), useRef(), useRef()];
  const [showOtpNotification, setShowOtpNotification] = useState(false);
  const [otpNotificationKey, setOtpNotificationKey] = useState(0);
  const [previewUrl, setPreviewUrl] = useState('');

  // Profile creation states (for new users)
  const [name, setName] = useState('');
  const [role, setRole] = useState(searchParams.get('role') || 'Customer');
  const [extraField, setExtraField] = useState(''); // email if signed up with phone, phone if signed up with email
  
  // Error handling
  const [localError, setLocalError] = useState(null);
  const [userExists, setUserExists] = useState(false);

  // Parse input type
  const handleIdentifySubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    const cleaned = emailOrPhone.trim();

    if (!cleaned) {
      setLocalError('Please enter a valid email or phone number.');
      return;
    }

    // Simple pattern checks
    const isEmail = cleaned.includes('@') && cleaned.includes('.');
    const isPhone = /^[0-9+\s-]{9,15}$/.test(cleaned);

    if (!isEmail && !isPhone) {
      setLocalError('Please enter a valid email address or phone number (9+ digits).');
      return;
    }

    setInputType(isEmail ? 'email' : 'phone');

    try {
      // Check user existence and request OTP dispatch
      const res = await checkUser(cleaned);
      if (res && res.success) {
        setUserExists(res.exists);
        setOtpInputs(['', '', '', '']);
        setOtpCode('');
        setStep('otp');
        setPreviewUrl(res.previewUrl || '');
        
        // Show simulated SMS notification ONLY if it is not an email
        if (!isEmail && res.otp) {
          setGeneratedOtp(res.otp);
          setOtpNotificationKey(prev => prev + 1);
          setShowOtpNotification(true);
        } else {
          // Real email OTP was sent, do not show on page
          setShowOtpNotification(false);
          setGeneratedOtp('');
        }
      } else {
        setLocalError(res?.error || 'Verification failed. Please try again.');
      }
    } catch (err) {
      setLocalError('Connection error. Is the server running?');
    }
  };

  // Google Sign-In Simulation
  const handleGoogleSignIn = async () => {
    setLocalError(null);
    try {
      // Check if simulated Google user exists, otherwise register it
      const googleEmail = 'google_user@gmail.com';
      const checkRes = await checkUser(googleEmail);
      
      if (checkRes && checkRes.success) {
        if (checkRes.exists) {
          // Exists, perform OTP login simulation instantly
          await otpLogin(googleEmail);
        } else {
          // Doesn't exist, register with Google details
          await register({
            name: 'Google User',
            email: googleEmail,
            password: 'password123',
            role: 'Customer',
            phone: '0771112222',
            address: 'Colombo, Sri Lanka',
            latitude: 6.9271,
            longitude: 79.8612
          });
        }
      }
    } catch (err) {
      setLocalError('Failed to authenticate with Google. Make sure server is running.');
    }
  };

  // OTP inputs handling
  const handleOtpChange = (index, value) => {
    const newVal = value.replace(/[^0-9]/g, '');
    const newInputs = [...otpInputs];
    newInputs[index] = newVal;
    setOtpInputs(newInputs);
    setLocalError(null);

    // Auto-focus next input
    if (newVal !== '' && index < 3) {
      otpRefs[index + 1].current.focus();
    }

    const currentCode = newInputs.join('');
    setOtpCode(currentCode);

    // If fully filled, verify automatically
    if (currentCode.length === 4) {
      handleOtpVerification(currentCode);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && otpInputs[index] === '' && index > 0) {
      otpRefs[index - 1].current.focus();
    }
  };

  const handleOtpVerification = async (code) => {
    try {
      const res = await verifyOtp(emailOrPhone.trim(), code);
      if (res && res.success && res.verified) {
        setShowOtpNotification(false);
        if (res.exists) {
          // Existing user is logged in automatically by Context
          // Redirect handled by useEffect
        } else {
          // New user: advance to profile completion step
          setStep('profile');
        }
      } else {
        setLocalError(res?.error || res?.message || 'Invalid 4-digit code. Please try again.');
      }
    } catch (err) {
      setLocalError('Verification request failed. Please try again.');
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!name.trim()) {
      setLocalError('Please enter your name.');
      return;
    }

    let finalEmail = inputType === 'email' ? emailOrPhone.trim() : extraField.trim();
    let finalPhone = inputType === 'phone' ? emailOrPhone.trim() : extraField.trim();

    if (inputType === 'phone' && !finalEmail) {
      // Generate standard fallback email if not provided
      finalEmail = `phone_${finalPhone}@smartgrocery.lk`;
    }

    const userData = {
      name: name.trim(),
      email: finalEmail,
      password: 'password123', // standard fallback password
      role: role,
      phone: finalPhone || '0770000000',
      address: 'Colombo, Sri Lanka', // Defers detailed shipping location mapping to /select-location
      latitude: 6.9271,
      longitude: 79.8612
    };

    const res = await register(userData);
    if (!res.success) {
      setLocalError(res.error || 'Registration failed.');
    }
  };

  const resendOtp = async () => {
    setLocalError(null);
    setOtpInputs(['', '', '', '']);
    setOtpCode('');
    try {
      const res = await checkUser(emailOrPhone.trim());
      if (res && res.success) {
        setPreviewUrl(res.previewUrl || '');
        if (inputType === 'phone' && res.otp) {
          setGeneratedOtp(res.otp);
          setOtpNotificationKey(prev => prev + 1);
          setShowOtpNotification(true);
        } else {
          setShowOtpNotification(false);
          setGeneratedOtp('');
        }
      } else {
        setLocalError('Failed to resend verification code. Please try again.');
      }
    } catch (err) {
      setLocalError('Connection error. Please try again.');
    }
    if (otpRefs[0].current) {
      otpRefs[0].current.focus();
    }
  };

  // Google SVG logo
  const GoogleIcon = () => (
    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
      <path
        fill="#EA4335"
        d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.68 1.54 14.98 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.85 2.99c.92-2.75 3.5-4.51 6.76-4.51z"
      />
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.73 2.89c2.18-2.01 3.7-4.99 3.7-8.62z"
      />
      <path
        fill="#FBBC05"
        d="M5.24 10.55c-.24-.72-.38-1.5-.38-2.3s.14-1.58.38-2.3L1.39 2.96C.5 4.77 0 6.83 0 9s.5 4.23 1.39 6.04l3.85-3.49z"
      />
      <path
        fill="#34A853"
        d="M12 23c3.24 0 5.97-1.09 7.96-2.96l-3.73-2.89c-1.1.74-2.5 1.18-4.23 1.18-3.26 0-5.84-1.76-6.76-4.51L1.39 16.81C3.37 20.33 7.35 23 12 23z"
      />
    </svg>
  );

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-[#FAFAF8] text-[#1A1A1A] flex items-center justify-center py-12 px-6">
      
      {/* Floating Simulated SMS/Email Notification Banner */}
      <AnimatePresence>
        {showOtpNotification && (
          <motion.div
            key={otpNotificationKey}
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-20 z-50 max-w-sm w-full mx-4 bg-[#0A0A0A] text-white border border-[#2C2C2A] p-4 rounded-2xl shadow-2xl flex items-start gap-3.5"
          >
            <div className="w-9 h-9 rounded-xl bg-ceylon-500/20 border border-ceylon-500/30 flex items-center justify-center text-lg flex-shrink-0">
              💬
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Simulated {inputType === 'email' ? 'Email' : 'SMS'} Carrier</span>
                <button onClick={() => setShowOtpNotification(false)} className="text-slate-400 hover:text-white">
                  <span className="text-[10px] font-bold">DISMISS</span>
                </button>
              </div>
              <p className="text-xs font-semibold mt-1">
                Your Smart Grocery OTP verification code is <strong className="text-ceylon-400 text-sm tracking-wider font-extrabold">{generatedOtp}</strong>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[450px] bg-white border border-[#EBEBEA] rounded-3xl p-8 shadow-md relative overflow-hidden"
      >
        {/* Step 1: Identify Email or Phone */}
        {step === 'identify' && (
          <div>
            <h3 className="text-2xl font-semibold text-[#0A0A0A] mb-6 tracking-tight leading-snug">
              What's your phone number or email?
            </h3>

            {localError && (
              <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex gap-3 text-rose-600 text-xs font-semibold mb-6">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{localError}</span>
              </div>
            )}

            {error && (
              <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex gap-3 text-rose-600 text-xs font-semibold mb-6">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleIdentifySubmit} className="space-y-4">
              <input
                type="text"
                value={emailOrPhone}
                onChange={(e) => {
                  setEmailOrPhone(e.target.value);
                  setLocalError(null);
                }}
                placeholder="Enter phone number or email"
                className="w-full px-4 py-3.5 bg-white border border-[#1A1A1A] focus:ring-1 focus:ring-black rounded-xl text-sm font-medium text-[#1A1A1A] outline-none transition-all placeholder:text-[#6E6E6B]"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white font-bold text-sm rounded-xl transition-all duration-200"
              >
                {loading ? 'Processing...' : 'Continue'}
              </button>
            </form>

            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-[#EBEBEA]"></div>
              <span className="px-3 text-xs text-[#6E6E6B] font-medium">or</span>
              <div className="flex-grow border-t border-[#EBEBEA]"></div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3.5 bg-[#F3F3F1] hover:bg-[#EBEBEA] text-[#1A1A1A] font-bold text-sm rounded-xl transition-all duration-200 flex items-center justify-center border border-[#EBEBEA]"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <p className="text-[11px] text-[#6E6E6B] leading-relaxed mt-6 text-left">
              You consent to receive a verification code by text or Whatsapp. Message and data rates may apply.
            </p>
          </div>
        )}

        {/* Step 2: OTP Verification */}
        {step === 'otp' && (
          <div>
            <button 
              onClick={() => setStep('identify')}
              className="mb-5 flex items-center text-xs text-[#6E6E6B] hover:text-black font-semibold gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>

            <h3 className="text-xl font-bold text-[#0A0A0A] mb-2 tracking-tight">
              Enter 4-digit code
            </h3>
            <p className="text-xs text-[#6E6E6B] mb-6 leading-relaxed">
              We sent a 4-digit verification code to <span className="font-semibold text-black">{emailOrPhone}</span>
            </p>

            {localError && (
              <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex gap-3 text-rose-600 text-xs font-semibold mb-6">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{localError}</span>
              </div>
            )}

            <div className="flex justify-between gap-3 mb-6">
              {otpInputs.map((digit, idx) => (
                <input
                  key={idx}
                  ref={otpRefs[idx]}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-14 h-14 bg-[#F3F3F1] border border-[#EBEBEA] focus:border-black rounded-xl text-center text-xl font-bold outline-none transition-all"
                />
              ))}
            </div>

            <button
              onClick={() => handleOtpVerification(otpCode)}
              disabled={otpCode.length < 4 || loading}
              className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white font-bold text-sm rounded-xl transition-all duration-200 disabled:opacity-40 disabled:hover:bg-black"
            >
              Verify & Continue
            </button>

            <div className="mt-6 text-center">
              <button 
                onClick={resendOtp}
                className="text-xs text-ceylon-600 hover:text-ceylon-700 font-bold transition-colors"
              >
                Resend code
              </button>
            </div>

            {previewUrl && (
              <div className="mt-6 p-4 bg-ceylon-50 border border-ceylon-150 rounded-2xl text-left">
                <p className="text-[10px] text-ceylon-700 font-extrabold mb-1 uppercase tracking-wider">
                  Development Mailbox Simulator
                </p>
                <p className="text-[11px] text-[#6E6E6B] leading-relaxed mb-3 font-medium">
                  The OTP email was intercepted by the Ethereal testing server. Open the simulated inbox below to copy your code.
                </p>
                <a 
                  href={previewUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-[#1A1A1A] hover:bg-[#2C2C2A] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all"
                >
                  Open Ethereal Inbox <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Complete Profile (New Users) */}
        {step === 'profile' && (
          <div>
            <h3 className="text-xl font-bold text-[#0A0A0A] mb-1 tracking-tight">
              Complete Profile
            </h3>
            <p className="text-xs text-[#6E6E6B] mb-6">
              Fill in your details to finalize your Smart Grocery account.
            </p>

            {localError && (
              <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex gap-3 text-rose-600 text-xs font-semibold mb-6">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{localError}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[#6E6E6B] text-[10px] font-bold uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-[#6E6E6B]" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-3 py-2.5 bg-[#F3F3F1] border border-[#EBEBEA] focus:border-black rounded-xl text-xs font-semibold outline-none transition-all"
                  />
                </div>
              </div>

              {/* Extra field to gather missing email/phone */}
              {inputType === 'phone' && (
                <div className="space-y-1.5">
                  <label className="text-[#6E6E6B] text-[10px] font-bold uppercase tracking-wider">Email Address (Optional)</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#6E6E6B]" />
                    <input
                      type="email"
                      value={extraField}
                      onChange={(e) => setExtraField(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-3 py-2.5 bg-[#F3F3F1] border border-[#EBEBEA] focus:border-black rounded-xl text-xs font-semibold outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {inputType === 'email' && (
                <div className="space-y-1.5">
                  <label className="text-[#6E6E6B] text-[10px] font-bold uppercase tracking-wider">Phone Number (Optional)</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 w-4 h-4 text-[#6E6E6B]" />
                    <input
                      type="text"
                      value={extraField}
                      onChange={(e) => setExtraField(e.target.value)}
                      placeholder="0771234567"
                      className="w-full pl-10 pr-3 py-2.5 bg-[#F3F3F1] border border-[#EBEBEA] focus:border-black rounded-xl text-xs font-semibold outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[#6E6E6B] text-[10px] font-bold uppercase tracking-wider">Select Account Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: 'Customer', label: 'Buyer Dashboard' },
                    { name: 'Courier', label: 'Delivery Rider' }
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.name}
                      onClick={() => setRole(item.name)}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 ${
                        role === item.name
                          ? 'bg-ceylon-50 border-ceylon-500 text-ceylon-700'
                          : 'bg-white border-[#EBEBEA] text-[#6E6E6B] hover:border-slate-350'
                      }`}
                    >
                      <span className="text-xs font-bold flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5 text-ceylon-500" /> {item.name}
                      </span>
                      <span className="text-[9px] text-[#6E6E6B]/60 font-semibold mt-1">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-2 bg-black hover:bg-neutral-800 text-white font-bold text-sm rounded-xl transition-all duration-200 shadow-md"
              >
                {loading ? 'Creating Account...' : 'Complete Register'}
              </button>
            </form>
          </div>
        )}

        {/* Existing login link */}
        {step === 'identify' && (
          <div className="mt-6 text-center border-t border-[#EBEBEA] pt-4">
            <p className="text-[#6E6E6B] text-xs font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-ceylon-500 hover:text-ceylon-600 font-bold transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default RegisterPage;
