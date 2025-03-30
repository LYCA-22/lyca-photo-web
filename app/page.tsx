"use client";
import { apiService } from "@/services/api";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

export default function Home() {
  const [data, setData] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);

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

  // 關閉圖片檢視器
  const closeViewer = useCallback(() => {
    setCurrentIndex(-1);
    setZoomLevel(1);
  }, []);

  // 下一張圖片
  const nextImage = useCallback(() => {
    if (currentIndex < data.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setZoomLevel(1);
    }
  }, [currentIndex, data.length]);

  // 上一張圖片
  const prevImage = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setZoomLevel(1);
    }
  }, [currentIndex]);

  // 鍵盤快捷鍵
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentIndex === -1) return;

      switch (e.key) {
        case "Escape":
          closeViewer();
          break;
        case "ArrowRight":
          nextImage();
          break;
        case "ArrowLeft":
          prevImage();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, closeViewer, nextImage, prevImage]);

  // 下載當前圖片
  const downloadImage = useCallback(async () => {
    if (currentIndex < 0 || currentIndex >= data.length || isDownloading)
      return;

    try {
      setIsDownloading(true);
      const imageUrl = data[currentIndex];

      let fileName = "";

      try {
        const url = new URL(imageUrl);
        const pathSegments = url.pathname.split("/");
        const baseFileName = pathSegments[pathSegments.length - 1];

        fileName = /\.(jpg|jpeg|png|gif|webp)$/i.test(baseFileName)
          ? baseFileName
          : `${baseFileName}.jpg`;
      } catch (e) {
        console.error(e);
        fileName = `photo-${currentIndex + 1}.jpg`;
      }

      const response = await fetch(imageUrl);
      const blob = await response.blob();

      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      link.style.display = "none";

      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }, 100);
    } catch (error) {
      console.error("下載圖片失敗:", error);
      window.open(data[currentIndex], "_blank");
    } finally {
      setIsDownloading(false);
    }
  }, [currentIndex, data, isDownloading]);

  // 縮放功能
  const zoom = useCallback(
    (in_out: "in" | "out") => {
      if (in_out === "in" && zoomLevel < 3) {
        setZoomLevel((prev) => prev + 0.5);
      } else if (in_out === "out" && zoomLevel > 0.5) {
        setZoomLevel((prev) => prev - 0.5);
      }
    },
    [zoomLevel],
  );

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
      {/* 圖片檢視器 */}
      {currentIndex !== -1 && (
        <div className="z-50 fixed inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center">
          <div onClick={closeViewer} className="absolute inset-0 -z-10"></div>

          {/* 控制列 */}
          <div className="z-40 absolute top-0 left-0 right-0 from-black/50 to-black/0 bg-gradient-to-b p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={closeViewer}
                className="bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
                aria-label="關閉"
              >
                <X size={22} className="text-white" />
              </button>
              <span className="text-white">
                {currentIndex + 1} / {data.length}
              </span>
            </div>

            <div className="z-40 flex items-center gap-3">
              <button
                onClick={() => zoom("out")}
                className="bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
                aria-label="縮小"
                disabled={zoomLevel <= 0.5}
              >
                <ZoomOut size={22} className="text-white" />
              </button>
              <button
                onClick={() => zoom("in")}
                className="bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
                aria-label="放大"
                disabled={zoomLevel >= 3}
              >
                <ZoomIn size={22} className="text-white" />
              </button>
              <button
                onClick={downloadImage}
                className={`bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors ${
                  isDownloading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isDownloading}
                aria-label="下載"
              >
                <Download size={22} className="text-white" />
              </button>
            </div>
          </div>

          {currentIndex > 0 && (
            <button
              onClick={prevImage}
              className="z-40 absolute left-4 top-1/2 -translate-y-1/2 bg-zinc-300/50 hover:bg-white/20 rounded-full p-2 transition-colors"
              aria-label="上一張"
            >
              <ChevronLeft size={24} className="text-white" />
            </button>
          )}

          {currentIndex < data.length - 1 && (
            <button
              onClick={nextImage}
              className="z-40 absolute right-4 top-1/2 -translate-y-1/2 bg-zinc-300/50 hover:bg-white/20 rounded-full p-2 transition-colors"
              aria-label="下一張"
            >
              <ChevronRight size={24} className="text-white" />
            </button>
          )}

          {/* 圖片容器 */}
          <div className="z-30 w-full h-full flex items-center justify-center p-8 overflow-auto">
            <Image
              src={data[currentIndex]}
              alt={`照片 ${currentIndex + 1}`}
              width={800}
              height={600}
              className="max-h-[85vh] object-contain transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel})` }}
              loading="eager"
              unoptimized
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* 頁面標題 */}
      <div
        aria-label="photo-title"
        className="p-5 flex flex-col gap-3 sm:px-10"
      >
        <h1 className="text-xl font-bold">
          2025 林園高中學生自治工作坊「尋找——不完整的答案」
        </h1>
        <div className="flex items-center gap-2">
          <Calendar size={20} />
          <p>2025年03月29日</p>
        </div>
      </div>

      {/* 圖片庫 */}
      <div className="container mx-auto px-1 py-4 max-sm:px-5">
        {isLoading ? (
          <div className="photo-gallery-skeleton">
            <div className="sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-1">
              {renderSkeletons()}
            </div>
          </div>
        ) : Array.isArray(data) && data.length > 0 ? (
          <div
            className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4"
            style={{ lineHeight: 0 }}
          >
            {data.map((photo, index) => (
              <div
                key={index}
                className={`relative flex group mb-4 max-sm:mb-5 break-inside-avoid ${index === 1 && "hidden"}`}
                style={{ lineHeight: 1 }}
              >
                <button
                  onClick={() => setCurrentIndex(index)}
                  className="absolute top-0 rounded-md w-full h-full opacity-0 scale-90 group-hover:scale-100 group-hover:opacity-100 bg-black/30 transition-all"
                ></button>
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
