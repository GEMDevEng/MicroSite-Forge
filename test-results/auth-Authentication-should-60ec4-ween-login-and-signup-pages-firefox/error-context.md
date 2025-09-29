# Page snapshot

```yaml
- generic [active] [ref=e1]:
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
        - textbox "Email" [ref=e12]
      - generic [ref=e13]:
        - generic [ref=e14]: Password
        - textbox "Password" [ref=e15]
      - generic [ref=e20]: Or continue with
      - generic [ref=e21]:
        - button "Google" [ref=e22] [cursor=pointer]:
          - img [ref=e23] [cursor=pointer]
          - generic [ref=e28] [cursor=pointer]: Google
        - button "Facebook" [ref=e29] [cursor=pointer]:
          - img [ref=e30] [cursor=pointer]
          - generic [ref=e32] [cursor=pointer]: Facebook
        - button "GitHub" [ref=e33] [cursor=pointer]:
          - img [ref=e34] [cursor=pointer]
          - generic [ref=e36] [cursor=pointer]: GitHub
      - paragraph [ref=e38]: Use the same method you used to sign up (email/password or Google).
      - button "Sign in" [ref=e39] [cursor=pointer]
      - link "Forgot your password?" [ref=e41] [cursor=pointer]:
        - /url: /auth/forgot-password
  - button "Open Next.js Dev Tools" [ref=e47] [cursor=pointer]:
    - img [ref=e48] [cursor=pointer]
  - alert [ref=e52]
```