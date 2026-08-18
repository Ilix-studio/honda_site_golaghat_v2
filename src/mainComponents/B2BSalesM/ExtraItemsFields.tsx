import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface ExtraItemDraft {
  name: string;
  unitPrice: number;
  quantity: number;
}

interface ExtraItemsFieldsProps {
  items: ExtraItemDraft[];
  onChange: (items: ExtraItemDraft[]) => void;
}

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const EMPTY_ITEM: ExtraItemDraft = { name: "", unitPrice: 0, quantity: 1 };

const ExtraItemsFields = ({ items, onChange }: ExtraItemsFieldsProps) => {
  const updateItem = (index: number, patch: Partial<ExtraItemDraft>) => {
    const next = items.map((item, i) => (i === index ? { ...item, ...patch } : item));
    onChange(next);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between'>
        <Label>Extra Items (not linked to stock)</Label>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() => onChange([...items, { ...EMPTY_ITEM }])}
        >
          <Plus className='h-4 w-4 mr-1.5' />
          Add Extra Item
        </Button>
      </div>

      {items.length === 0 ? (
        <p className='text-sm text-muted-foreground'>No extra items added.</p>
      ) : (
        <div className='space-y-2'>
          {items.map((item, index) => (
            <div
              key={index}
              className='grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 items-center border rounded-lg p-2'
            >
              <Input
                value={item.name}
                onChange={(e) => updateItem(index, { name: e.target.value })}
                placeholder='Item name'
              />
              <Input
                type='number'
                min={0}
                value={item.unitPrice === 0 ? "" : item.unitPrice}
                onChange={(e) =>
                  updateItem(index, { unitPrice: Math.max(0, Number(e.target.value) || 0) })
                }
                placeholder='0'
                className='w-28'
              />
              <span className='text-muted-foreground text-sm'>×</span>
              <Input
                type='number'
                min={1}
                value={item.quantity}
                onChange={(e) =>
                  updateItem(index, { quantity: Math.max(1, Number(e.target.value) || 1) })
                }
                placeholder='Qty'
                className='w-20'
              />
              <div className='flex items-center gap-2'>
                <span className='text-sm font-semibold w-24 text-right'>
                  {inr(item.unitPrice * item.quantity)}
                </span>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='h-7 w-7'
                  onClick={() => removeItem(index)}
                  aria-label='Remove extra item'
                >
                  <X className='h-4 w-4 text-red-600' />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExtraItemsFields;
