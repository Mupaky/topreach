import { EmailTemplate } from '@/components/emailTemplates/EmailTemplate';
import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
    const { name, email, subject, message } = await req.json();

    try {
        const result = await resend.emails.send({
            from: `Top Reach Inquiry <inquiry@topreachstudio.com>`,
            to: ['topreachstudio@gmail.com'],
            subject: `${subject}`,
            react: EmailTemplate({ message: message, name: name, email: email }),
        });

        if (result.error) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}