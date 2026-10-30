/**
 * One-time interactive login to generate a reusable Telethon/GramJS-style
 * user session for scripts/import-telegram-channel.ts.
 *
 * Run once (ideally directly on the VPS, so the session is generated where
 * it'll actually be used): `npx tsx scripts/telegram-channel-login.ts`
 *
 * Prompts for the phone number, then the login code Telegram sends to that
 * account's app, then (only if 2FA is enabled) the account's password.
 * Prints a session string at the end -- save that as TELEGRAM_USER_SESSION
 * in .env. It never expires on its own and lets every future run of the
 * import script skip this step entirely.
 */
import "dotenv/config";
import * as readline from "node:readline/promises";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";

const apiId = Number(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH?.trim();

if (!apiId || !apiHash) {
  console.error("TELEGRAM_API_ID and TELEGRAM_API_HASH must be set in .env (see .env.example).");
  process.exit(1);
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (question: string) => rl.question(question);

async function main() {
  const client = new TelegramClient(new StringSession(""), apiId, apiHash!, {
    connectionRetries: 5
  });

  await client.start({
    phoneNumber: async () => await ask("Phone number (e.g. +998901234567): "),
    phoneCode: async () => await ask("Login code Telegram just sent you: "),
    password: async () => await ask("2FA password (only if your account has one set): "),
    onError: (err) => console.error("Login error:", err)
  });

  console.log("\nLogged in successfully. Save this as TELEGRAM_USER_SESSION in .env:\n");
  console.log(client.session.save());
  console.log();

  await client.disconnect();
  rl.close();
}

main();
