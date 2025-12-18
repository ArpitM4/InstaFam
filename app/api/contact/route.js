import nodemailer from 'nodemailer';

export async function POST(req) {
    try {
        const { name, email, message } = await req.json();

        if (!name || !email || !message) {
            return Response.json({ error: "All fields are required" }, { status: 400 });
        }

        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_SERVER_HOST,
            port: parseInt(process.env.EMAIL_SERVER_PORT),
            secure: true,
            auth: {
                user: process.env.EMAIL_SERVER_USER,
                pass: process.env.EMAIL_SERVER_PASSWORD,
            },
        });

        // Email to Admin (Contact Support)
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: 'contact@sygil.app', // Or process.env.EMAIL_FROM if they want to email themselves
            replyTo: email,
            subject: `New Contact Form Message from ${name}`,
            html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #667eea;">New Support Message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;" />
          <p><strong>Message:</strong></p>
          <p style="background: #f9f9f9; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${message}</p>
        </div>
      `,
        });

        return Response.json({ message: "Message sent successfully!" }, { status: 200 });

    } catch (error) {
        console.error('Contact form error:', error);
        return Response.json({ error: "Failed to send message" }, { status: 500 });
    }
}
