import nodemailer from 'nodemailer';

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
    secure: false,
  });
};

export const sendInviteEmail = async (email: string, token: string, name: string) => {
  const transporter = createTransporter();
  const inviteLink = `${process.env.NEXTAUTH_URL}/auth/set-password?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Welcome to Intern Management Platform - Set Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #0070f3;">Welcome, ${name}!</h2>
        <p>You have been invited to join the Intern Management Platform.</p>
        <p>Please click the button below to set your password and access your account:</p>
        <a href="${inviteLink}" style="display: inline-block; background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0;">Set Password</a>
        <p style="font-size: 0.9em; color: #666;">If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="background: #f5f5f5; padding: 10px; border-radius: 4px; font-family: monospace; word-break: break-all;">${inviteLink}</p>
        <p style="font-size: 0.8em; color: #999; margin-top: 30px;">This link will expire in 48 hours for security reasons.</p>
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

export const sendReportNotificationEmail = async (
  mentorEmail: string, 
  internName: string, 
  weekNumber: number,
  reportLink: string
) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: mentorEmail,
    subject: `New Weekly Report: ${internName} (Week ${weekNumber})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #0070f3;">New Weekly Report Submitted</h2>
        <p><strong>${internName}</strong> has submitted their weekly report for <strong>Week ${weekNumber}</strong>.</p>
        
        <p>Please review their progress, tasks worked on, and provide feedback.</p>
        
        <a href="${reportLink}" style="display: inline-block; background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0;">Review Report</a>
        
        <p style="font-size: 0.9em; color: #666;">Or view directly at:</p>
        <p style="background: #f5f5f5; padding: 10px; border-radius: 4px; font-family: monospace; word-break: break-all;">${reportLink}</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Report notification sent to ${mentorEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending report notification:', error);
    return false;
  }
};

export const sendEvaluationNotificationEmail = async (
  internEmail: string,
  internName: string,
  evaluationLink: string
) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: internEmail,
    subject: 'Your Internship Evaluation is Ready',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #0070f3;">Evaluation Completed</h2>
        <p>Hello ${internName},</p>
        <p>Your mentor has completed your final internship evaluation.</p>
        <p>You can view your performance feedback and score by logging into your dashboard.</p>
        
        <a href="${evaluationLink}" style="display: inline-block; background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0;">View Evaluation</a>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Evaluation notification sent to ${internEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending evaluation notification:', error);
    return false;
  }
};

export const sendTaskGradedNotification = async (
  internEmail: string,
  internName: string,
  taskTitle: string,
  status: string,
  feedback?: string
) => {
  const transporter = createTransporter();
  
  const statusColor = status === 'APPROVED' ? '#10B981' : '#F59E0B';

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: internEmail,
    subject: `Task Review Update: ${taskTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #0070f3;">Task Submission Reviewed</h2>
        <p>Hello ${internName},</p>
        <p>Your submission for <strong>${taskTitle}</strong> has been reviewed.</p>
        
        <div style="padding: 15px; border-left: 4px solid ${statusColor}; background: #f9f9f9; margin: 20px 0;">
           <p style="margin: 0; font-weight: bold; color: ${statusColor};">Status: ${status}</p>
           ${feedback ? `<p style="margin: 10px 0 0 0;">Feedback: "${feedback}"</p>` : ''}
        </div>

        <p>Log in to your dashboard to view details or resubmit if required.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Task graded notification sent to ${internEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending task graded notification:', error);
    return false;
  }
};
