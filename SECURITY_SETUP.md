# Security Setup Guide

This document outlines the security configuration and setup steps for Dream Ahead.

**Note:** The app uses Supabase for the Course Fit Test and CMS features. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `frontend/.env`. Auth and core user data are also handled by the backend API (MongoDB).

## ✅ Implemented Security Features

### 1. CSV Formula Injection Protection
- **Status**: ✅ Implemented
- **Location**: `frontend/src/lib/csvExport.ts`
- All CSV exports automatically sanitize dangerous characters (=, +, -, @) to prevent formula injection attacks

### 2. Server-Side Admin Validation
- **Status**: ✅ Implemented
- **Function**: `check_admin_status()` RPC
- All admin access is validated server-side through secure Supabase RPC functions

### 3. Safe Code Execution
- **Status**: ✅ Implemented
- **Location**: `frontend/src/lib/sheetUtils.ts`
- Uses `expr-eval` library for safe expression evaluation, eliminating arbitrary code execution risks

### 4. Phone Number Validation
- **Status**: ✅ Implemented
- **Location**: `frontend/src/pages/Auth.tsx`, `frontend/src/lib/validationSchemas.ts`
- Validates Indian mobile format (must start with 6-9, rejects repeated digits)

### 5. External Data Validation
- **Status**: ✅ Implemented
- **Location**: `frontend/src/lib/sheetValidation.ts`
- All Google Sheets data is validated with Zod schemas and sanitized before use

### 6. Supabase Storage for Avatars
- **Status**: ✅ Implemented
- **Bucket**: `avatars`
- Profile images now stored in Supabase Storage with proper RLS policies instead of base64 in database

### 7. Role-Based Access Control
- **Status**: ✅ Implemented
- **Tables**: `user_roles` with proper RLS policies
- Uses security definer functions to prevent privilege escalation

---

## ⚠️ Manual Configuration Required

### 1. Enable Leaked Password Protection

**Priority**: MEDIUM  
**Action Required**: Manual configuration in Lovable Cloud dashboard

**Steps**:
1. Open the backend dashboard
2. Navigate to Authentication → Policies
3. Enable "Leaked Password Protection"

This prevents users from using passwords that have been exposed in data breaches.

**Reference**: [Supabase Password Security Docs](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)

---

### 2. Create Admin Users

**Priority**: HIGH  
**Status**: ✅ **COMPLETED**

**Current Admin User**:
- **Email**: `saravank45@gmail.com`
- **User ID**: `6c8788eb-0ee4-441d-a4de-a164e9ea9ed4`
- **Role**: `admin`
- **Created**: 2025-10-22

**Access**:
Log in with `saravank45@gmail.com` and navigate to `/admin` to access the admin panel.

**To Add More Admin Users**:

1. Open the Lovable Cloud backend dashboard
2. Navigate to the SQL Editor
3. Run the following query:

```sql
-- First, get the user ID
SELECT id, email FROM auth.users WHERE email = 'new-admin@example.com';

-- Then assign admin role (replace UUID)
INSERT INTO public.user_roles (user_id, role)
VALUES ('user-uuid-here', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

**Verification**:
```sql
SELECT ur.id, ur.role, u.email, u.phone
FROM public.user_roles ur
JOIN auth.users u ON u.id = ur.user_id
WHERE ur.role = 'admin';
```

---

### 3. Implement Production OTP Validation

**Priority**: 🔴 CRITICAL (Before Production)  
**Status**: ⚠️ Currently using test OTP "1234"

**Current State**:
- The app uses a hardcoded test OTP (`1234`) for development
- This is validated **client-side only** and creates a security vulnerability
- Temporary credentials pattern is predictable

**What Needs to be Done**:

#### Option A: Supabase Phone Auth (Recommended)

1. **Configure SMS Provider** in Lovable Cloud:
   - Open backend dashboard
   - Navigate to Authentication → Providers
   - Enable Phone authentication
   - Configure SMS provider (Twilio, MessageBird, or Vonage)
   - Add API credentials

2. **Update Auth.tsx** to use real phone auth:

```typescript
// Replace handleSendOTP
const handleSendOTP = async () => {
  const formatted = formatPhoneForSupabase(phone);
  
  const { error } = await supabase.auth.signInWithOtp({
    phone: formatted,
    options: {
      channel: 'sms'
    }
  });
  
  if (error) throw error;
  setAuthStep('otp');
};

