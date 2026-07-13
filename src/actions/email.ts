'use server';

import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import nodemailer from 'nodemailer';

export async function requestWithdrawalEmail() {
  const session = await getSession();
  if (!session || session.user.role !== 'USER') {
    return { error: 'Unauthorized' };
  }

  try {
    const userId = session.user.id;
    const users = await db.sql`SELECT * FROM users WHERE id = ${userId}`;
    const user = users[0];

    if (!user || user.balance <= 0) {
      return { error: 'Saldo insuficiente para saque.' };
    }

    // Configuração do Nodemailer usando variáveis de ambiente que o usuário vai me passar
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, // App Password do Gmail
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'ojoaosantibr@gmail.com', // Email do Admin recebido do usuário
      subject: `🚨 Nova Solicitação de Saque - CRM Kanban`,
      html: `
        <h2>Solicitação de Saque (PayPal)</h2>
        <p>O vendedor <strong>${user.name}</strong> (${user.email}) solicitou o resgate das suas comissões.</p>
        <p><strong>Valor a transferir:</strong> R$ ${Number(user.balance).toFixed(2)}</p>
        <p>Após realizar o pagamento via PayPal, lembre-se de zerar o saldo dele no painel de Administrador.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    return { error: 'Erro ao enviar a solicitação. Verifique as configurações de e-mail.' };
  }
}
