import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Example customer data. Replace with API or full data as needed.
const mockCustomers = [
  { id: '1', name: 'Cash', phone: '9876543210' },
  { id: '2', name: 'Beta LLC', phone: '8765432109' },
  { id: '3', name: 'Customer Z', phone: '9090909090' }
];

export function CustomerSearchModal({ open, onClose, onSelect }) {
  const [search, setSearch] = useState('');

  if (!open) return null;

  const filtered = mockCustomers.filter(
    c => c.name.toLowerCase().includes(search.toLowerCase())
      || c.phone.includes(search)
  );

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-[360px] shadow-2xl">
        <h2 className="font-bold text-lg mb-3">Search Customer</h2>
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Type name or phone"
          className="mb-4"
        />
        <div className="max-h-64 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="text-gray-400 py-8 text-center">No customers found</div>
          ) : (
            filtered.map(cust => (
              <div
                key={cust.id}
                className="flex justify-between items-center px-3 py-3 hover:bg-blue-100 rounded cursor-pointer mb-2"
                onClick={() => { onSelect(cust); onClose(); }}
              >
                <div>
                  <div className="font-semibold">{cust.name}</div>
                  <div className="text-xs text-gray-500">{cust.phone}</div>
                </div>
                <Button size="sm">Select</Button>
              </div>
            ))
          )}
        </div>
        <Button variant="ghost" className="mt-3 w-full" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
