# OAuth Authentication Setup Guide

This guide will help you configure OAuth authentication with Google, Apple, and Facebook using Supabase for MicroSite Forge.

## 📋 Prerequisites

- A Supabase project (already configured)
- Developer accounts for each OAuth provider you want to enable

## 🔐 Google OAuth Setup

### 1. Google Cloud Console Setup

1. **Visit Google Cloud Console**: https://console.cloud.google.com/
2. **Create or select a project**
3. **Enable APIs**:
   - Navigate to "APIs & Services" → "Library"
   - Search for and enable "Google+ API" (required for OAuth)
4. **Configure OAuth consent screen**:
   - Go to "OAuth consent screen"
   - Choose "External" user type
   - Fill out app name, logo, and homepage URL
   - Add authorized domains (your domain)
   - Add scopes: `email`, `profile`, `openid`

### 2. Create OAuth Credentials

1. **Go to Credentials section**
2. **Click "+ CREATE CREDENTIALS"** → **OAuth 2.0 Client IDs**
3. **Configure the OAuth client**:
   - **Application type**: "Web application"
   - **Name**: Something descriptive like "MicroSite Forge"
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (development)
     - `https://your-domain.com` (production)
   - **Authorized redirect URIs**:
     - `https://your-project.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (for development if using redirect flow)

### 3. Get Credentials
- Copy the **Client ID** and **Client Secret**

## 🍎 Apple Sign-In Setup

### 1. Apple Developer Portal

1. **Visit Apple Developer**: https://developer.apple.com/account/
2. **Ensure you have a paid Apple Developer Program membership** ($99/year)
3. **Navigate to "Certificates, Identifiers & Profiles"**

### 2. Create App ID

1. **Go to "Identifiers" → "+" button**
2. **Select "App IDs"** → **Continue**
3. **Choose your app type** (iOS, macOS, etc.) or create a Website app
4. **Configure the App ID**:
   - **Bundle ID**: Your app's bundle identifier
   - **Description**: Description of your app
   - **Enable "Sign In with Apple"** capability

### 3. Create Service ID

1. **In Identifiers section, click "+" again**
2. **Select "Services IDs"** → **Continue**
3. **Configure Service ID**:
   - **Identifier**: Your service ID (e.g., `com.micrositeforge.app`)
   - **Description**: "Sign In with Apple for MicroSite Forge"
   - **Enable "Sign In with Apple"**

### 4. Configure Sign In with Apple

1. **Click on your Service ID** to edit
2. **Configure domains** (your website domains)
3. **Add return URLs**:
   - `https://your-project.supabase.co/auth/v1/callback`

### 5. Generate Private Key

1. **Go to "Keys" section** → **"+" button**
2. **Create a new key**:
   - **Key Name**: "MicroSite Forge Sign In"
   - **Enable "Sign In with Apple"**
3. **Download the .p8 file** (keep this secure!)

### 6. Get Required Values

Copy these values for Supabase configuration:
- **Team ID**: From your developer account
- **Client ID**: Your Service ID
- **Key ID**: Generated along with the key
- **Private Key**: Contents of the downloaded .p8 file

## 📘 Facebook Login Setup

### 1. Facebook Developers

1. **Visit Facebook Developers**: https://developers.facebook.com/
2. **Click "My Apps"** → **"Create App"**
3. **Choose app type**:
   - **Consumer**: For general use
   - **Business**: For business use

### 2. Configure App

1. **App Name**: "MicroSite Forge" (or your preferred name)
2. **App Contact Email**: Your email
3. **Business Account**: Link to your business account if applicable

### 3. Add Facebook Login Product

1. **From your app dashboard** → **"Add Product"**
2. **Find and click "Facebook Login"** → **"Set Up"**
3. **Choose platform**: "Website"
4. **Site URL**: Your website URL

### 4. Configure OAuth Settings

1. **Go to Facebook Login settings**
2. **Add Valid OAuth Redirect URIs**:
   - `https://your-project.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (for development)

### 5. Get Credentials

1. **Go to Settings** → **Basic**
2. **Copy App ID and App Secret**
3. **Note**: App Secret is sensitive - keep it secure!

## 🔧 Supabase Configuration

### Enable OAuth Providers

1. **Go to your Supabase project dashboard**
2. **Navigate to "Authentication"** → **"Providers"**
3. **Enable each provider you want to support**:

#### Google Configuration
- **Provider**: Google
- **Client ID**: Your Google OAuth client ID
- **Client Secret**: Your Google OAuth client secret

#### Apple Configuration
- **Provider**: Apple
- **Client ID**: Your Apple Service ID
- **Team ID**: Your Apple Developer Team ID
- **Key ID**: Your Apple private key ID
- **Private Key**: Contents of your Apple .p8 key file

#### Facebook Configuration
- **Provider**: Facebook
- **Client ID**: Your Facebook App ID
- **Client Secret**: Your Facebook App Secret

### Additional Settings

For each provider, you can configure:
- **Redirect URLs**: Should automatically include your Supabase callback
- **Enable provider**: Toggle on/off
- **Additional scopes**: Add custom OAuth scopes if needed

## 🧪 Testing OAuth

### Development Setup

1. **Environment Variables**: Add to `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

