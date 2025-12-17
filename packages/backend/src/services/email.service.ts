import nodemailer, { Transporter } from 'nodemailer';

class EmailService {
  private transporter: Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const emailConfig = {
      host: process.env.SMTP_HOST || 'smtp.zoho.com',
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    };

    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      console.warn('⚠️ Email credentials not configured. Email sending will be disabled.');
      return;
    }

    this.transporter = nodemailer.createTransport(emailConfig);
    console.log('✅ Email service initialized');
  }

  /**
   * Generate a random 6-digit verification code
   */
  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send verification email with 6-digit code
   */
  async sendVerificationEmail(email: string, code: string, username: string): Promise<boolean> {
    if (!this.transporter) {
      console.error('❌ Email transporter not initialized');
      return false;
    }

    try {
      const mailOptions = {
        from: `"Kinna" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Verify Your Kinna Account',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
              }
              .content {
                background: #f9f9f9;
                padding: 30px;
                border-radius: 0 0 10px 10px;
              }
              .code-box {
                background: white;
                border: 2px dashed #667eea;
                padding: 20px;
                margin: 20px 0;
                text-align: center;
                border-radius: 8px;
              }
              .code {
                font-size: 32px;
                font-weight: bold;
                color: #667eea;
                letter-spacing: 8px;
                font-family: 'Courier New', monospace;
              }
              .footer {
                text-align: center;
                margin-top: 20px;
                color: #666;
                font-size: 12px;
              }
              .warning {
                background: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 12px;
                margin: 20px 0;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Welcome to Kinna! 📚</h1>
            </div>
            <div class="content">
              <h2>Hello ${username}!</h2>
              <p>Thank you for joining Kinna, the book lovers' community. To complete your registration, please verify your email address using the code below:</p>
              
              <div class="code-box">
                <div class="code">${code}</div>
              </div>
              
              <div class="warning">
                ⏱️ <strong>This code will expire in 15 minutes.</strong>
              </div>
              
              <p>Enter this code on the verification page to activate your account and start connecting with fellow book enthusiasts!</p>
              
              <p>If you didn't create an account with Kinna, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Kinna - Book Lovers Community</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </body>
          </html>
        `,
        text: `
Welcome to Kinna!

Hello ${username},

Thank you for joining Kinna. Please use the following code to verify your email address:

Verification Code: ${code}

This code will expire in 15 minutes.

If you didn't create an account with Kinna, please ignore this email.

© ${new Date().getFullYear()} Kinna - Book Lovers Community
        `.trim(),
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Verification email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ Error sending verification email:', error);
      return false;
    }
  }

  /**
   * Send welcome email after successful verification
   */
  async sendWelcomeEmail(email: string, username: string): Promise<boolean> {
    if (!this.transporter) {
      console.error('❌ Email transporter not initialized');
      return false;
    }

    try {
      const mailOptions = {
        from: `"Kinna" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Welcome to Kinna! 🎉',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
              }
              .content {
                background: #f9f9f9;
                padding: 30px;
                border-radius: 0 0 10px 10px;
              }
              .feature {
                background: white;
                padding: 15px;
                margin: 10px 0;
                border-left: 4px solid #667eea;
                border-radius: 4px;
              }
              .footer {
                text-align: center;
                margin-top: 20px;
                color: #666;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🎉 You're All Set! 🎉</h1>
            </div>
            <div class="content">
              <h2>Welcome to Kinna, ${username}!</h2>
              <p>Your email has been verified successfully! You're now part of our vibrant community of book lovers.</p>
              
              <h3>Here's what you can do now:</h3>
              
              <div class="feature">
                📚 <strong>Join Forums:</strong> Participate in discussions about your favorite books
              </div>
              
              <div class="feature">
                ✍️ <strong>Create Posts:</strong> Share your thoughts, reviews, and reading experiences
              </div>
              
              <div class="feature">
                👥 <strong>Connect:</strong> Follow other readers and build your reading community
              </div>
              
              <div class="feature">
                🔍 <strong>Discover:</strong> Explore new books and genres through community recommendations
              </div>
              
              <p>Happy reading! 📖</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Kinna - Book Lovers Community</p>
            </div>
          </body>
          </html>
        `,
        text: `
Welcome to Kinna, ${username}!

Your email has been verified successfully! You're now part of our vibrant community of book lovers.

Here's what you can do now:
- Join Forums: Participate in discussions about your favorite books
- Create Posts: Share your thoughts, reviews, and reading experiences
- Connect: Follow other readers and build your reading community
- Discover: Explore new books and genres through community recommendations

Happy reading!

© ${new Date().getFullYear()} Kinna - Book Lovers Community
        `.trim(),
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Welcome email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ Error sending welcome email:', error);
      return false;
    }
  }
}

export default new EmailService();
