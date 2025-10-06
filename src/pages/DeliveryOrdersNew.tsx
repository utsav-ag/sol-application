import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DeliveryOrdersService } from '@/services/delivery-orders.service';
import { DeliveryOrder } from '@/types/api';
import { Search, ShoppingCart, Edit, Package2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export default function DeliveryOrdersNew() {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<DeliveryOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = orders.filter((order) =>
        order.id.toString().includes(searchTerm)
      );
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(orders);
    }
  }, [searchTerm, orders]);

  const loadOrders = async () => {
    try {
      const data = await DeliveryOrdersService.getAllOrders();
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      toast.error('Failed to load delivery orders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsDelivered = async (orderId: number) => {
    try {
      await DeliveryOrdersService.updateOrderStatus(orderId, 'FINAL');
      toast.success('Order marked as delivered');
      loadOrders();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const totalQuantity = (order: DeliveryOrder) =>
    order.deliveryItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Layout>
      <div className="p-4 md:p-6 pb-20 md:pb-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative flex-1 max-w-2xl w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by Customer Name or Delivery Order Code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              onClick={() => navigate('/create-order')}
              className="bg-primary text-primary-foreground w-full md:w-auto"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Create Order
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No delivery orders found</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredOrders.map((order) => (
                <div key={order.id} className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">DO{String(order.id).padStart(6, '0')}</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(order.createdAt), 'yyyy-MM-dd')}
                      </p>
                    </div>
                    <Badge
                      variant={order.status === 'FINAL' ? 'default' : 'secondary'}
                      className={order.status === 'DRAFT' ? 'bg-red-100 text-red-800' : ''}
                    >
                      {order.status === 'FINAL' ? 'Delivered' : 'Pending'}
                    </Badge>
                  </div>

                  <div className="mb-4">
                    <p className="font-medium">Krishna Ply, Darbhanga</p>
                    <p className="text-sm text-muted-foreground">9876543210</p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <ShoppingCart className="h-4 w-4" />
                      <span className="font-medium">Delivery Items</span>
                      <span className="text-muted-foreground">{totalQuantity(order)} QTY</span>
                      <span className="text-muted-foreground">{order.deliveryItems.length} ITEMS</span>
                    </div>

                    {order.deliveryItems.slice(0, 4).map((deliveryItem) => (
                      <div key={deliveryItem.id} className="flex items-center justify-between text-sm">
                        <span className="font-medium">{deliveryItem.item.itemCode}</span>
                        <div className="flex items-center gap-4">
                          <span>{deliveryItem.quantity}</span>
                          <span className="text-muted-foreground text-xs">
                            {deliveryItem.item.godown} - {deliveryItem.item.rack || 'B2'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {order.status === 'DRAFT' && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/edit-order/${order.id}`)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleMarkAsDelivered(order.id)}
                        className="flex-1 bg-success text-success-foreground hover:bg-success/90"
                      >
                        <Package2 className="h-4 w-4 mr-1" />
                        Mark Delivered
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
