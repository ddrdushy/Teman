/**
 * The two admin accounts from docs/10, for dev and demo:
 *   +60 12-000 0003  Siti Nurhaliza binti Osman — NGO coordinator
 *   +60 12-000 0004  Platform admin
 * OTP arrives via the SMS stub (server log) in dev; DEMO_OTP in demo.
 * Idempotent.
 */
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL ?? 'postgres://teman:dev@localhost:5433/teman');

const ROWS = [
  ['+60120000003', 'Siti Nurhaliza binti Osman', 'coordinator', 'ms'],
  ['+60120000004', 'Teman Admin', 'admin', 'en'],
];

for (const [phone, name, role, lang] of ROWS) {
  await sql`
    INSERT INTO person (phone_e164, phone_verified_at, display_name, role, preferred_language, verification_tier)
    VALUES (${phone}, now(), ${name}, ${role}, ${lang}, 'basic')
    ON CONFLICT (phone_e164) DO UPDATE SET role = ${role}`;
}
console.log('admin accounts seeded: coordinator (+60120000003), admin (+60120000004)');
await sql.end();
