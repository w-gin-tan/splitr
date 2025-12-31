'use client';

import { useState } from 'react';
import { ReceiptScanner } from '@/components/receipt/ReceiptScanner';
import { ItemList } from '@/components/receipt/ItemList';
import { ParticipantManager } from '@/components/split/ParticipantManager';
import { SplitSummary } from '@/components/split/SplitSummary';
import { PaymentOptions } from '@/components/payment/PaymentOptions';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { ReceiptItem, Participant } from '@/types';
import { PARTICIPANT_COLORS } from '@/types';
import { Receipt, Users, Calculator, Share2, CreditCard } from 'lucide-react';

type Step = 'scan' | 'items' | 'assign' | 'summary' | 'share';

export default function Home() {
  const [step, setStep] = useState<Step>('scan');
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [venueName, setVenueName] = useState<string>('');

  const handleReceiptScanned = (scannedItems: ReceiptItem[], scannedTotal: number, venue?: string) => {
    setItems(scannedItems);
    setTotal(scannedTotal);
    if (venue) setVenueName(venue);
    setStep('items');
  };

  const handleItemsConfirmed = () => {
    // Initialize with at least one participant
    if (participants.length === 0) {
      setParticipants([
        {
          id: '1',
          name: 'Me',
          color: PARTICIPANT_COLORS[0],
          amountOwed: 0,
          amountPaid: 0,
        },
      ]);
    }
    setStep('assign');
  };

  const handleAssignmentComplete = () => {
    setStep('summary');
  };

  const handleShare = () => {
    setStep('share');
  };

  const steps = [
    { id: 'scan', label: 'Scan', icon: Receipt },
    { id: 'items', label: 'Items', icon: Receipt },
    { id: 'assign', label: 'Assign', icon: Users },
    { id: 'summary', label: 'Summary', icon: Calculator },
    { id: 'share', label: 'Share', icon: Share2 },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === step);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Perth Split 🧾
        </h1>
        <p className="text-muted-foreground">
          Split bills fairly with your friends
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-between mb-8 relative">
        {/* Progress line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted -z-10">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>
        
        {steps.map((s, index) => {
          const Icon = s.icon;
          const isActive = s.id === step;
          const isCompleted = index < currentStepIndex;
          
          return (
            <button
              key={s.id}
              onClick={() => index <= currentStepIndex && setStep(s.id as Step)}
              disabled={index > currentStepIndex}
              className={`flex flex-col items-center gap-1 transition-colors ${
                isActive ? 'text-primary' : isCompleted ? 'text-primary/70' : 'text-muted-foreground'
              } ${index <= currentStepIndex ? 'cursor-pointer' : 'cursor-not-allowed'}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                isActive ? 'bg-primary text-primary-foreground' : 
                isCompleted ? 'bg-primary/20 text-primary' : 
                'bg-muted text-muted-foreground'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium hidden sm:block">{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content */}
      <Card className="p-6">
        {step === 'scan' && (
          <ReceiptScanner onScanned={handleReceiptScanned} />
        )}

        {step === 'items' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Review Items</h2>
              <p className="text-sm text-muted-foreground">
                Check that all items were detected correctly. You can edit or add items.
              </p>
            </div>
            
            <ItemList 
              items={items} 
              onItemsChange={setItems}
              total={total}
              onTotalChange={setTotal}
            />
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('scan')}>
                Back
              </Button>
              <Button onClick={handleItemsConfirmed} className="flex-1">
                Continue to Assignment
              </Button>
            </div>
          </div>
        )}

        {step === 'assign' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Assign Items</h2>
              <p className="text-sm text-muted-foreground">
                Tap items to assign them to people. Tap again to mark as shared.
              </p>
            </div>

            <ParticipantManager
              participants={participants}
              onParticipantsChange={setParticipants}
            />
            
            <ItemList 
              items={items} 
              onItemsChange={setItems}
              participants={participants}
              mode="assign"
              total={total}
            />
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('items')}>
                Back
              </Button>
              <Button onClick={handleAssignmentComplete} className="flex-1">
                View Summary
              </Button>
            </div>
          </div>
        )}

        {step === 'summary' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Split Summary</h2>
              <p className="text-sm text-muted-foreground">
                {venueName ? `${venueName} - ` : ''}Here's what everyone owes.
              </p>
            </div>

            <SplitSummary 
              items={items}
              participants={participants}
              total={total}
            />
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('assign')}>
                Back
              </Button>
              <Button onClick={handleShare} className="flex-1">
                <Share2 className="w-4 h-4 mr-2" />
                Share & Get Paid
              </Button>
            </div>
          </div>
        )}

        {step === 'share' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Payment Options</h2>
              <p className="text-sm text-muted-foreground">
                Share the link or payment details with your friends.
              </p>
            </div>

            <PaymentOptions 
              participants={participants}
              total={total}
              venueName={venueName}
            />
            
            <Button variant="outline" onClick={() => setStep('summary')} className="w-full">
              Back to Summary
            </Button>
          </div>
        )}
      </Card>

      {/* Footer */}
      <p className="text-center text-xs text-muted-foreground mt-8">
        Built with ❤️ in Perth, Australia
      </p>
    </div>
  );
}
