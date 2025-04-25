import bcrypt from "bcryptjs";
import postgres from "postgres";
import { invoices, customers, revenue, users } from "../lib/placeholder-data";
import { NextResponse } from "next/server";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

async function seedUsers() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `;

  // Remover duplicatas no array de usuários
  const uniqueUsers = users.filter(
    (user, index, self) =>
      index === self.findIndex((u) => u.email === user.email)
  );

  const insertedUsers = await Promise.all(
    uniqueUsers.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return sql`
        INSERT INTO users (id, name, email, password)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
        ON CONFLICT (id) DO NOTHING;
      `;
    })
  );

  return insertedUsers;
}

async function seedInvoices() {
  await sql`
    CREATE TABLE IF NOT EXISTS invoices (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      customer_id UUID NOT NULL,
      amount INT NOT NULL,
      status VARCHAR(255) NOT NULL,
      date DATE NOT NULL
    );
  `;

  // Remover duplicatas no array de invoices
  const uniqueInvoices = invoices.filter(
    (invoice, index, self) =>
      index ===
      self.findIndex(
        (i) => i.customer_id === invoice.customer_id && i.date === invoice.date
      )
  );

  const insertedInvoices = await Promise.all(
    uniqueInvoices.map(
      (invoice) => sql`
        INSERT INTO invoices (id, customer_id, amount, status, date)
        VALUES (uuid_generate_v4(), ${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date})
        ON CONFLICT (id) DO NOTHING;
      `
    )
  );

  return insertedInvoices;
}

async function seedCustomers() {
  await sql`
    CREATE TABLE IF NOT EXISTS customers (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      image_url VARCHAR(255) NOT NULL
    );
  `;

  // Remover duplicatas no array de customers
  const uniqueCustomers = customers.filter(
    (customer, index, self) =>
      index === self.findIndex((c) => c.email === customer.email)
  );

  const insertedCustomers = await Promise.all(
    uniqueCustomers.map(
      (customer) => sql`
        INSERT INTO customers (id, name, email, image_url)
        VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})
        ON CONFLICT (id) DO NOTHING;
      `
    )
  );

  return insertedCustomers;
}

async function seedRevenue() {
  await sql`
    CREATE TABLE IF NOT EXISTS revenue (
      month VARCHAR(4) NOT NULL UNIQUE,
      revenue INT NOT NULL
    );
  `;

  // Remover duplicatas no array de revenue
  const uniqueRevenue = revenue.filter(
    (rev, index, self) => index === self.findIndex((r) => r.month === rev.month)
  );

  const insertedRevenue = await Promise.all(
    uniqueRevenue.map(
      (rev) => sql`
        INSERT INTO revenue (month, revenue)
        VALUES (${rev.month}, ${rev.revenue})
        ON CONFLICT (month) DO NOTHING;
      `
    )
  );

  return insertedRevenue;
}

export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const result = await sql.begin((sql) => [
      seedUsers(),
      seedCustomers(),
      seedInvoices(),
      seedRevenue(),
    ]);

    return NextResponse.json({ message: "Database seeded successfully" });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Ocorreu um erro desconhecido" },
      { status: 500 }
    );
  }
}
