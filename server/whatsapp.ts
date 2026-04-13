/**
 * WhatsApp notification stub — pronto para Evolution API.
 *
 * Quando WHATSAPP_ENABLED=true e WHATSAPP_API_URL estiver configurado,
 * envia mensagens reais. Caso contrário, loga no console.
 */

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_ENABLED = process.env.WHATSAPP_ENABLED === "true";

export async function sendWhatsApp(phone: string, message: string): Promise<boolean> {
  if (!WHATSAPP_ENABLED || !WHATSAPP_API_URL) {
    console.log(`[whatsapp-stub] Para ${phone}: ${message}`);
    return true;
  }

  try {
    const res = await fetch(`${WHATSAPP_API_URL}/message/sendText`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(WHATSAPP_TOKEN ? { apikey: WHATSAPP_TOKEN } : {}),
      },
      body: JSON.stringify({
        number: phone.replace(/\D/g, ""),
        text: message,
      }),
    });

    if (!res.ok) {
      console.error(`[whatsapp] Erro ${res.status}: ${await res.text()}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[whatsapp] Falha ao enviar:", err);
    return false;
  }
}

export async function notifyAdmins(adminPhones: string[], message: string) {
  const results = await Promise.allSettled(
    adminPhones.map((phone) => sendWhatsApp(phone, message)),
  );
  const sent = results.filter((r) => r.status === "fulfilled" && r.value).length;
  console.log(`[whatsapp] ${sent}/${adminPhones.length} admins notificados`);
}
