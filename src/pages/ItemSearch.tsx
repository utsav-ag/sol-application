import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ItemsService } from '@/services/items.service';
import { Item } from '@/types/api';
import { Search, Package } from 'lucide-react';
import { toast } from 'sonner';

export default function ItemSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = items.filter((item) =>
        item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems([]);
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
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Search Items</h1>
          
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by item code or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-16 pl-14 text-xl"
              autoFocus
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground text-large">
            Loading items...
          </div>
        ) : searchTerm && filteredItems.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-large">
            No items found matching "{searchTerm}"
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredItems.map((item) => (
              <Card key={item.itemCode} className="card-interactive">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {item.itemImage ? (
                      <img
                        src={item.itemImage}
                        alt={item.itemName}
                        className="w-32 h-32 object-cover rounded-lg border border-border"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-muted rounded-lg border border-border flex items-center justify-center">
                        <Package className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    
                    <div className="flex-1 space-y-3">
                      <h3 className="text-2xl font-bold text-foreground">
                        {item.itemCode}
                      </h3>
                      <p className="text-large text-foreground">{item.itemName}</p>
                      
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                          <p className="text-muted-foreground">Quantity Remaining</p>
                          <p className="text-xl font-semibold text-foreground">
                            {item.qtyRemaining}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Type & Thickness</p>
                          <p className="text-xl font-semibold text-foreground">
                            {item.type} {item.thickness && `- ${item.thickness}`}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Godown</p>
                          <p className="text-xl font-semibold text-foreground">
                            {item.godown}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Rack</p>
                          <p className="text-xl font-semibold text-foreground">
                            {item.rack || 'Not assigned'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
