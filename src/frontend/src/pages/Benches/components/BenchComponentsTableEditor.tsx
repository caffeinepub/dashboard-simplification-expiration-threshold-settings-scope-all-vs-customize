import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { Status } from '../../../backend';
import type { Component } from '../../../backend';
import { computeExpirationStatus } from '../../../utils/expirationSettings';

interface BenchComponentsTableEditorProps {
  components: Component[];
  onChange: (components: Component[]) => void;
  effectiveThreshold: number;
  benchId?: string;
  readOnly?: boolean;
}

export function BenchComponentsTableEditor({
  components,
  onChange,
  effectiveThreshold,
  benchId = '',
  readOnly = false,
}: BenchComponentsTableEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{
    componentName: string;
    manufacturerReference: string;
    validityDate: string;
    expirationDate: string;
  }>({
    componentName: '',
    manufacturerReference: '',
    validityDate: '',
    expirationDate: '',
  });

  const startAdd = () => {
    setEditingIndex(-1);
    setEditForm({
      componentName: '',
      manufacturerReference: '',
      validityDate: '',
      expirationDate: '',
    });
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    const comp = components[index];
    setEditForm({
      componentName: comp.componentName,
      manufacturerReference: comp.manufacturerReference || '',
      validityDate: comp.validityDate,
      expirationDate: comp.expirationDate,
    });
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditForm({
      componentName: '',
      manufacturerReference: '',
      validityDate: '',
      expirationDate: '',
    });
  };

  const saveEdit = () => {
    if (!editForm.componentName.trim() || !editForm.validityDate || !editForm.expirationDate) {
      return;
    }

    const status = computeExpirationStatus(editForm.expirationDate, effectiveThreshold);

    const newComponent: Component = {
      componentName: editForm.componentName.trim(),
      manufacturerReference: editForm.manufacturerReference.trim(),
      validityDate: editForm.validityDate,
      expirationDate: editForm.expirationDate,
      status: status === 'ok' ? Status.ok : status === 'expiringSoon' ? Status.expiringSoon : Status.expired,
      associatedBenchId: benchId,
    };

    if (editingIndex === -1) {
      onChange([...components, newComponent]);
    } else if (editingIndex !== null) {
      const updated = [...components];
      updated[editingIndex] = newComponent;
      onChange(updated);
    }

    cancelEdit();
  };

  const removeComponent = (index: number) => {
    onChange(components.filter((_, i) => i !== index));
  };

  const getStatusBadge = (component: Component) => {
    const status = computeExpirationStatus(component.expirationDate, effectiveThreshold);
    
    if (status === 'expired') {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (status === 'expiringSoon') {
      return <Badge className="bg-orange-500 hover:bg-orange-600">Expiring Soon</Badge>;
    }
    return <Badge variant="secondary">OK</Badge>;
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Equipment Name</TableHead>
            <TableHead>AML (Manufacturer Ref)</TableHead>
            <TableHead>Validity Date</TableHead>
            <TableHead>Expiration Date</TableHead>
            <TableHead>Status</TableHead>
            {!readOnly && <TableHead className="w-[100px]">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {components.map((component, index) => (
            <TableRow key={index}>
              {editingIndex === index ? (
                <>
                  <TableCell>
                    <Input
                      value={editForm.componentName}
                      onChange={(e) => setEditForm({ ...editForm, componentName: e.target.value })}
                      placeholder="Equipment name"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={editForm.manufacturerReference}
                      onChange={(e) => setEditForm({ ...editForm, manufacturerReference: e.target.value })}
                      placeholder="AML reference"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="date"
                      value={editForm.validityDate}
                      onChange={(e) => setEditForm({ ...editForm, validityDate: e.target.value })}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="date"
                      value={editForm.expirationDate}
                      onChange={(e) => setEditForm({ ...editForm, expirationDate: e.target.value })}
                    />
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">Editing...</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={saveEdit}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={cancelEdit}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </>
              ) : (
                <>
                  <TableCell className="font-medium">{component.componentName}</TableCell>
                  <TableCell>{component.manufacturerReference || '—'}</TableCell>
                  <TableCell>{component.validityDate}</TableCell>
                  <TableCell>{component.expirationDate}</TableCell>
                  <TableCell>{getStatusBadge(component)}</TableCell>
                  {!readOnly && (
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => startEdit(index)}
                          disabled={editingIndex !== null}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeComponent(index)}
                          disabled={editingIndex !== null}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </>
              )}
            </TableRow>
          ))}
          {editingIndex === -1 && (
            <TableRow>
              <TableCell>
                <Input
                  value={editForm.componentName}
                  onChange={(e) => setEditForm({ ...editForm, componentName: e.target.value })}
                  placeholder="Equipment name"
                />
              </TableCell>
              <TableCell>
                <Input
                  value={editForm.manufacturerReference}
                  onChange={(e) => setEditForm({ ...editForm, manufacturerReference: e.target.value })}
                  placeholder="AML reference"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="date"
                  value={editForm.validityDate}
                  onChange={(e) => setEditForm({ ...editForm, validityDate: e.target.value })}
                />
              </TableCell>
              <TableCell>
                <Input
                  type="date"
                  value={editForm.expirationDate}
                  onChange={(e) => setEditForm({ ...editForm, expirationDate: e.target.value })}
                />
              </TableCell>
              <TableCell>
                <Badge variant="outline">New</Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={saveEdit}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={cancelEdit}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {!readOnly && editingIndex === null && (
        <Button onClick={startAdd} variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Component
        </Button>
      )}

      {components.length === 0 && editingIndex === null && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No components added yet. Click "Add Component" to get started.
        </p>
      )}
    </div>
  );
}
