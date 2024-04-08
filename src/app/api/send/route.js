import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.FROM_EMAIL;
const toEmail = process.env.TO_EMAIL;

export async function POST(req, res) {
    console.log(req.body); // Verifica que los datos del formulario se estén recibiendo correctamente
    const { email, subject, message } = req.body; // Verifica que los campos email, subject y message estén presentes en req.body
    try {
        console.log("Subject:", subject);
        console.log("Message:", message);
        console.log("Email:", email)
        const data = await resend.emails.send({
            from: fromEmail,
            to: [toEmail],
            subject: 'Solicitud de Contacto Portafolio',
            react: `
            <h1>${subject || 'Hello world'}</h1>
            <p>${message}</p>
            <p>Nuevo mensaje en tu sitio web</p>
            <p>${email}</p>
          `,
        });
        console.log(subject, message, email)
        console.log(data); // Verifica la respuesta de la función de envío de correo

        return NextResponse.json(data);
    } catch (error) {
        console.error(error); // Asegúrate de manejar los errores y registrarlos adecuadamente
        return NextResponse.json({ error });
    }
}
