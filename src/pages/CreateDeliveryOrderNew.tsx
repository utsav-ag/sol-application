import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ItemsService } from '@/services/items.service';
import { DeliveryOrdersService } from '@/services/delivery-orders.service';
import { Item } from '@/types/api';
import { Search, Edit, Trash2, ShoppingCart, X } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface CartItem {
  item: Item;
  quantity: number;
}

export default function CreateDeliveryOrderNew() {
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const navigate = useNavigate();

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
      setFilteredItems(filtered.slice(0, 5));
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
    }
  };

  const addToCart = (item: Item) => {
    const existingItem = cart.find((cartItem) => cartItem.item.itemCode === item.itemCode);
    if (existingItem) {
      toast.error('Item already in cart');
      return;
    }
    setCart([...cart, { item, quantity: 1 }]);
    setSearchTerm('');
    setFilteredItems([]);
  };

  const updateQuantity = (itemCode: string, quantity: number) => {
    if (quantity <= 0) return;
    setCart(
      cart.map((cartItem) =>
        cartItem.item.itemCode === itemCode ? { ...cartItem, quantity } : cartItem
      )
    );
  };

  const removeFromCart = (itemCode: string) => {
    setCart(cart.filter((cartItem) => cartItem.item.itemCode !== itemCode));
  };

  const handleSaveAsPending = async () => {
    if (cart.length === 0) {
      toast.error('Please add items to the order');
      return;
    }

    setIsLoading(true);
    try {
      await DeliveryOrdersService.createOrder({
        status: 'DRAFT',
        items: cart.map((cartItem) => ({
          itemCode: cartItem.item.itemCode,
          quantity: cartItem.quantity,
        })),
      });
      toast.success('Order saved as pending');
      navigate('/delivery-orders');
    } catch (error) {
      toast.error('Failed to create order');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsDelivered = async () => {
    if (cart.length === 0) {
      toast.error('Please add items to the order');
      return;
    }

    setIsLoading(true);
    try {
      await DeliveryOrdersService.createOrder({
        status: 'FINAL',
        items: cart.map((cartItem) => ({
          itemCode: cartItem.item.itemCode,
          quantity: cartItem.quantity,
        })),
      });
      toast.success('Order created and marked as delivered');
      navigate('/delivery-orders');
    } catch (error) {
      toast.error('Failed to create order');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6 pb-20 md:pb-6">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by item name or item code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>

          {filteredItems.length > 0 && (
            <div className="mt-2 space-y-1">
              {filteredItems.map((item) => (
                <div
                  key={item.itemCode}
                  onClick={() => addToCart(item)}
                  className="p-3 hover:bg-muted rounded-md cursor-pointer transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm">{item.itemCode}</p>
                      <p className="text-xs text-muted-foreground">{item.itemName}</p>
                      <p className="text-xs text-muted-foreground">
                        Available: {item.qtyRemaining} | {item.godown}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Items in Cart
            </h2>
            <span className="text-sm text-muted-foreground">{cart.length} item{cart.length !== 1 ? 's' : ''}</span>
          </div>

          {cart.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Your cart is empty</p>
              <p className="text-sm">Search and select items above to add them to your cart</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map((cartItem) => (
                <div
                  key={cartItem.item.itemCode}
                  className="flex items-center gap-3 p-3 bg-muted rounded-md"
                >
                  <div className="flex-1">
                    <p className="font-semibold">{cartItem.item.itemCode}</p>
                    <p className="text-sm text-muted-foreground">{cartItem.item.itemName}</p>
                    <p className="text-xs text-muted-foreground">
                      {cartItem.item.godown} - {cartItem.item.rack || 'B2'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground text-center mb-1">QTY</p>
                      <Input
                        type="number"
                        min="1"
                        max={cartItem.item.qtyRemaining}
                        value={cartItem.quantity}
                        onChange={(e) =>
                          updateQuantity(cartItem.item.itemCode, parseInt(e.target.value) || 1)
                        }
                        className="w-16 h-8 text-center"
                      />
                    </div>

                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => removeFromCart(cartItem.item.itemCode)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Customer Name</Label>
              <Input
                placeholder="Enter customer name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input
                placeholder="Enter phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="destructive"
            onClick={() => navigate('/delivery-orders')}
            className="flex-1"
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button
            onClick={handleSaveAsPending}
            disabled={isLoading}
            className="flex-1 bg-accent text-accent-foreground"
          >
            Save as Pending
          </Button>
          <Button
            onClick={handleMarkAsDelivered}
            disabled={isLoading}
            className="flex-1 bg-success text-success-foreground hover:bg-success/90"
          >
            Mark as Delivered
          </Button>
        </div>
      </div>
    </Layout>
  );
}
