import postgres from "postgres";
import { NextResponse } from "next/server";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

async function listInvoices() {
  const data = await sql`
    SELECT invoices.amount, customers.name
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE invoices.amount = 666;
  `;

  return data;
}

export async function GET() {
  try {
    const invoices = await listInvoices();
    return NextResponse.json(invoices);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    // Caso o erro não seja uma instância de Error
    return NextResponse.json(
      { error: "Ocorreu um erro desconhecido" },
      { status: 500 }
    );
  }
}
