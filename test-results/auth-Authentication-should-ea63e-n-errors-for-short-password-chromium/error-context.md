# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - heading "Sign in to your account" [level=1] [ref=e6]
      - paragraph [ref=e7]:
        - text: Don't have an account?
        - link "Sign up" [ref=e8] [cursor=pointer]:
          - /url: /auth/signup
    - generic [ref=e9]:
      - generic [ref=e10]:
        - generic [ref=e11]: Email
        - textbox "Email" [ref=e12]: test@example.com
      - generic [ref=e13]:
        - generic [ref=e14]: Password
        - textbox "Password" [active] [ref=e15]: "123"
        - paragraph [ref=e16]: Password must be at least 6 characters
      - generic [ref=e21]: Or continue with
      - generic [ref=e22]:
        - button "Google" [ref=e23] [cursor=pointer]:
          - img [ref=e24] [cursor=pointer]
          - generic [ref=e29] [cursor=pointer]: Google
        - button "Facebook" [ref=e30] [cursor=pointer]:
          - img [ref=e31] [cursor=pointer]
          - generic [ref=e33] [cursor=pointer]: Facebook
        - button "GitHub" [ref=e34] [cursor=pointer]:
          - img [ref=e35] [cursor=pointer]
          - generic [ref=e37] [cursor=pointer]: GitHub
      - paragraph [ref=e39]: Use the same method you used to sign up (email/password or Google).
      - button "Sign in" [ref=e40] [cursor=pointer]
      - link "Forgot your password?" [ref=e42] [cursor=pointer]:
        - /url: /auth/forgot-password
  - button "Open Next.js Dev Tools" [ref=e48] [cursor=pointer]:
    - img [ref=e49] [cursor=pointer]
  - alert [ref=e52]
```