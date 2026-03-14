import nodemailer from 'nodemailer';

export const sendInviteEmail = async (email: string, token: string, name: string) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
    secure: false,
  });

  const inviteLink = `${process.env.NEXTAUTH_URL}/auth/set-password?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Welcome to Intern Management Platform - Set Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome, ${name}!</h2>
        <p>You have been invited to join the Intern Management Platform.</p>
        <p>Please click the button below to set your password and access your account:</p>
        <a href="${inviteLink}" style="display: inline-block; background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Set Password</a>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p>${inviteLink}</p>
        <p>This link will expire in 48 hours.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Invite email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending invite email:', error);
    return false;
  }
};