// Replace handleVerifyOTP
const handleVerifyOTP = async () => {
  const formatted = formatPhoneForSupabase(phone);
  
  const { data, error } = await supabase.auth.verifyOtp({
    phone: formatted,
    token: otp,
    type: 'sms'
  });
  
  if (error) throw error;
  
  // Handle successful authentication
  if (data.user) {
    // Create/update profile
    // Redirect to dashboard
  }
};
```

3. **Remove temporary credential creation** entirely

#### Option B: Edge Function with Custom SMS Provider

If you want more control or use a different SMS provider:

1. Create an Edge Function for OTP generation and verification
2. Store OTPs securely with expiration timestamps
3. Implement rate limiting server-side
4. Use the existing database fields (`otp_attempts`, `last_otp_sent_at`)

**Security Concerns with Current Implementation**:
- ❌ Client-side validation can be bypassed in browser DevTools
- ❌ Predictable credential pattern allows account takeover
- ❌ No server-side rate limiting enforcement
- ❌ Anyone can impersonate any user if they know their phone number

**Before Going to Production**:
- [ ] Configure SMS provider in Lovable Cloud
- [ ] Implement real OTP sending and verification
- [ ] Remove hardcoded test OTP
- [ ] Test with real phone numbers
- [ ] Implement server-side rate limiting

---

## 🔒 Security Checklist

### Authentication & Authorization
- [x] Server-side admin role validation
- [x] Role-based access control with RLS
- [x] Security definer functions for privilege checks
- [ ] **Production OTP validation** (⚠️ CRITICAL - use test mode for dev only)
- [ ] **Leaked password protection enabled** (⚠️ Manual step required)
- [x] Phone number format validation

### Data Protection
- [x] CSV formula injection protection
- [x] Input validation with Zod schemas
- [x] External data sanitization (Google Sheets)
- [x] Supabase Storage with RLS policies
- [x] Safe expression evaluation (no code injection)

### Database Security
- [x] Row-Level Security enabled on all tables
- [x] Proper foreign key relationships
- [x] Security definer functions to prevent recursion
- [x] Separate user_roles table (no roles on profiles)

### Operational Security
- [x] **Create admin users** (✅ Admin user created: saravank45@gmail.com)
- [x] Profile images in storage (not base64 in DB)
- [x] Obsolete column references removed
- [x] Storage bucket RLS policies configured

---

## 📚 Additional Resources

- [Lovable Security Documentation](https://docs.lovable.dev/features/security)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage Security](https://supabase.com/docs/guides/storage/security/access-control)
- [Input Validation Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)

---

## 🚨 Before Deploying to Production

1. ✅ Review all security fixes applied
2. ⚠️ Enable leaked password protection in dashboard
3. ✅ Create at least one admin user (saravank45@gmail.com)
4. 🔴 **CRITICAL**: Implement production OTP validation
5. ✅ Test admin panel access (ready to test with admin user)
6. ✅ Test CSV exports (verify no formula execution)
7. ✅ Test profile image uploads to storage
8. ✅ Verify Google Sheets data sanitization
9. Run security scan and confirm 0 critical issues

---

## Contact & Support

For security concerns or questions:
- Review security scan results in Lovable dashboard
- Check [Lovable Discord community](https://discord.com/channels/1119885301872070706/1280461670979993613)
- Consult [Lovable documentation](https://docs.lovable.dev/)
