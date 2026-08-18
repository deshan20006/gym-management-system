// lib/whatsapp.ts

export function buildWhatsAppLink(phone: string, message: string) {
  let cleanPhone = phone.replace(/\D/g, "");
  
  if (cleanPhone.startsWith("0")) {
    cleanPhone = "94" + cleanPhone.substring(1);
  }

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}