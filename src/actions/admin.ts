'use server';

import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import * as xlsx from 'xlsx';

export async function getAdminData() {
  const session = await getSession();
  if (!session || session.user.role !== 'ADMIN') return null;

  const users = await db.sql`SELECT id, name, email, role, balance, current_streak FROM users WHERE role = 'USER'`;
  const leads = await db.sql`SELECT * FROM leads ORDER BY created_at DESC`;
  
  return { users, leads };
}

export async function addBalance(userId: number, amount: number) {
  const session = await getSession();
  if (!session || session.user.role !== 'ADMIN') return { error: 'Unauthorized' };

  await db.sql`UPDATE users SET balance = balance + ${amount} WHERE id = ${userId}`;
  return { success: true };
}

export async function assignLead(leadId: number, userId: number | null) {
  const session = await getSession();
  if (!session || session.user.role !== 'ADMIN') return { error: 'Unauthorized' };

  if (userId) {
    await db.sql`UPDATE leads SET assigned_to = ${userId} WHERE id = ${leadId}`;
  } else {
    await db.sql`UPDATE leads SET assigned_to = NULL WHERE id = ${leadId}`;
  }
  return { success: true };
}

export async function uploadLeadsExcel(formData: FormData) {
  const session = await getSession();
  if (!session || session.user.role !== 'ADMIN') return { error: 'Unauthorized' };

  const file = formData.get('file') as File;
  if (!file) return { error: 'No file provided' };

  const buffer = await file.arrayBuffer();
  const workbook = xlsx.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

  // Bulk insert leads
  // Data expected to have: Nome, Email, Telefone, Link do IG
  for (const row of data as any[]) {
    const name = row['Nome'] || row['Name'] || 'Lead Sem Nome';
    const email = row['Email'] || '';
    const phone = row['Telefone'] || row['Phone'] || '';
    const ig_link = row['Link do IG'] || row['IG'] || row['Instagram'] || '';

    await db.sql`INSERT INTO leads (name, email, phone, ig_link) VALUES (${name}, ${email}, ${phone}, ${ig_link})`;
  }

  return { success: true };
}
