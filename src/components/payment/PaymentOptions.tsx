'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import type { Participant } from '@/types';
import { formatAUD, copyToClipboard, getShareUrl, formatBSB } from '@/lib/utils';
import { 
  Copy, 
  Check, 
  Share2, 
  CreditCard, 
  Building2,
  ExternalLink,
  QrCode,
  MessageCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface PaymentOptionsProps {
  participants: Participant[];
  total: number;
  venueName?: string;
}

export function PaymentOptions({ participants, total, venueName }: PaymentOptionsProps) {
  const [payId, setPayId] = useState('');
  const [bsb, setBsb] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [shareId] = useState(() => Math.random().toString(36).substring(2, 10));

  // Calculate who owes what (excluding "Me")
  const owingParticipants = useMemo(() => {
    return participants.filter(p => p.name.toLowerCase() !== 'me' && p.amountOwed > 0);
  }, [participants]);

  const handleCopy = async (text: string, label: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(label);
      toast.success(`${label} copied!`);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const handleShareLink = async () => {
    const shareUrl = getShareUrl(shareId);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: venueName ? `Split: ${venueName}` : 'Bill Split',
          text: `Here's what you owe for ${venueName || 'our bill'}`,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or share failed, fall back to copy
        handleCopy(shareUrl, 'Share link');
      }
    } else {
      handleCopy(shareUrl, 'Share link');
    }
  };

  const handleShareSMS = () => {
    const message = participants
      .filter(p => p.name.toLowerCase() !== 'me')
      .map(p => `${p.name}: ${formatAUD(p.amountOwed || 0)}`)
      .join('\n');
    
    const smsBody = encodeURIComponent(
      `${venueName ? `${venueName} - ` : ''}Here's what everyone owes:\n\n${message}\n\nTotal: ${formatAUD(total)}`
    );
    
    window.open(`sms:?body=${smsBody}`, '_blank');
  };

  const generatePaymentMessage = (participant: Participant) => {
    return `Payment for ${venueName || 'bill split'}: ${formatAUD(participant.amountOwed || 0)}`;
  };

  return (
    <div className="space-y-6">
      {/* Share Link */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          Share with Friends
        </h3>
        
        <div className="flex gap-2">
          <Button onClick={handleShareLink} className="flex-1">
            <ExternalLink className="w-4 h-4 mr-2" />
            Share Link
          </Button>
          <Button variant="outline" onClick={handleShareSMS}>
            <MessageCircle className="w-4 h-4 mr-2" />
            SMS
          </Button>
        </div>
      </Card>

      {/* PayID */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          PayID
          <Badge variant="secondary" className="ml-auto">Instant</Badge>
        </h3>
        
        <p className="text-sm text-muted-foreground mb-3">
          Enter your PayID (email or mobile) so friends can pay you instantly.
        </p>
        
        <div className="flex gap-2">
          <Input
            value={payId}
            onChange={(e) => setPayId(e.target.value)}
            placeholder="email@example.com or 04xx xxx xxx"
            className="flex-1"
          />
          {payId && (
            <Button
              variant="outline"
              onClick={() => handleCopy(payId, 'PayID')}
            >
              {copied === 'PayID' ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>

        {payId && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Friends can pay you via:</p>
            <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
              <li>Open their banking app</li>
              <li>Choose "Pay Someone" → "PayID"</li>
              <li>Enter: <span className="font-mono text-foreground">{payId}</span></li>
              <li>Enter the amount they owe</li>
            </ol>
          </div>
        )}
      </Card>

      {/* Bank Transfer */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Bank Transfer
        </h3>
        
        <p className="text-sm text-muted-foreground mb-3">
          Enter your bank details for direct transfers.
        </p>
        
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">BSB</label>
              <Input
                value={bsb}
                onChange={(e) => setBsb(e.target.value)}
                placeholder="XXX-XXX"
                maxLength={7}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Account Number</label>
              <Input
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="XXXXXXXX"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Account Name</label>
            <Input
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Your Name"
            />
          </div>
        </div>

        {bsb && accountNumber && (
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => handleCopy(
                `BSB: ${formatBSB(bsb)}\nAccount: ${accountNumber}\nName: ${accountName}`,
                'Bank details'
              )}
              className="w-full"
            >
              {copied === 'Bank details' ? (
                <Check className="w-4 h-4 mr-2" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              Copy Bank Details
            </Button>
          </div>
        )}
      </Card>

      {/* Payment Summary */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Payment Summary</h3>
        
        <div className="space-y-2">
          {participants.map(p => (
            <div key={p.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: p.color }}
                >
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <span>{p.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{formatAUD(p.amountOwed || 0)}</span>
                {p.name.toLowerCase() === 'me' ? (
                  <Badge variant="secondary">You</Badge>
                ) : p.amountPaid >= (p.amountOwed || 0) ? (
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
          <span>{formatAUD(total)}</span>
        </div>
      </Card>

      {/* Beem It Link */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Other Payment Apps</h3>
        
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" asChild>
            <a 
              href="https://www.beemit.com.au/" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Beem It
              <ExternalLink className="w-3 h-3 ml-2" />
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a 
              href="https://www.paypal.com/au" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              PayPal
              <ExternalLink className="w-3 h-3 ml-2" />
            </a>
          </Button>
        </div>
      </Card>
    </div>
  );
}
