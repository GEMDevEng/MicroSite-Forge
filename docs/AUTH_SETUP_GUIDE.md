# Authentication Setup Guide

This guide will help you fix OAuth authentication issues and properly configure your authentication flow.

## Common Issues and Solutions

### Issue 1: OAuth Redirects to Root URL with `?code=` Parameter

**Symptoms:**
- After OAuth sign-in (Google, GitHub, Facebook), you're redirected to `http://localhost:3000/?code=...`
- You see `ERR_CONNECTION_REFUSED` or the code isn't processed
- The callback handler at `/auth/callback` is never reached

**Root Cause:**
The OAuth provider's redirect URI is misconfigured in the Supabase dashboard.

**Solution:**

#### Step 1: Update Supabase Dashboard Configuration

1. Go to your Supabase Dashboard: https://app.supabase.com/project/anaeyyikvoxwoefpxilf
2. Navigate to **Authentication** → **URL Configuration**
3. Update the following settings:

   **Site URL:**
   ```
   http://localhost:3000
   ```

   **Redirect URLs:** (Add all of these)
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000/*
   https://your-vercel-app.vercel.app/auth/callback
   https://your-vercel-app.vercel.app/*
   ```

4. Click **Save**

#### Step 2: Configure OAuth Providers

For each OAuth provider you want to use:

##### Google OAuth Setup

1. In Supabase Dashboard → **Authentication** → **Providers** → **Google**
2. Enable Google provider
3. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
4. Create or edit your OAuth 2.0 Client ID
5. Under **Authorized redirect URIs**, add:
   ```
   https://anaeyyikvoxwoefpxilf.supabase.co/auth/v1/callback
   ```
6. Copy the **Client ID** and **Client Secret** to Supabase
7. Save in Supabase Dashboard

##### GitHub OAuth Setup

1. In Supabase Dashboard → **Authentication** → **Providers** → **GitHub**
2. Enable GitHub provider
3. Go to [GitHub Developer Settings](https://github.com/settings/developers)
4. Create a new OAuth App or edit existing
5. Set **Authorization callback URL** to:
   ```
   https://anaeyyikvoxwoefpxilf.supabase.co/auth/v1/callback
   ```
6. Copy the **Client ID** and **Client Secret** to Supabase
7. Save in Supabase Dashboard

##### Facebook OAuth Setup

1. In Supabase Dashboard → **Authentication** → **Providers** → **Facebook**
2. Enable Facebook provider
3. Go to [Facebook Developers](https://developers.facebook.com/apps)
4. Create or edit your app
5. Add **Facebook Login** product
6. Under **Valid OAuth Redirect URIs**, add:
   ```
   https://anaeyyikvoxwoefpxilf.supabase.co/auth/v1/callback
   ```
7. Copy the **App ID** and **App Secret** to Supabase
8. Save in Supabase Dashboard

#### Step 3: Verify Environment Variables

Ensure your `.env.local` file has:

```bash
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="MicroSite Forge"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://anaeyyikvoxwoefpxilf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Auth Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# AI APIs
GROK_API_KEY=your_grok_api_key
```

### Issue 2: Local Development Server Not Running

**Symptoms:**
- `ERR_CONNECTION_REFUSED` when accessing `http://localhost:3000`
- OAuth redirect fails because nothing is listening on port 3000

**Solution:**

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **If port 3000 is already in use:**
   ```bash
   # Find and kill the process using port 3000
   lsof -ti:3000 | xargs kill -9
   
   # Or use a different port
   PORT=3001 npm run dev
   ```
   
   If using a different port, update all redirect URIs accordingly.

3. **Verify the server is running:**
   - Open http://localhost:3000 in your browser
   - You should see the MicroSite Forge homepage

### Issue 3: Session Not Persisting After OAuth

**Symptoms:**
- OAuth completes successfully
- You're redirected to `/dashboard`
- But you're immediately logged out or redirected back to login

**Solution:**

This is usually a cookie issue. Check:

1. **Browser Settings:**
   - Ensure cookies are enabled
   - Clear browser cache and cookies for localhost
   - Try in incognito/private mode

2. **HTTPS in Production:**
   - Ensure your production URL uses HTTPS
   - Update Supabase Site URL to use HTTPS in production

3. **Cookie Configuration:**
   - The app uses Supabase SSR which handles cookies automatically
   - Ensure middleware.ts is not blocking auth routes

## Testing Your Setup

### Test Local OAuth Flow

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Clear browser data:**
   - Clear cookies and cache for localhost
   - Or use incognito mode

3. **Test Google Sign-In:**
   - Go to http://localhost:3000/auth/login
   - Click "Continue with Google"
   - Authorize the app
   - You should be redirected to `/auth/callback` (briefly)
   - Then redirected to `/dashboard`

4. **Verify session:**
   - Check browser DevTools → Application → Cookies
   - You should see Supabase auth cookies
   - Refresh the page - you should stay logged in

### Test Production OAuth Flow

1. **Deploy to Vercel:**
   ```bash
   git push origin main
   ```

2. **Update Supabase URLs:**
   - Add your Vercel URL to Redirect URLs in Supabase Dashboard
   - Format: `https://your-app.vercel.app/auth/callback`

3. **Test on production:**
   - Visit your Vercel URL
   - Try OAuth sign-in
   - Should work the same as local

## Troubleshooting

### Debug OAuth Flow

1. **Check browser console:**
   ```javascript
   // Open DevTools Console
   // Look for auth errors
   ```

2. **Check Network tab:**
   - Filter by "auth"
   - Look for failed requests
   - Check redirect chain

3. **Check Supabase logs:**
   - Go to Supabase Dashboard → Logs → Auth Logs
   - Look for failed auth attempts
   - Check error messages

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `Invalid redirect URL` | Redirect URL not in Supabase allowlist | Add URL to Supabase Dashboard → Authentication → URL Configuration |
| `OAuth provider error` | Provider credentials incorrect | Verify Client ID/Secret in Supabase Dashboard |
| `Session not found` | Cookies not set/cleared | Clear browser cookies, check cookie settings |
| `ERR_CONNECTION_REFUSED` | Dev server not running | Run `npm run dev` |
| `Code exchange failed` | Callback handler error | Check `/api/auth/callback/route.ts` logs |

### Still Having Issues?

1. **Check the callback handler logs:**
   ```bash
   # Terminal running npm run dev will show server logs
   # Look for errors in /api/auth/callback
   ```

2. **Verify Supabase configuration:**
   ```bash
   # Check if Supabase is accessible
   curl https://anaeyyikvoxwoefpxilf.supabase.co/rest/v1/
   ```

3. **Test with email/password first:**
   - If OAuth is failing, try email/password sign-in
   - This helps isolate if it's an OAuth-specific issue

4. **Check middleware:**
   - Ensure `middleware.ts` isn't blocking auth routes
   - Auth routes should be excluded from auth checks

## Production Deployment Checklist

Before deploying to production:

- [ ] Update Supabase Site URL to production domain
- [ ] Add production redirect URLs to Supabase
- [ ] Update OAuth provider redirect URIs to production
- [ ] Set `NEXT_PUBLIC_SITE_URL` in Vercel environment variables
- [ ] Test OAuth flow on production URL
- [ ] Verify session persistence on production
- [ ] Check that cookies are set with secure flag in production

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase OAuth Guide](https://supabase.com/docs/guides/auth/social-login)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
- [Supabase SSR Guide](https://supabase.com/docs/guides/auth/server-side-rendering)

