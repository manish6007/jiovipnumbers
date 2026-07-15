import type { Metadata } from "next";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the JioVIPNumber.com team.",
};

export default function ContactPage() {
  const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  return (
    <div className="container max-w-2xl py-14">
      <h1 className="text-3xl font-bold sm:text-4xl">Contact Us</h1>
      <p className="mt-3 text-muted-foreground">
        Questions about a number, an order or becoming a partner? We&apos;re here to help.
      </p>

      <div className="mt-8 space-y-4">
        {wa && (
          <div className="glass flex items-center justify-between rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-5 w-5 text-[#25D366]" />
              <div>
                <p className="font-semibold">WhatsApp</p>
                <p className="text-sm text-muted-foreground">Fastest response</p>
              </div>
            </div>
            <Button asChild variant="whatsapp" size="sm">
              <a href={buildWhatsAppLink({ vipNumber: "", to: wa })} target="_blank" rel="noopener noreferrer">
                Chat now
              </a>
            </Button>
          </div>
        )}
        <div className="glass flex items-center gap-3 rounded-2xl p-5">
          <Phone className="h-5 w-5 text-blue-500" />
          <div>
            <p className="font-semibold">Phone</p>
            <p className="text-sm text-muted-foreground">{wa ? `+${wa}` : "Add your support number"}</p>
          </div>
        </div>
        <div className="glass flex items-center gap-3 rounded-2xl p-5">
          <Mail className="h-5 w-5 text-blue-500" />
          <div>
            <p className="font-semibold">Email</p>
            <p className="text-sm text-muted-foreground">support@jiovipnumber.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
