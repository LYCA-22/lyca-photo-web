"use client";
import { apiService } from "@/services/api";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "lucide-react";

export default function Home() {
  const [data, setData] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getPhotoUrls = async () => {
      try {
        const result = await apiService.getAllPhotos("20250329");

        if (Array.isArray(result)) {
          setData([...result].reverse());
        } else if (typeof result === "object" && result !== null) {
          const possibleArrayData = Object.values(result).find(Array.isArray);
          if (possibleArrayData) {
            setData([...possibleArrayData].reverse());
          }
        }
      } catch (error) {
        console.error("Error fetching photos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getPhotoUrls();
  }, []);

  const renderSkeletons = () => {
    return Array(20)
      .fill(0)
      .map((_, index) => (
        <div key={`skeleton-${index}`} className="mb-1">
          <Skeleton className="w-full h-[200px]" />
        </div>
      ));
  };

  return (
    <main>
      <div
        aria-label="photo-title"
        className="p-5 flex flex-col gap-2 sm:px-10"
      >
        <h1 className="text-xl font-bold">
          2025 林園高中學生自治工作坊「尋找——不完整的答案」
        </h1>
        <div className="flex items-center gap-2">
          <Calendar size={20} />
          <p>2025年03月29日</p>
        </div>
      </div>
      <div className="container mx-auto px-1 py-4 max-sm:px-5">
        {isLoading ? (
          <div className="photo-gallery-skeleton">
            <div className="sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-1">
              {renderSkeletons()}
            </div>
          </div>
        ) : Array.isArray(data) && data.length > 0 ? (
          <div
            className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-3"
            style={{ lineHeight: 0 }}
          >
            {data.map((photo, index) => (
              <div
                key={index}
                className={`mb-3 max-sm:mb-5 break-inside-avoid ${index === 1 && "hidden"}`}
                style={{ lineHeight: 1 }}
              >
                <Image
                  src={photo}
                  alt={`照片 ${index + 1}`}
                  width={400}
                  height={300}
                  className="rounded-md w-full h-auto block"
                  loading="eager"
                  unoptimized
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">沒有找到照片</p>
          </div>
        )}
      </div>
    </main>
  );
}
