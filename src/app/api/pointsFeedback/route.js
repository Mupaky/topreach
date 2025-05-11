import { PointsFeedbackTemplate } from '@/components/emailTemplates/PointsFeedbackTemplate';
import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
    const { name,
        editingPoints,
        designPoints,
        recordingPoints,
        price, email } = await req.json();

    try {
        const result = await resend.emails.send({
            from: "onboarding@resend.dev",
            to: [`${email}`],
            subject: "Получихме вашата поръчка на точков пакет!",
            react: PointsFeedbackTemplate({ name, editingPoints, designPoints, recordingPoints, price }),
        });

        if (result.error) {
            console.error("📧 Email sending failed:", result.error);
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error("📧 Unexpected email error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}