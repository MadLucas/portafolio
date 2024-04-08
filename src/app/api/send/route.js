import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.FROM_EMAIL;
const toEmail = process.env.TO_EMAIL;

export async function POST(req, res) {
    const body = await req.json(); // Interpreta el cuerpo de la solicitud como JSON

    const { email, subject, message } = body;

    console.log("Subject:", subject);
    console.log("Message:", message);
    console.log("Email:", email);

    try {
        const data = await resend.emails.send({
            from: fromEmail,
            to: [toEmail],
            subject: 'Solicitud de Contacto Portafolio',
            react:(
                <>
            <h1>${subject}</h1>
            <p>${message}</p>
            <p>Nuevo mensaje en tu sitio web</p>
            <p>${email}</p>
                </>
            ),
        });
        console.log(subject, message, email)
        console.log(data); // Verifica la respuesta de la función de envío de correo

        return NextResponse.json(data);
    } catch (error) {
        console.error(error); // Asegúrate de manejar los errores y registrarlos adecuadamente
        return NextResponse.json({ error });
    }
}
