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
      <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6 pb-20 md:pb-6">
        <div className="relative max-w-4xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by Item Code, Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-14 text-base rounded-full"
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
          <div className="space-y-4">
            {searchResults.map((item) => (
              <div
                key={item.itemCode}
                className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-6">
                  <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-sm flex-shrink-0">
                    No Image
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-2xl font-bold">{item.itemCode}</h3>
                          <Badge className="bg-primary text-primary-foreground">
                            {item.type}
                          </Badge>
                          <Badge variant="secondary">{item.thickness}</Badge>
                        </div>
                        <p className="text-lg text-muted-foreground">{item.itemName}</p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-muted-foreground mb-1">Quantity Available</p>
                        <div className="bg-primary text-primary-foreground px-6 py-3 rounded-lg">
                          <p className="text-2xl font-bold">{item.qtyRemaining} pcs</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-muted-foreground">
                      <span className="font-medium">Location:</span> {item.godown} ({item.rack || 'B2'}); Shop (B1)
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
