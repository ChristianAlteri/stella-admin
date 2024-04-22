import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ImagePlus, Trash, Trash2 } from "lucide-react";

interface S3UploadProps {
  disabled?: boolean;
  onChange: (value: string[]) => void;
  onRemove: (value: string) => void;
  value: string[];
}

const S3Upload: React.FC<S3UploadProps> = ({
  disabled,
  onChange,
  onRemove,
  value,
}) => {
  const s3Client = new S3Client({
    region: "eu-west-2",
    credentials: {
      accessKeyId: `${process.env.NEXT_PUBLIC_AWS_ADMIN_ACCESS_KEY}`,
      secretAccessKey: `${process.env.NEXT_PUBLIC_AWS_ADMIN_ACCESS_SECRET}`,
    },
  });

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: FileList) => {
    setUploading(true);
    const newUrls = await Promise.all(
      Array.from(files).map(async (file) => {
        const fileName = file.name.replace(/\s/g, "_");
        const uploadParams = {
          Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME,
          Key: `uploads/${fileName}`,
          Body: file,
        };
  
        try {
          await s3Client.send(new PutObjectCommand(uploadParams));
          const imageUrl = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.amazonaws.com/uploads/${fileName}`;
          return imageUrl;
        } catch (err) {
          console.error("Error uploading file:", err);
          return null;
        }
      })
    );
  
    // Filter out any null values to ensure all elements are strings
    const validUrls = newUrls.filter((url): url is string => url !== null);
  
    const updatedUrls = [...value, ...validUrls];
    onChange(updatedUrls);
    setUploading(false);
  };
  

  const handleFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        {value.map((url) => (
          typeof url === "string" ? (
            <div key={url} className="relative w-[200px] h-[200px] rounded-md overflow-hidden">
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
              <Image fill className="object-cover" alt="Image" src={url} />
            </div>
          ) : null
        ))}
      </div>
      <Button
        type="button"
        disabled={disabled || uploading}
        variant="secondary"
        onClick={handleFileInput}
      >
        <ImagePlus className="h-4 w-4 mr-2" /> Upload Images
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={(e) => e.target.files && handleUpload(e.target.files)}
        multiple
      />
    </div>
  );
};

export default S3Upload;
