"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ImagePlus, Trash2 } from "lucide-react";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import ReactPlayer from "react-player";

interface SingleS3UploadProps {
  onUpload: (url: string) => void;
  onRemove: (url: string) => void;
  url: string;
}

const SingleS3Upload: React.FC<SingleS3UploadProps> = ({
  onUpload,
  onRemove,
  url,
}) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const s3Client = new S3Client({
    region: "eu-west-2",
    credentials: {
      accessKeyId: `${process.env.NEXT_PUBLIC_AWS_ADMIN_ACCESS_KEY}`,
      secretAccessKey: `${process.env.NEXT_PUBLIC_AWS_ADMIN_ACCESS_SECRET}`,
    },
  });

  const handleUpload = async (file: File) => {
    setUploading(true);
    const uploadParams = {
      Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME,
      Key: `uploads/${file.name}`,
      Body: file,
    };

    try {
      await s3Client.send(new PutObjectCommand(uploadParams));
      const uploadedUrl = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.amazonaws.com/uploads/${file.name}`;
      onUpload(uploadedUrl);
    } catch (err) {
      console.error("Error uploading file:", err);
      // Display error message to the user
    }
    setUploading(false);
  };

  const handleFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        <div
          key={url}
          className="relative w-[200px] h-[200px] rounded-md overflow-hidden"
        >
          <div className="z-10 absolute top-2 right-2">
            <Button
              type="button"
              onClick={() => onRemove(url)}
              variant="destructive"
              size="sm"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          {url.match(/\.(video|mp4|mov)$/i) ? (
            <ReactPlayer
              key={url}
              url={url}
              width={"100%"}
              height={"100%"}
              loop={true}
              playing={true}
              muted={true}
              alt={`Media from ${url}`}
              className="rounded-md transition-opacity duration-200 ease-in-out"
            />
          ) : (
            <Image
              key={url}
              src={url}
              alt={`Media from ${url}`}
              // fill
              className="object-cover rounded-md transition-opacity duration-200 ease-in-out"
              width={100}
                    height={0}
            />
          )}
        </div>
      </div>
      <Button
        type="button"
        disabled={uploading}
        variant="secondary"
        onClick={handleFileInput}
      >
        <ImagePlus className="h-4 w-4 mr-2" /> Upload Media
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={(e) => e.target.files && handleUpload(e.target.files[0])}
        multiple
      />
    </div>
  );
};

export default SingleS3Upload;