# Supabase Dashboard Configuration Checklist

## ⚠️ CRITICAL: You MUST complete these steps for OAuth to work

### Step 1: Update URL Configuration

Go to: https://app.supabase.com/project/anaeyyikvoxwoefpxilf/auth/url-configuration

#### Site URL
```
http://localhost:3000
```

**For Production:** Update to your production domain
```
https://your-domain.vercel.app
```

#### Redirect URLs (Add ALL of these)

**For Local Development:**
```
http://localhost:3000/auth/callback
http://localhost:3000/*
```

**For Production:**
```
https://your-domain.vercel.app/auth/callback
https://your-domain.vercel.app/*
```

### Step 2: Configure Google OAuth

#### A. In Google Cloud Console

1. Go to: https://console.cloud.google.com/apis/credentials
2. Create or select your OAuth 2.0 Client ID
3. Under **Authorized redirect URIs**, add:
   ```
   https://anaeyyikvoxwoefpxilf.supabase.co/auth/v1/callback
   ```
4. Copy your **Client ID** and **Client Secret**

#### B. In Supabase Dashboard

1. Go to: https://app.supabase.com/project/anaeyyikvoxwoefpxilf/auth/providers
2. Find **Google** provider
3. Toggle **Enable Sign in with Google** to ON
4. Paste your **Client ID**
5. Paste your **Client Secret**
6. Click **Save**

### Step 3: Configure GitHub OAuth (Optional)

#### A. In GitHub Developer Settings

1. Go to: https://github.com/settings/developers
2. Click **New OAuth App** (or edit existing)
3. Fill in:
   - **Application name:** MicroSite Forge
   - **Homepage URL:** `http://localhost:3000` (or your production URL)
   - **Authorization callback URL:**
     ```
     https://anaeyyikvoxwoefpxilf.supabase.co/auth/v1/callback
     ```
4. Click **Register application**
5. Copy your **Client ID**
6. Generate and copy a **Client Secret**

#### B. In Supabase Dashboard

1. Go to: https://app.supabase.com/project/anaeyyikvoxwoefpxilf/auth/providers
2. Find **GitHub** provider
3. Toggle **Enable Sign in with GitHub** to ON
4. Paste your **Client ID**
5. Paste your **Client Secret**
6. Click **Save**

### Step 4: Configure Facebook OAuth (Optional)

#### A. In Facebook Developers

1. Go to: https://developers.facebook.com/apps
2. Create or select your app
3. Add **Facebook Login** product
4. Go to **Facebook Login** → **Settings**
5. Under **Valid OAuth Redirect URIs**, add:
   ```
   https://anaeyyikvoxwoefpxilf.supabase.co/auth/v1/callback
   ```
6. Save changes
7. Go to **Settings** → **Basic**
8. Copy your **App ID** and **App Secret**

#### B. In Supabase Dashboard

1. Go to: https://app.supabase.com/project/anaeyyikvoxwoefpxilf/auth/providers
2. Find **Facebook** provider
3. Toggle **Enable Sign in with Facebook** to ON
4. Paste your **App ID** as Client ID
5. Paste your **App Secret** as Client Secret
6. Click **Save**

## Verification Checklist

After configuration, verify:

- [ ] Site URL is set to `http://localhost:3000` (or production URL)
- [ ] Redirect URLs include `/auth/callback` for both local and production
- [ ] At least one OAuth provider is enabled (Google recommended)
- [ ] OAuth provider redirect URI is set to Supabase callback URL
- [ ] Client ID and Secret are correctly copied to Supabase
- [ ] Changes are saved in both provider console and Supabase

## Testing

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Test OAuth flow:**
   - Go to http://localhost:3000/auth/login
   - Click "Continue with Google" (or your configured provider)
   - Authorize the app
   - Should redirect to `/auth/callback` then `/dashboard`

3. **Check for errors:**
   - Open browser DevTools Console
   - Look for any error messages
   - Check terminal for `[Auth Callback]` logs

## Common Issues

### Issue: "Invalid redirect URL"
**Solution:** Add the redirect URL to Supabase Dashboard → URL Configuration → Redirect URLs

### Issue: "OAuth provider error"
**Solution:** Verify Client ID and Secret are correct in Supabase Dashboard

### Issue: Redirects to root with `?code=`
**Solution:** This is now handled automatically! The root page will redirect to `/auth/callback`

### Issue: "ERR_CONNECTION_REFUSED"
**Solution:** Make sure dev server is running: `npm run dev`

## Important Notes

### The Supabase Callback URL is ALWAYS:
```
https://anaeyyikvoxwoefpxilf.supabase.co/auth/v1/callback
```

This is the URL you configure in:
- Google Cloud Console
- GitHub Developer Settings
- Facebook Developer Console

**DO NOT** use `http://localhost:3000/auth/callback` in the OAuth provider settings!

### Your App's Callback URL is:
```
http://localhost:3000/auth/callback  (local)
https://your-domain.vercel.app/auth/callback  (production)
```

This is the URL you configure in:
- Supabase Dashboard → URL Configuration → Redirect URLs

### The Flow:
1. User clicks "Sign in with Google"
2. Redirects to Google for authorization
3. Google redirects to Supabase: `https://anaeyyikvoxwoefpxilf.supabase.co/auth/v1/callback?code=...`
4. Supabase processes the code and redirects to your app: `http://localhost:3000/auth/callback?code=...`
5. Your app exchanges the code for a session
6. User is redirected to dashboard

## Quick Links

- **Supabase Dashboard:** https://app.supabase.com/project/anaeyyikvoxwoefpxilf
- **URL Configuration:** https://app.supabase.com/project/anaeyyikvoxwoefpxilf/auth/url-configuration
- **Auth Providers:** https://app.supabase.com/project/anaeyyikvoxwoefpxilf/auth/providers
- **Auth Logs:** https://app.supabase.com/project/anaeyyikvoxwoefpxilf/logs/auth-logs

- **Google Cloud Console:** https://console.cloud.google.com/apis/credentials
- **GitHub Developer Settings:** https://github.com/settings/developers
- **Facebook Developers:** https://developers.facebook.com/apps

## Need Help?

See the detailed guide: `docs/AUTH_SETUP_GUIDE.md`