2. **Start development server**:
```bash
npm run dev
```

3. **Test authentication**:
   - Navigate to `http://localhost:3000/auth/login`
   - Click on OAuth provider buttons
   - Should redirect to provider's login page
   - After successful auth, redirect back to your app

### Production Testing

- Deploy your app to production
- Update provider settings with production URLs
- Test OAuth flow in production environment
- Verify callback URLs work correctly

## 🔍 Troubleshooting

### Common Issues

#### 1. "Invalid OAuth access token" Error
**Cause**: Callback URL mismatch
**Solution**: Ensure `https://your-project.supabase.co/auth/v1/callback` is added to all provider settings

#### 2. "OAuth provider not enabled" Error
**Cause**: Provider not enabled in Supabase
**Solution**: Go to Supabase dashboard → Auth → Providers → Enable the provider

#### 3. "Popup blocked" Error
**Cause**: Browser blocks OAuth popup
**Solutions**:
- Use redirect flow instead of popup
- Allow popups for your domain
- Handle popup blocking gracefully in your code

#### 4. "Team ID mismatch" (Apple)
**Cause**: Wrong Apple Team ID used
**Solution**: Double-check your Apple Developer Team ID in Supabase settings

#### 5. "App not approved" (Facebook)
**Cause**: Facebook app not in live mode
**Solution**: Submit app for review or keep in development mode for testing

### Provider-Specific Issues

#### Google OAuth
- **403: access_denied**: Check OAuth consent screen configuration
- **Invalid client**: Verify client ID is correct
- **Redirect URI**: Ensure redirect URIs match exactly

#### Apple Sign-In
- **invalid_client**: Check Service ID, Team ID, and private key
- **invalid_scope**: Ensure Sign In with Apple capability is enabled

#### Facebook Login
- **Invalid redirect_uri**: Ensure OAuth redirect URI matches exactly
- **App not live**: Keep app in development mode during testing

### Debug Tips

1. **Check Supabase Auth logs**:
   - Go to Supabase dashboard → Logs → Authentication
   - Look for OAuth-related errors and events

2. **Browser developer tools**:
   - Check Network tab for failed OAuth requests
   - Look at Console for JavaScript errors

3. **Test provider OAuth directly**:
   - Use provider's OAuth playground/debug tools
   - Verify credentials work independently of your app

## 🔒 Security Best Practices

### Credential Security
- **Never commit secrets**: Keep all OAuth credentials in environment variables
- **Use environment-specific keys**: Different credentials for development/production
- **Rotate credentials regularly**: Especially for production environments

### User Data Handling
- **Minimal scope requests**: Only request necessary OAuth scopes
- **Secure token storage**: Supabase handles this securely, but verify implementation
- **Data privacy compliance**: Ensure compliance with GDPR, CCPA, etc.

### Provider-Specific Security
- **Google**: Use Google Identity Platform for advanced security features
- **Apple**: Apple's Sign In with Apple provides privacy-focused authentication
- **Facebook**: Implement Facebook's advanced security features for enterprise use

## 🚀 Production Deployment

### Environment Variables
```bash
# Required for all providers
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional - for additional OAuth configuration
GOOGLE_CLIENT_ID=your-google-client-id
APPLE_CLIENT_ID=your-apple-service-id
FACEBOOK_APP_ID=your-facebook-app-id
```

### Production Considerations
- **SSL/HTTPS required**: OAuth providers require HTTPS in production
- **Domain verification**: Some providers require domain verification
- **App review**: Facebook and Apple may require app review for production use
- **Rate limits**: Monitor OAuth provider rate limits

## 📞 Support

If you encounter issues:
1. **Check Supabase documentation**: https://supabase.com/docs/guides/auth/social-login
2. **Provider documentation**:
   - Google: https://developers.google.com/identity/protocols/oauth2
   - Apple: https://developer.apple.com/sign-in-with-apple/
   - Facebook: https://developers.facebook.com/docs/facebook-login
3. **Create an issue**: Report issues in the MicroSite Forge repository

---

**Note**: OAuth setup requires you to have active developer accounts with each provider and may involve verification processes. Some features like Apple Sign-In require paid developer accounts ($99/year).
