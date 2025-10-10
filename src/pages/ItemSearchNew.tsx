import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ItemsService } from '@/services/items.service';
import { Item } from '@/types/api';
import { Search } from 'lucide-react';
import { toast } from 'sonner';

export default function ItemSearchNew() {
  const [items, setItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = items.filter(
        (item) =>
          item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, items]);

  const loadItems = async () => {
    try {
      const data = await ItemsService.getAllItems();
      setItems(data);
    } catch (error) {
      toast.error('Failed to load items');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6 pb-20 md:pb-6">
        <div className="relative max-w-4xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by Item Code, Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-14 text-base rounded-2xl bg-white border border-gray-200 hover:shadow-2xl"
            autoFocus
          />
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : searchResults.length === 0 && searchTerm ? (
          <div className="text-center py-12 text-muted-foreground">
            No items found matching your search
          </div>
        ) : searchResults.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Start typing to search for items
          </div>
        ) : (
          <div className="space-y-3">
            {searchResults.map((item) => (
              <div
                key={item.itemCode}
                className={`
                        bg-card max-w-4xl mx-auto border border-gray-200 rounded-3xl
                        ${item.qtyRemaining < 20 ? 'hover:bg-stone-50'
                          : item.qtyRemaining < 100 ? 'hover:bg-[#B55233]/5' : 'hover:bg-orange-50'}
                        hover:shadow-2xl transition-shadow
                      `}
              >
                <div className="grid grid-cols-[8rem,1fr,13rem,10rem] gap-6">
                  <div className="w-40 h-40 bg-muted rounded-l-3xl flex items-center justify-center text-muted-foreground text-sm flex-shrink-0">
                    No Image
                  </div>

                  <div className="flex-1 items-start my-1 py-5 pl-10">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-2xl font-bold">{item.itemCode}</h3>
                      <Badge className="bg-orange-400 text-primary-foreground font-medium">{item.thickness}</Badge>
                    </div>
                    <div className="mb-6">
                      <p className="text-lg text-gray-600">{item.itemName}</p>
                    </div>
                    <div className="flex flex-row items-baseline gap-x-2 mb-1">
                      <span className="font-light text-xs text-gray-400">Type:</span>
                      <span className="font-light text-sm text-gray-500">{item.type}</span>
                    </div>
                  </div>
                  <div className="text-muted-foreground flex flex-col my-2 py-5">
                    <div className="grid grid-cols-2 w-44 gap-x-4 font-light mb-1 text-gray-400 text-xs">
                      <span>Godown</span>
                      <span>Rack</span>
                    </div>
                    <div className="grid grid-cols-2 w-44 gap-x-4 text-base text-gray-500 font-light">
                      <span >{item.godown}</span>
                      <span>{item.rack || 'B2'}</span>
                    </div>
                  </div>
                  <div className="h-full flex items-stretch">
                    <div
                      className={`
                        flex flex-col justify-center items-center
                        h-full w-full rounded-r-3xl
                        ${item.qtyRemaining < 20 ? 'bg-stone-500'
                          : item.qtyRemaining < 100 ? 'bg-[#B55233]/60' : 'bg-orange-300'}
                        text-white
                      `}
                      style={{ minWidth: 110 }}
                    >
                      <span className="text-base font-thin mb-1">Remaining</span>
                      <span className="text-4xl font-semibold mb-2">{item.qtyRemaining}</span>
                      <span className="text-base font-normal opacity-80 -mt-2">pcs</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
