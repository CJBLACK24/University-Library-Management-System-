"use client";


import React, { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { IKUpload, ImageKitProvider } from "imagekitio-next";
import config from "@/lib/config";
import { Pencil } from "lucide-react";
import { updateUserImage } from "@/lib/actions/user";
import { toast } from "@/hooks/use-toast";

interface Props {
  userId: string;
  userName: string;
  avatarUrl: string | null;
}

const AvatarUpload = ({ userId, userName, avatarUrl: initialAvatarUrl }: Props) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl);
  const uploadRef = useRef<any>(null);

  const onSuccess = async (res: any) => {
    const url = res.filePath;
    setAvatarUrl(url);
    
    const result = await updateUserImage(userId, url);
    
    if (result.success) {
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update profile picture.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="group relative inline-flex items-center">
      <Avatar className="h-[74px] w-[74px] overflow-hidden ring-2 ring-dark-600">
        {avatarUrl ? (
          <AvatarImage
            src={avatarUrl}
            alt="avatar"
            className="rounded-full object-cover"
          />
        ) : (
          <AvatarFallback className="rounded-full bg-dark-600 text-white">
            {getInitials(userName)}
          </AvatarFallback>
        )}
      </Avatar>

      <ImageKitProvider
        publicKey={config.env.imagekit.publicKey}
        urlEndpoint={config.env.imagekit.urlEndpoint}
        authenticator={async () => {
          const res = await fetch("/api/imagekit");
          const data = await res.json();
          return data;
        }}
      >
        <IKUpload
          ref={uploadRef}
          onSuccess={onSuccess}
          onError={(e) => {
            console.error(e);
            toast({
              title: "Upload failed",
              description: "Could not upload image. Please try again.",
              variant: "destructive",
            });
          }}
          folder="avatars"
          className="hidden"
          validateFile={(file: File) => file.size < 10 * 1024 * 1024}
          useUniqueFileName
        />
      </ImageKitProvider>

      <button
        type="button"
        aria-label="Upload avatar"
        onClick={() => uploadRef.current?.click()}
        className="absolute -bottom-1 -right-1 rounded-full bg-[#EAB308] p-1.5 shadow hover:bg-[#CA8A04] transition-colors"
      >
        <Pencil className="size-3 text-white" />
      </button>
    </div>
  );
};


export default AvatarUpload;

