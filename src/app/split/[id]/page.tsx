'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatAUD, formatDate, copyToClipboard } from '@/lib/utils';
import { 
  Receipt, 
  Users, 
  CreditCard, 
  Copy, 
  Check, 
  ArrowLeft,
  Building2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

// This would normally fetch from the API
// For now, we'll show a demo page
interface SplitData {
  id: string;
  title: string;
  venueName?: string;
  total: number;
  date: Date;
  payId?: string;
  bsb?: string;
  accountNumber?: string;
  accountName?: string;
  participants: {
    id: string;
    name: string;
    color: string;
    amountOwed: number;
    amountPaid: number;
    items: { name: string; amount: number }[];
  }[];
}

export default function SplitPage({ params }: { params: { id: string } }) {
  const [split, setSplit] = useState<SplitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading - in a real app, fetch from API
    setTimeout(() => {
      // Demo data
      setSplit({
        id: params.id,
        title: 'Dinner Split',
        venueName: 'The Local Pub',
        total: 156.50,
        date: new Date(),
        payId: 'example@email.com',
        bsb: '066-000',
        accountNumber: '12345678',
        accountName: 'John Smith',
        participants: [
          {
            id: '1',
            name: 'John',
            color: '#EF4444',
            amountOwed: 52.17,
            amountPaid: 0,
            items: [
              { name: 'Steak', amount: 35.00 },
              { name: 'Shared appetizers', amount: 17.17 },
            ],
          },
          {
            id: '2',
            name: 'Sarah',
            color: '#3B82F6',
            amountOwed: 52.17,
            amountPaid: 52.17,
            items: [
              { name: 'Fish & Chips', amount: 28.00 },
              { name: 'Wine', amount: 7.00 },
              { name: 'Shared appetizers', amount: 17.17 },
            ],
          },
          {
            id: '3',
            name: 'Mike',
            color: '#22C55E',
            amountOwed: 52.16,
            amountPaid: 0,
            items: [
              { name: 'Burger', amount: 22.00 },
              { name: 'Beer', amount: 12.99 },
              { name: 'Shared appetizers', amount: 17.17 },
            ],
          },
        ],
      });
      setLoading(false);
    }, 500);
  }, [params.id]);

  const handleCopy = async (text: string, label: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(label);
      toast.success(`${label} copied!`);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/2" />
          <div className="h-4 bg-muted rounded w-1/3" />
          <div className="h-32 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!split) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-lg text-center">
        <h1 className="text-2xl font-bold mb-2">Split Not Found</h1>
        <p className="text-muted-foreground mb-4">
          This split may have expired or doesn't exist.
        </p>
        <Button asChild>
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Create New Split
          </Link>
        </Button>
      </div>
    );
  }

  const selectedData = selectedParticipant 
    ? split.participants.find(p => p.id === selectedParticipant)
    : null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <Receipt className="w-4 h-4" />
          <span className="text-sm">{formatDate(split.date)}</span>
        </div>
        <h1 className="text-2xl font-bold">{split.title}</h1>
        {split.venueName && (
          <p className="text-muted-foreground">{split.venueName}</p>
        )}
      </div>

      {/* Who are you? */}
      <Card className="p-4 mb-6">
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Who are you?
        </h2>
        <div className="flex flex-wrap gap-2">
          {split.participants.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedParticipant(p.id)}
              className={`
                px-4 py-2 rounded-full text-white font-medium transition-all
                ${selectedParticipant === p.id 
                  ? 'ring-2 ring-offset-2 ring-offset-background scale-105' 
                  : 'opacity-70 hover:opacity-100'}
              `}
              style={{ 
                backgroundColor: p.color,
                ['--tw-ring-color' as string]: p.color,
              }}
            >
              {p.name}
              {p.amountPaid >= p.amountOwed && (
                <Check className="w-4 h-4 inline ml-1" />
              )}
            </button>
          ))}
        </div>
      </Card>

      {/* Selected Person's Details */}
      {selectedData && (
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">{selectedData.name}'s Share</h2>
            {selectedData.amountPaid >= selectedData.amountOwed ? (
              <Badge variant="success">Paid ✓</Badge>
            ) : (
              <Badge variant="warning">Pending</Badge>
            )}
          </div>

          {/* Items */}
          <div className="space-y-2 mb-4">
            {selectedData.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.name}</span>
                <span>{formatAUD(item.amount)}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-3 border-t font-bold text-lg">
            <span>You Owe</span>
            <span style={{ color: selectedData.color }}>
              {formatAUD(selectedData.amountOwed)}
            </span>
          </div>
        </Card>
      )}

      {/* Payment Options */}
      {selectedData && selectedData.amountPaid < selectedData.amountOwed && (
        <>
          {split.payId && (
            <Card className="p-4 mb-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Pay via PayID
                <Badge variant="secondary" className="ml-auto">Instant</Badge>
              </h3>
              
              <div className="flex gap-2 mb-3">
                <code className="flex-1 bg-muted rounded px-3 py-2 text-sm font-mono">
                  {split.payId}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(split.payId!, 'PayID')}
                >
                  {copied === 'PayID' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>

              <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
                <li>Open your banking app</li>
                <li>Choose "Pay Someone" → "PayID"</li>
                <li>Enter the PayID above</li>
                <li>Pay <strong>{formatAUD(selectedData.amountOwed)}</strong></li>
              </ol>
            </Card>
          )}

          {split.bsb && split.accountNumber && (
            <Card className="p-4 mb-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Bank Transfer
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">BSB</span>
                  <span className="font-mono">{split.bsb}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account</span>
                  <span className="font-mono">{split.accountNumber}</span>
                </div>
                {split.accountName && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name</span>
                    <span>{split.accountName}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold">
                  <span>Amount</span>
                  <span>{formatAUD(selectedData.amountOwed)}</span>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => handleCopy(
                  `BSB: ${split.bsb}\nAccount: ${split.accountNumber}\nName: ${split.accountName}\nAmount: ${formatAUD(selectedData.amountOwed)}`,
                  'Bank details'
                )}
                className="w-full mt-3"
              >
                {copied === 'Bank details' ? (
                  <Check className="w-4 h-4 mr-2" />
                ) : (
                  <Copy className="w-4 h-4 mr-2" />
                )}
                Copy All Details
              </Button>
            </Card>
          )}
        </>
      )}

      {/* All Participants Summary */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Everyone's Share</h3>
        <div className="space-y-2">
          {split.participants.map(p => (
            <div key={p.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: p.color }}
                >
                  {p.name.charAt(0)}
                </div>
                <span>{p.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{formatAUD(p.amountOwed)}</span>
                {p.amountPaid >= p.amountOwed ? (
                  <Badge variant="success">Paid</Badge>
                ) : (
                  <Badge variant="outline">Pending</Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-3 mt-3 border-t font-bold">
          <span>Total</span>
          <span>{formatAUD(split.total)}</span>
        </div>
      </Card>

      {/* Footer */}
      <div className="text-center mt-8">
        <p className="text-sm text-muted-foreground mb-2">
          Want to split your own bill?
        </p>
        <Button asChild variant="outline">
          <Link href="/">
            Create Your Own Split
          </Link>
        </Button>
      </div>
    </div>
  );
}
