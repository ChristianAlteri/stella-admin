"use client";

import { useState } from "react";
import Image from "next/image";
import ReactPlayer from "react-player";
import { CellAction } from "./cell-action";
import { BillboardColumn } from "./columns";

export default function BillboardCard({
  billboards,
}: {
  billboards: BillboardColumn[];
}) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  return (
    <div className="space-y-4 p-4">
      {billboards.map((billboard) => (
        <div key={billboard.id} className="border rounded-lg p-4 space-y-2">
          <h2 className="text-xl font-semibold">{billboard.label}</h2>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">
              Created: {billboard.createdAt}
            </p>
            <a
              href={billboard.imageUrl}
              className="block hover:underline text-blue-600"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Original
            </a>
          </div>
          <div className="mt-2">
            <>
              <a className="hover:underline" href={billboard.imageUrl}>
                {billboard?.imageUrl.match(
                  /https:\/\/.*\.(video|mp4|MP4|mov).*/
                ) ? (
                  <ReactPlayer
                    key={billboard.id}
                    url={billboard.imageUrl}
                    width={"50%"}
                    loop={true}
                    playing={true}
                    muted={true}
                    alt={`Image from ${billboard.imageUrl}`}
                    className="rounded-md transition-opacity duration-200 ease-in-out"
                  />
                ) : (
                  <Image
                    key={billboard.id}
                    src={billboard.imageUrl}
                    alt={`Image from ${billboard.imageUrl}`}
                    width={100}
                    height={0}
                    loading="lazy"
                    className="rounded-md transition-opacity duration-200 ease-in-out"
                  />
                )}
              </a>
            </>
          </div>
          <div className="flex justify-between items-center mt-2">
            <button
              onClick={() => toggleExpand(billboard.id)}
              className="text-sm text-blue-600 hover:underline"
            >
              {expandedItem === billboard.id ? "Collapse" : "Expand"}
            </button>
            <CellAction data={billboard} />
          </div>
          {expandedItem === billboard.id && (
            <div className="mt-2 text-sm">
              <p>
                <strong>ID:</strong> {billboard.id}
              </p>
              <p>
                <strong>Label:</strong> {billboard.label}
              </p>
              <p>
                <strong>Created At:</strong> {billboard.createdAt}
              </p>
              <p>
                <strong>Image URL:</strong> {billboard.imageUrl}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
