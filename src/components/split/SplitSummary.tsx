'use client';

import { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { ReceiptItem, Participant } from '@/types';
import { formatAUD, splitEvenly } from '@/lib/utils';

interface SplitSummaryProps {
  items: ReceiptItem[];
  participants: Participant[];
  total: number;
}

interface ParticipantSummary {
  participant: Participant;
  assignedItems: { item: ReceiptItem; amount: number }[];
  sharedAmount: number;
  totalOwed: number;
}

export function SplitSummary({ items, participants, total }: SplitSummaryProps) {
  const summary = useMemo(() => {
    // Calculate shared items total
    const sharedItems = items.filter(item => item.isShared);
    const sharedTotal = sharedItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const sharedPerPerson = participants.length > 0 
      ? splitEvenly(sharedTotal, participants.length)
      : [];

    // Calculate unassigned items (split evenly as well)
    const unassignedItems = items.filter(
      item => !item.isShared && item.assignments.length === 0
    );
    const unassignedTotal = unassignedItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const unassignedPerPerson = participants.length > 0 
      ? splitEvenly(unassignedTotal, participants.length)
      : [];

    // Build summary for each participant
    const participantSummaries: ParticipantSummary[] = participants.map((participant, index) => {
      // Get directly assigned items
      const assignedItems = items
        .filter(item => !item.isShared && item.assignments.some(a => a.participantId === participant.id))
        .map(item => {
          const assignment = item.assignments.find(a => a.participantId === participant.id);
          return {
            item,
            amount: assignment ? assignment.amount : 0,
          };
        });

      const assignedTotal = assignedItems.reduce((sum, { amount }) => sum + amount, 0);
      const sharedAmount = (sharedPerPerson[index] || 0) + (unassignedPerPerson[index] || 0);
      const totalOwed = assignedTotal + sharedAmount;

      return {
        participant,
        assignedItems,
        sharedAmount,
        totalOwed,
      };
    });

    return {
      participantSummaries,
      sharedTotal: sharedTotal + unassignedTotal,
      sharedItems: [...sharedItems, ...unassignedItems],
    };
  }, [items, participants]);

  const calculatedTotal = summary.participantSummaries.reduce(
    (sum, ps) => sum + ps.totalOwed, 
    0
  );

  return (
    <div className="space-y-4">
      {/* Per-Person Breakdown */}
      {summary.participantSummaries.map(({ participant, assignedItems, sharedAmount, totalOwed }) => (
        <Card key={participant.id} className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: participant.color }}
              >
                {participant.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-semibold">{participant.name}</span>
            </div>
            <span className="text-xl font-bold">{formatAUD(totalOwed)}</span>
          </div>

          {/* Item breakdown */}
          <div className="space-y-1 text-sm">
            {assignedItems.map(({ item, amount }) => (
              <div key={item.id} className="flex justify-between text-muted-foreground">
                <span className="truncate flex-1 mr-2">
                  {item.name}
                  {item.assignments.length > 1 && (
                    <span className="text-xs ml-1">
                      (split {item.assignments.length} ways)
                    </span>
                  )}
                </span>
                <span>{formatAUD(amount)}</span>
              </div>
            ))}
            
            {sharedAmount > 0 && (
              <div className="flex justify-between text-muted-foreground border-t pt-1 mt-2">
                <span className="italic">Shared items</span>
                <span>{formatAUD(sharedAmount)}</span>
              </div>
            )}
          </div>
        </Card>
      ))}

      {/* Shared Items Detail */}
      {summary.sharedItems.length > 0 && (
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Badge variant="outline">Shared</Badge>
            Split evenly among {participants.length} people
          </h4>
          <div className="space-y-1 text-sm text-muted-foreground">
            {summary.sharedItems.map(item => (
              <div key={item.id} className="flex justify-between">
                <span>{item.name}</span>
                <span>{formatAUD(item.totalPrice)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grand Total */}
      <div className="flex justify-between items-center pt-4 border-t text-lg font-bold">
        <span>Total</span>
        <span>{formatAUD(total || calculatedTotal)}</span>
      </div>

      {/* Verification */}
      {Math.abs(calculatedTotal - total) > 0.01 && total > 0 && (
        <div className="text-sm text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
          ⚠️ The assigned amounts ({formatAUD(calculatedTotal)}) don't match the receipt total ({formatAUD(total)}). 
          Some items may be unassigned.
        </div>
      )}
    </div>
  );
}
