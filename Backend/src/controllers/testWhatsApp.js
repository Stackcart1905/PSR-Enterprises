import { sendWhatsAppMessage } from "../services/whatsappService.js";

export const testWhatsAppMessage = async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;
    
    console.log("🧪 Testing WhatsApp Message...");
    console.log("📞 Phone Number:", phoneNumber);
    console.log("📝 Message:", message);
    
    const response = await sendWhatsAppMessage(phoneNumber, message);
    
    console.log("✅ Test Message Sent Successfully!");
    console.log("🧾 Message SID:", response.sid);
    
    res.status(200).json({
      success: true,
      message: "Test WhatsApp message sent successfully",
      sid: response.sid,
      status: response.status,
    });
  } catch (error) {
    console.error("❌ Test WhatsApp Failed:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send test WhatsApp message",
      error: error.message,
    });
  }
};
