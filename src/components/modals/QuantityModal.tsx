import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Item } from '@/types/api';

interface QuantityModalProps {
  open: boolean;
  item: Item | null;
  currentQuantity?: number;
  onConfirm: (quantity: number) => void;
  onClose: () => void;
}

export function QuantityModal({ open, item, currentQuantity, onConfirm, onClose }: QuantityModalProps) {
  const [quantity, setQuantity] = useState<number | ''>(1); // allow empty string
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (item) {
      setQuantity(currentQuantity ?? '');
      setError('');
    }
  }, [item, currentQuantity]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  if (!open || !item) return null;

  const maxQty = item.qtyRemaining || 99;

  const getQtyColor = () => {
    if (maxQty > 20) return 'text-green-700'; // dark green
    if (maxQty > 5) return 'text-amber-700'; // dark amber
    return 'text-red-700'; // dark red
  };

  // Validate input
  const validate = (val: number | '') => {
    if (val === '' || val <= 0) {
      setError('Quantity is required');
      return false;
    } else if (val > maxQty) {
      setError(`Quantity cannot exceed ${maxQty}`);
      return false;
    } else {
      setError('');
      return true;
    }
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0);
    setQuantity(val);
    validate(val);
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && validate(quantity)) {
      onConfirm(quantity as number);
    }
  };

  // Handle button click
  const handleConfirm = () => {
    if (validate(quantity)) {
      onConfirm(quantity as number);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="relative bg-white rounded-xl p-6 w-[400px] h-[250px] shadow-2xl"> 
        <h2 className="font-medium text-lg mb-6 text-start text-gray-800">
          {currentQuantity ? 'Edit Item Quantity' : 'Add Quantity'}
          </h2>
        <div className='grid grid-cols-[2fr_2fr] mb-5'>
          {/* Item Name */}
          <div> 
            <span className="font-bold text-lg text-gray-600">{item.itemCode}</span>
          </div>

          {/* Available Qty */}
          <div className="flex text-sm justify-end text-right items-center">
            <span className="font-thin text-sm text-gray-500 mr-2">Remaining:</span>
            <span className={`font-bold text-2xl ${getQtyColor()}`}>{maxQty}</span>
          </div>
        </div>

        {/* Quantity Input */}
        <div className={`${error ? 'mb-1' : 'mb-7'}`}>
        <Input
          ref={inputRef}
          type="number"
          min={1}
          max={500}
          value={quantity}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="text-center text-lg font-semibold"
          placeholder="Enter quantity"
        />
        {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <Button
            className="flex-1 bg-orange-500 text-white hover:bg-orange-600"
            onClick={handleConfirm}
            disabled={!!error}
          >
            Add to Cart
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
