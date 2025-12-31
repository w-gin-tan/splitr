'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { processReceiptImage } from '@/lib/ocr';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { ReceiptItem } from '@/types';
import { Upload, Camera, Loader2, FileText, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface ReceiptScannerProps {
  onScanned: (items: ReceiptItem[], total: number, venueName?: string) => void;
}

export function ReceiptScanner({ onScanned }: ReceiptScannerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const processImage = async (file: File) => {
    setIsProcessing(true);
    setProgress(10);

    try {
      // Create preview
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setProgress(30);

      // Process with OCR
      const result = await processReceiptImage(file);
      setProgress(90);

      if (result.success && result.items.length > 0) {
        const items: ReceiptItem[] = result.items.map((item, index) => ({
          id: `item-${index}`,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          isShared: false,
          assignments: [],
        }));

        const total = result.total || items.reduce((sum, item) => sum + item.totalPrice, 0);
        
        toast.success(`Found ${items.length} items!`);
        onScanned(items, total, result.venueName);
      } else {
        toast.error('Could not detect items. Try a clearer photo or enter manually.');
        // Still proceed with empty items so user can add manually
        onScanned([], 0);
      }
    } catch (error) {
      console.error('OCR Error:', error);
      toast.error('Error processing receipt. Please try again.');
    } finally {
      setIsProcessing(false);
      setProgress(100);
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      processImage(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.heic'],
    },
    maxFiles: 1,
    disabled: isProcessing,
  });

  const handleManualEntry = () => {
    // Skip scanning and go straight to manual entry
    onScanned([], 0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Scan Your Receipt</h2>
        <p className="text-sm text-muted-foreground">
          Take a photo or upload an image of your receipt to automatically detect items.
        </p>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
          ${isProcessing ? 'pointer-events-none opacity-75' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {isProcessing ? (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin" />
            <div>
              <p className="font-medium">Processing receipt...</p>
              <p className="text-sm text-muted-foreground">
                Extracting items and prices
              </p>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : previewUrl ? (
          <div className="space-y-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={previewUrl} 
              alt="Receipt preview" 
              className="max-h-48 mx-auto rounded-lg object-contain"
            />
            <p className="text-sm text-muted-foreground">
              Drop a new image to replace
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Camera className="w-8 h-8 text-primary" />
              </div>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="w-8 h-8 text-primary" />
              </div>
            </div>
            <div>
              <p className="font-medium">
                {isDragActive ? 'Drop your receipt here' : 'Take a photo or drop an image'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Supports JPG, PNG, WEBP, HEIC
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-muted/50 rounded-lg p-4 text-sm">
        <p className="font-medium mb-2">📸 Tips for best results:</p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1">
          <li>Ensure good lighting and focus</li>
          <li>Capture the entire receipt including totals</li>
          <li>Avoid shadows and glare</li>
          <li>Flatten any creases or folds</li>
        </ul>
      </div>

      {/* Manual Entry Option */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-muted-foreground/25" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-card px-3 text-muted-foreground">or</span>
        </div>
      </div>

      <Button 
        variant="outline" 
        onClick={handleManualEntry}
        className="w-full"
        disabled={isProcessing}
      >
        <Plus className="w-4 h-4 mr-2" />
        Enter Items Manually
      </Button>
    </div>
  );
}
