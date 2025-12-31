'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Participant } from '@/types';
import { PARTICIPANT_COLORS } from '@/types';
import { Plus, X, Edit2, Check } from 'lucide-react';

interface ParticipantManagerProps {
  participants: Participant[];
  onParticipantsChange: (participants: Participant[]) => void;
}

export function ParticipantManager({ 
  participants, 
  onParticipantsChange 
}: ParticipantManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [newName, setNewName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const getNextColor = () => {
    const usedColors = participants.map(p => p.color);
    const availableColor = PARTICIPANT_COLORS.find(c => !usedColors.includes(c));
    return availableColor || PARTICIPANT_COLORS[participants.length % PARTICIPANT_COLORS.length];
  };

  const handleAddParticipant = () => {
    if (!newName.trim()) return;
    
    const newParticipant: Participant = {
      id: `participant-${Date.now()}`,
      name: newName.trim(),
      color: getNextColor(),
      amountOwed: 0,
      amountPaid: 0,
    };
    
    onParticipantsChange([...participants, newParticipant]);
    setNewName('');
    setIsAdding(false);
  };

  const handleRemoveParticipant = (id: string) => {
    onParticipantsChange(participants.filter(p => p.id !== id));
  };

  const handleEditStart = (participant: Participant) => {
    setEditingId(participant.id);
    setEditName(participant.name);
  };

  const handleEditSave = () => {
    if (!editingId || !editName.trim()) return;
    
    onParticipantsChange(participants.map(p => 
      p.id === editingId ? { ...p, name: editName.trim() } : p
    ));
    setEditingId(null);
    setEditName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Who's splitting?</h3>
        <span className="text-sm text-muted-foreground">
          {participants.length} {participants.length === 1 ? 'person' : 'people'}
        </span>
      </div>

      {/* Participants List */}
      <div className="flex flex-wrap gap-2">
        {participants.map(participant => (
          <div
            key={participant.id}
            className="flex items-center gap-1 pl-3 pr-1 py-1 rounded-full text-white text-sm font-medium"
            style={{ backgroundColor: participant.color }}
          >
            {editingId === participant.id ? (
              <>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, handleEditSave)}
                  className="h-6 w-24 px-2 text-sm bg-white/20 border-white/30 text-white placeholder:text-white/60"
                  autoFocus
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleEditSave}
                  className="h-6 w-6 hover:bg-white/20"
                >
                  <Check className="w-3 h-3" />
                </Button>
              </>
            ) : (
              <>
                <span>{participant.name}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleEditStart(participant)}
                  className="h-6 w-6 hover:bg-white/20"
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
                {participants.length > 1 && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleRemoveParticipant(participant.id)}
                    className="h-6 w-6 hover:bg-white/20"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </>
            )}
          </div>
        ))}

        {/* Add New Participant */}
        {isAdding ? (
          <div className="flex items-center gap-1 border rounded-full pl-3 pr-1 py-1">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, handleAddParticipant)}
              placeholder="Name"
              className="h-6 w-24 px-2 text-sm border-0 focus-visible:ring-0"
              autoFocus
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={handleAddParticipant}
              className="h-6 w-6"
              disabled={!newName.trim()}
            >
              <Check className="w-3 h-3 text-green-600" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                setIsAdding(false);
                setNewName('');
              }}
              className="h-6 w-6"
            >
              <X className="w-3 h-3 text-red-600" />
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="rounded-full"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Person
          </Button>
        )}
      </div>
    </div>
  );
}
