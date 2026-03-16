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

export const sendTaskAssignedEmail = async (
  internEmail: string,
  internName: string,
  taskTitle: string,
  taskLink: string
) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: internEmail,
    subject: `New Task Assigned: ${taskTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #0070f3;">New Task Assigned</h2>
        <p>Hello ${internName},</p>
        <p>A new task <strong>"${taskTitle}"</strong> has been assigned to you.</p>
        <p>Please review the details and start working on it.</p>
        
        <a href="${taskLink}" style="display: inline-block; background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0;">View Task</a>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Task notification sent to ${internEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending task notification:', error);
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
  const statusColor = status === 'APPROVED' ? '#10b981' : '#ef4444';
  const statusText = status === 'APPROVED' ? 'Approved' : 'Needs Rework';

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: internEmail,
    subject: `Task Review Update: ${taskTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #0070f3;">Task Submitted Review</h2>
        <p>Hello ${internName},</p>
        <p>Your submission for <strong>"${taskTitle}"</strong> has been reviewed.</p>
        
        <div style="background-color: #f8f9fa; border-left: 4px solid ${statusColor}; padding: 15px; margin: 20px 0;">
           <h3 style="margin-top: 0; color: ${statusColor};">${statusText}</h3>
           ${feedback ? `<p><strong>Feedback:</strong> ${feedback}</p>` : ''}
        </div>
        
        <p>Please log in to your dashboard to view full details.</p>
        <a href="${process.env.NEXTAUTH_URL}/dashboard" style="display: inline-block; background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0;">Go to Dashboard</a>
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

export const sendCertificateEmail = async (
    internEmail: string,
    internName: string,
    pdfBuffer: Buffer
) => {
    const transporter = createTransporter();
    
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: internEmail,
        subject: 'Your Internship Certificate',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <h2 style="color: #0070f3;">Congratulations, ${internName}!</h2>
                <p>We are pleased to inform you that you have successfully completed the internship program.</p>
                <p>Please find your official Certificate of Completion attached to this email.</p>
                <p>We wish you all the best in your future endeavors!</p>
            </div>
        `,
        attachments: [
            {
                filename: `Internship_Certificate_${internName.replace(/\s+/g, '_')}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf'
            }
        ]
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Certificate email sent to ${internEmail}`);
        return true;
    } catch (error) {
        console.error('Error sending certificate email:', error);
        return false;
    }
};