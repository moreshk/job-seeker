export const verificationEmail = (verificationLink: string) => `
<!DOCTYPE html>
<html>
  <body>
    <h1>Verify your email</h1>
    <p>Click the link below to verify your email address:</p>
    <a href="${verificationLink}">Verify Email</a>
    <p>If you didn't request this, please ignore this email.</p>
  </body>
</html>
`;

export const resetPasswordEmail = (resetLink: string) => `
<!DOCTYPE html>
<html>
  <body>
    <h1>Reset Your Password</h1>
    <p>Click the link below to reset your password:</p>
    <a href="${resetLink}">Reset Password</a>
    <p>If you didn't request this, please ignore this email.</p>
  </body>
</html>
`; 