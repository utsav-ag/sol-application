import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DeliveryOrdersService } from '@/services/delivery-orders.service';
import { DeliveryOrder } from '@/types/api';
import { Plus, Package, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export default function DeliveryOrders() {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await DeliveryOrdersService.getAllOrders();
      setOrders(data);
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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">Delivery Orders</h1>
          <Button
            onClick={() => navigate('/delivery-orders/create')}
            className="btn-large gap-2"
          >
            <Plus className="h-5 w-5" />
            Create New Order
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground text-large">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-large text-muted-foreground">No delivery orders found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <Card key={order.id} className="card-interactive">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl">Order #{order.id}</CardTitle>
                      <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                        <Calendar className="h-5 w-5" />
                        <span className="text-large">
                          {format(new Date(order.createdAt), 'PPP')}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant={order.status === 'FINAL' ? 'default' : 'secondary'}
                      className="text-lg px-4 py-2"
                    >
                      {order.status === 'FINAL' ? 'Delivered' : 'Pending'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-xl">Items:</h3>
                    {order.deliveryItems.map((deliveryItem) => (
                      <div
                        key={deliveryItem.id}
                        className="flex justify-between items-center p-4 bg-muted rounded-lg"
                      >
                        <div className="space-y-1">
                          <p className="font-semibold text-large">
                            {deliveryItem.item.itemCode}
                          </p>
                          <p className="text-muted-foreground">
                            {deliveryItem.item.itemName}
                          </p>
                          <p className="text-muted-foreground">
                            {deliveryItem.item.godown} - Rack: {deliveryItem.item.rack || 'N/A'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">
                            {deliveryItem.quantity}
                          </p>
                          <p className="text-muted-foreground">units</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {order.status === 'DRAFT' && (
                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="secondary"
                        onClick={() => navigate(`/delivery-orders/edit/${order.id}`)}
                        className="btn-large flex-1"
                      >
                        Edit Order
                      </Button>
                      <Button
                        onClick={() => handleMarkAsDelivered(order.id)}
                        className="btn-large flex-1"
                      >
                        Mark as Delivered
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
