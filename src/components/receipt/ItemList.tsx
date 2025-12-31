'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import type { ReceiptItem, Participant } from '@/types';
import { formatAUD } from '@/lib/utils';
import { Plus, Trash2, Edit2, Check, X, Users } from 'lucide-react';

interface ItemListProps {
  items: ReceiptItem[];
  onItemsChange: (items: ReceiptItem[]) => void;
  total?: number;
  onTotalChange?: (total: number) => void;
  participants?: Participant[];
  mode?: 'edit' | 'assign';
}

export function ItemList({ 
  items, 
  onItemsChange, 
  total = 0,
  onTotalChange,
  participants = [],
  mode = 'edit' 
}: ItemListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', quantity: 1, unitPrice: 0 });
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(
    participants[0]?.id || null
  );

  const handleAddItem = () => {
    const newItem: ReceiptItem = {
      id: `item-${Date.now()}`,
      name: 'New Item',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      isShared: false,
      assignments: [],
    };
    onItemsChange([...items, newItem]);
    setEditingId(newItem.id);
    setEditForm({ name: newItem.name, quantity: 1, unitPrice: 0 });
  };

  const handleDeleteItem = (id: string) => {
    onItemsChange(items.filter(item => item.id !== id));
  };

  const handleEditStart = (item: ReceiptItem) => {
    setEditingId(item.id);
    setEditForm({
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    });
  };

  const handleEditSave = () => {
    if (!editingId) return;
    
    const totalPrice = editForm.quantity * editForm.unitPrice;
    onItemsChange(items.map(item => 
      item.id === editingId 
        ? { ...item, ...editForm, totalPrice }
        : item
    ));
    setEditingId(null);
  };

  const handleEditCancel = () => {
    setEditingId(null);
  };

  const handleItemClick = (item: ReceiptItem) => {
    if (mode !== 'assign' || !selectedParticipant) return;

    const existingAssignment = item.assignments.find(
      a => a.participantId === selectedParticipant
    );

    let newAssignments = [...item.assignments];

    if (existingAssignment) {
      // If already assigned to this person, check if it's the only one
      if (item.assignments.length === 1) {
        // Toggle to shared
        onItemsChange(items.map(i => 
          i.id === item.id 
            ? { ...i, isShared: true, assignments: [] }
            : i
        ));
        return;
      } else {
        // Remove this assignment
        newAssignments = newAssignments.filter(
          a => a.participantId !== selectedParticipant
        );
      }
    } else if (item.isShared) {
      // Was shared, now assign to one person
      onItemsChange(items.map(i => 
        i.id === item.id 
          ? { 
              ...i, 
              isShared: false, 
              assignments: [{
                id: `assign-${Date.now()}`,
                itemId: item.id,
                participantId: selectedParticipant,
                portion: 1,
                amount: item.totalPrice,
              }]
            }
          : i
      ));
      return;
    } else {
      // Add new assignment
      newAssignments.push({
        id: `assign-${Date.now()}`,
        itemId: item.id,
        participantId: selectedParticipant,
        portion: 1 / (newAssignments.length + 1),
        amount: item.totalPrice / (newAssignments.length + 1),
      });
      
      // Recalculate portions
      const portion = 1 / newAssignments.length;
      newAssignments = newAssignments.map(a => ({
        ...a,
        portion,
        amount: item.totalPrice * portion,
      }));
    }

    onItemsChange(items.map(i => 
      i.id === item.id 
        ? { ...i, assignments: newAssignments, isShared: false }
        : i
    ));
  };

  const getAssignedParticipants = (item: ReceiptItem) => {
    return item.assignments
      .map(a => participants.find(p => p.id === a.participantId))
      .filter(Boolean) as Participant[];
  };

  const calculatedTotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <div className="space-y-4">
      {/* Participant Selector (in assign mode) */}
      {mode === 'assign' && participants.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
          <span className="text-sm text-muted-foreground self-center mr-2">
            Assigning as:
          </span>
          {participants.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedParticipant(p.id)}
              className={`
                px-3 py-1.5 rounded-full text-sm font-medium transition-all
                ${selectedParticipant === p.id 
                  ? 'ring-2 ring-offset-2 ring-offset-background' 
                  : 'opacity-60 hover:opacity-100'}
              `}
              style={{ 
                backgroundColor: p.color,
                color: 'white',
                ['--tw-ring-color' as string]: p.color,
              }}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      {/* Items List */}
      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No items yet. Add items manually or scan a receipt.</p>
          </div>
        ) : (
          items.map(item => (
            <div
              key={item.id}
              onClick={() => mode === 'assign' && handleItemClick(item)}
              className={`
                flex items-center gap-3 p-3 rounded-lg border transition-all
                ${mode === 'assign' ? 'cursor-pointer hover:border-primary/50' : ''}
                ${item.isShared ? 'bg-primary/5 border-primary/30' : 'bg-background'}
              `}
            >
              {editingId === item.id ? (
                // Edit Mode
                <div className="flex-1 flex flex-wrap gap-2">
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Item name"
                    className="flex-1 min-w-[120px]"
                    autoFocus
                  />
                  <Input
                    type="number"
                    value={editForm.quantity}
                    onChange={(e) => setEditForm({ ...editForm, quantity: parseInt(e.target.value) || 1 })}
                    className="w-16"
                    min={1}
                  />
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={editForm.unitPrice}
                      onChange={(e) => setEditForm({ ...editForm, unitPrice: parseFloat(e.target.value) || 0 })}
                      className="w-24 pl-7"
                      step={0.01}
                      min={0}
                    />
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={handleEditSave}>
                      <Check className="w-4 h-4 text-green-600" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={handleEditCancel}>
                      <X className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ) : (
                // Display Mode
                <>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{item.name}</span>
                      {item.quantity > 1 && (
                        <Badge variant="secondary" className="text-xs">
                          ×{item.quantity}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Assignment indicators */}
                    {mode === 'assign' && (
                      <div className="flex items-center gap-1 mt-1">
                        {item.isShared ? (
                          <Badge variant="outline" className="text-xs">
                            <Users className="w-3 h-3 mr-1" />
                            Shared by all
                          </Badge>
                        ) : item.assignments.length > 0 ? (
                          <div className="flex gap-1">
                            {getAssignedParticipants(item).map(p => (
                              <div
                                key={p.id}
                                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold"
                                style={{ backgroundColor: p.color }}
                                title={p.name}
                              >
                                {p.name.charAt(0).toUpperCase()}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Tap to assign
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="font-medium text-right">
                    {formatAUD(item.totalPrice)}
                  </div>

                  {mode === 'edit' && (
                    <div className="flex gap-1">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditStart(item);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteItem(item.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Item Button (edit mode only) */}
      {mode === 'edit' && (
        <Button variant="outline" onClick={handleAddItem} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      )}

      {/* Total */}
      <div className="flex justify-between items-center pt-4 border-t font-semibold text-lg">
        <span>Total</span>
        <span>{formatAUD(total || calculatedTotal)}</span>
      </div>
    </div>
  );
}
