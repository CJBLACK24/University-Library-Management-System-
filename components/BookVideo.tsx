"use client";
import React from "react";
import { IKVideo, ImageKitProvider } from "imagekitio-next";
import config from "@/lib/config";

const BookVideo = ({ videoUrl }: { videoUrl: string }) => {
  const isAbsolute = videoUrl.startsWith("http://") || videoUrl.startsWith("https://");

  if (isAbsolute) {
    return (
      <video
        src={videoUrl}
        controls
        className="h-72 w-full rounded-xl object-cover md:h-96"
      />
    );
  }

  return (
    <ImageKitProvider
      publicKey={config.env.imagekit.publicKey}
      urlEndpoint={config.env.imagekit.urlEndpoint}
    >
      <IKVideo path={videoUrl} controls={true} className="h-72 w-full rounded-xl md:h-96" />
    </ImageKitProvider>
  );
};
export default BookVideo;
