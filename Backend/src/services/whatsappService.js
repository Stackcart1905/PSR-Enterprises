import twilio from "twilio";

/**
 * WhatsApp Service Layer
 *
 * Handles initializing the Twilio client and sending formatted WhatsApp messages.
 * Designed to be non-blocking - failures log errors but do not disrupt core logic.
 */

// Initialize client only if SID and Token are present
const getClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;

  if (!accountSid || !authToken || !fromWhatsAppNumber) {
    console.warn(
      "⚠️ WhatsApp Service: Missing Twilio configuration (SID, Token, or Number).",
    );
    return null;
  }
  return twilio(accountSid, authToken);
};

/**
 * Validates and formats phone numbers for WhatsApp.
 * @param {string} number - The recipient's phone number.
 * @returns {string|null} - Formatted number in E.164 format or null if invalid.
 */
const formatPhoneNumber = (number) => {
  if (!number) return null;

  // Remove all non-numeric characters
  const cleaned = number.replace(/\D/g, "");

  // Basic E.164 check (minimal): Must be 10-15 digits
  if (cleaned.length < 10 || cleaned.length > 15) {
    console.warn(`⚠️ WhatsApp Service: Invalid phone number length: ${number}`);
    return null;
  }

  // Ensure it starts with the '+' prefix for E.164
  return `+${cleaned}`;
};

/**
 * Sends a WhatsApp message via Twilio.
 * @param {string} to - Recipient phone number.
 * @param {string} message - Message body.
 * Note: For Twilio WhatsApp Sandbox, the recipient must first send a message (e.g., "join <keyword>") to the sandbox number to opt-in.
 * Ensure the recipient's number is added to your Twilio WhatsApp Sandbox in the Twilio Console.
 */
export const sendWhatsAppMessage = async (to, message) => {
  let targetTo = to;
  let body = message;

  // Support object-based arguments for better flexibility
  if (typeof to === "object" && to !== null) {
    targetTo = to.to || process.env.ADMIN_WHATSAPP_NUMBER;
    body = to.body || to.message;
  }

  console.log("📡 WhatsApp Service Debug Info:");
  console.log("Recipient Provided:", targetTo ? "YES" : "NO");
  console.log("Original Number:", targetTo);
  console.log("Message Length:", body?.length || 0);

  const client = getClient();
  const fromWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;

  if (!client || !fromWhatsAppNumber) {
    console.warn(
      "⚠️ WhatsApp Service: Cannot send message. Client or fromWhatsAppNumber is missing.",
    );
    return;
  }

  const formattedTo = formatPhoneNumber(targetTo);
  console.log("Formatted Number:", formattedTo);

  if (!formattedTo) {
    console.error(
      `❌ WhatsApp Service: Could not format number ${targetTo}. Message aborted.`,
    );
    return;
  }

  const fromString = `whatsapp:${fromWhatsAppNumber}`;
  const toString = `whatsapp:${formattedTo}`;

  console.log("From:", fromString);
  console.log("To:", toString);
  console.log("Body Length:", body?.length || 0);
  console.log("Message Preview:", body?.substring(0, 100) + "...");

  try {
    const response = await client.messages.create({
      body: body,
      from: fromString,
      to: toString,
    });
    console.log("✅ WhatsApp sent successfully");
    console.log("🧾 Twilio Message SID:", response.sid);
    console.log("Status:", response.status);
    return response;
  } catch (error) {
    console.error("❌ Twilio API Error");
    console.error("Status:", error.status);
    console.error("Code:", error.code);
    console.error("Message:", error.message);
    console.error("More Info:", error.moreInfo);
    console.error("Full Object:", error);
    throw error; // Re-throw so caller can catch it with trace markers
  }
};
