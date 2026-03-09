/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useGetSettingsQuery } from "@/redux/featured/settings/settingsApi";

export default function HomepagePopup() {
  const { data } = useGetSettingsQuery({});
  const settings = data?.data;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!settings?.enableHomepagePopup) return;
    
    const hasSeenPopup = sessionStorage.getItem("seenPopup");
    if (!hasSeenPopup) {
      setTimeout(() => {
        setOpen(true);
        sessionStorage.setItem("seenPopup", "true");
      }, settings?.popupDelay || 2000);
    }
  }, [settings]);

  if (!settings?.enableHomepagePopup) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm text-center p-6 rounded-2xl">
        <DialogTitle className="text-xl font-semibold mb-2">{settings?.popupTitle}</DialogTitle>
        {settings?.popupImage && (
          <div className="relative w-full h-48 mb-4">
            <Image
              src={settings.popupImage}
              alt="Popup"
              fill
              className="object-cover rounded-lg"
            />
          </div>
        )}
        <p className="text-gray-600">{settings?.popupDescription}</p>
      </DialogContent>
    </Dialog>
  );
}
