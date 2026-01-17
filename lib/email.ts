import nodemailer from 'nodemailer'

// Create transporter with Gmail SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

// Email templates
const emailTemplates = {
  taskAssigned: (data: { taskTitle: string; projectName: string; assignerName: string; link: string }) => ({
    subject: `New Task Assigned: ${data.taskTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(to right, #C10801, #F16001); padding: 20px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">New Task Assigned</h1>
        </div>
        <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="color: #374151; font-size: 16px; margin-bottom: 16px;">
            <strong>${data.assignerName}</strong> assigned you a new task in <strong>${data.projectName}</strong>:
          </p>
          <div style="background: white; padding: 16px; border-radius: 8px; border-left: 4px solid #E85002; margin-bottom: 20px;">
            <h2 style="color: #111827; margin: 0; font-size: 18px;">${data.taskTitle}</h2>
          </div>
          <a href="${data.link}" style="display: inline-block; background: linear-gradient(to right, #C10801, #F16001); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            View Task
          </a>
        </div>
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">
          Sent by Mew • <a href="${process.env.NEXTAUTH_URL}/settings/notifications" style="color: #E85002;">Manage notifications</a>
        </p>
      </div>
    `,
  }),

  taskDueSoon: (data: { taskTitle: string; projectName: string; dueDate: string; link: string }) => ({
    subject: `Task Due Soon: ${data.taskTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(to right, #C10801, #F16001); padding: 20px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">⏰ Task Due Soon</h1>
        </div>
        <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="color: #374151; font-size: 16px; margin-bottom: 16px;">
            Your task in <strong>${data.projectName}</strong> is due soon:
          </p>
          <div style="background: white; padding: 16px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 20px;">
            <h2 style="color: #111827; margin: 0 0 8px 0; font-size: 18px;">${data.taskTitle}</h2>
            <p style="color: #6b7280; margin: 0; font-size: 14px;">Due: ${data.dueDate}</p>
          </div>
          <a href="${data.link}" style="display: inline-block; background: linear-gradient(to right, #C10801, #F16001); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            View Task
          </a>
        </div>
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">
          Sent by Mew • <a href="${process.env.NEXTAUTH_URL}/settings/notifications" style="color: #E85002;">Manage notifications</a>
        </p>
      </div>
    `,
  }),

  taskOverdue: (data: { taskTitle: string; projectName: string; dueDate: string; link: string }) => ({
    subject: `⚠️ Task Overdue: ${data.taskTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(to right, #dc2626, #ef4444); padding: 20px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ Task Overdue</h1>
        </div>
        <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="color: #374151; font-size: 16px; margin-bottom: 16px;">
            Your task in <strong>${data.projectName}</strong> is overdue:
          </p>
          <div style="background: white; padding: 16px; border-radius: 8px; border-left: 4px solid #dc2626; margin-bottom: 20px;">
            <h2 style="color: #111827; margin: 0 0 8px 0; font-size: 18px;">${data.taskTitle}</h2>
            <p style="color: #dc2626; margin: 0; font-size: 14px;">Was due: ${data.dueDate}</p>
          </div>
          <a href="${data.link}" style="display: inline-block; background: linear-gradient(to right, #C10801, #F16001); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            View Task
          </a>
        </div>
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">
          Sent by Mew • <a href="${process.env.NEXTAUTH_URL}/settings/notifications" style="color: #E85002;">Manage notifications</a>
        </p>
      </div>
    `,
  }),

  projectInvitation: (data: { projectName: string; inviterName: string; inviteLink: string }) => ({
    subject: `You're invited to join ${data.projectName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(to right, #C10801, #F16001); padding: 20px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🎉 Project Invitation</h1>
        </div>
        <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
            <strong>${data.inviterName}</strong> has invited you to collaborate on <strong>${data.projectName}</strong>.
          </p>
          <a href="${data.inviteLink}" style="display: inline-block; background: linear-gradient(to right, #C10801, #F16001); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Accept Invitation
          </a>
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            This invitation will expire in 7 days.
          </p>
        </div>
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">
          Sent by Mew
        </p>
      </div>
    `,
  }),

  paymentSuccess: (data: { planName: string; amount: string; nextBillingDate: string }) => ({
    subject: `Payment Successful - ${data.planName} Plan`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(to right, #059669, #10b981); padding: 20px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">✓ Payment Successful</h1>
        </div>
        <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="color: #374151; font-size: 16px; margin-bottom: 16px;">
            Thank you for your payment! Your <strong>${data.planName}</strong> plan is now active.
          </p>
          <div style="background: white; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 14px;">Amount paid</p>
            <p style="color: #111827; margin: 0; font-size: 24px; font-weight: 600;">${data.amount}</p>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            Next billing date: ${data.nextBillingDate}
          </p>
          <a href="${process.env.NEXTAUTH_URL}/settings/billing" style="display: inline-block; background: linear-gradient(to right, #C10801, #F16001); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">
            View Billing
          </a>
        </div>
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">
          Sent by Mew
        </p>
      </div>
    `,
  }),

  welcomeEmail: (data: { userName: string }) => ({
    subject: `Welcome to Mew! 🎉`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(to right, #C10801, #F16001); padding: 30px 20px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 32px;">Welcome to Mew!</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your collaborative workspace awaits</p>
        </div>
        <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
            Hi ${data.userName}! 👋
          </p>
          <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
            Welcome to Mew - the modern workspace that combines task management, documentation, and visual collaboration all in one place.
          </p>
          <h3 style="color: #111827; font-size: 16px; margin-bottom: 12px;">Here's what you can do:</h3>
          <ul style="color: #374151; font-size: 14px; padding-left: 20px; margin-bottom: 20px;">
            <li style="margin-bottom: 8px;">📋 Create and manage tasks with your team</li>
            <li style="margin-bottom: 8px;">📝 Write beautiful documents together</li>
            <li style="margin-bottom: 8px;">🎨 Design diagrams and wireframes</li>
            <li style="margin-bottom: 8px;">🤖 Use AI to boost your productivity</li>
          </ul>
          <a href="${process.env.NEXTAUTH_URL}/dashboard" style="display: inline-block; background: linear-gradient(to right, #C10801, #F16001); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Go to Dashboard
          </a>
        </div>
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">
          Questions? Reply to this email or contact support.
        </p>
      </div>
    `,
  }),
}

// Send email function
export async function sendEmail(
  to: string,
  template: keyof typeof emailTemplates,
  data: Parameters<(typeof emailTemplates)[typeof template]>[0]
) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn('SMTP credentials not configured, skipping email')
    return { success: false, error: 'SMTP not configured' }
  }

  try {
    const emailContent = emailTemplates[template](data as any)

    await transporter.sendMail({
      from: `"Mew" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject: emailContent.subject,
      html: emailContent.html,
    })

    return { success: true }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error }
  }
}

// Verify SMTP connection
export async function verifyEmailConnection() {
  try {
    await transporter.verify()
    return true
  } catch (error) {
    console.error('SMTP connection failed:', error)
    return false
  }
}

export default transporter
