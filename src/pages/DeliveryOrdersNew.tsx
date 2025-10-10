import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DeliveryOrdersService } from '@/services/delivery-orders.service';
import { DeliveryOrder } from '@/types/api';
import { Search, ShoppingCart, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { format, subDays } from 'date-fns';

export default function DeliveryOrdersNew() {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<DeliveryOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Date range: only 4 days allowed
  const today = new Date();
  const defaultFrom = format(subDays(today, 3), "yyyy-MM-dd");
  const defaultTo = format(today, "yyyy-MM-dd");
  const [dateRange, setDateRange] = useState({ from: defaultFrom, to: defaultTo });

  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line
  }, [dateRange]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = orders.filter(
        (order) =>
          order.id.toString().includes(searchTerm) //|| order.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(orders);
    }
  }, [searchTerm, orders]);

  const loadOrders = async () => {
    try {
      const data = await DeliveryOrdersService.getAllOrders();
      const filteredByDate = data.filter((order: DeliveryOrder) => {
        const date = format(new Date(order.createdAt), "yyyy-MM-dd");
        return date >= dateRange.from && date <= dateRange.to;
      });
      setOrders(filteredByDate);
      setFilteredOrders(filteredByDate);
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

  // For ensuring exactly 4-day range
  const onDateChange = (field: "from" | "to", value: string) => {
    let newFrom = field === "from" ? value : dateRange.from;
    let newTo = field === "to" ? value : dateRange.to;
    const dateF = new Date(newFrom);
    if (field === "from") {
      newTo = format(subDays(new Date(newFrom), -3), "yyyy-MM-dd");
    } else {
      newFrom = format(subDays(new Date(newTo), 3), "yyyy-MM-dd");
    }
    setDateRange({ from: newFrom, to: newTo });
  };

  return (
    <Layout>
      <div className="py-4 md:py-8 pb-20 md:pb-10 min-h-screen">
        <div className="mx-auto space-y-7">
          {/* Search + Date */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-5 mb-3">
            {/* Search Bar (full width, no absolute date range inside) */}
            <div className="w-full md:flex-1">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search by Customer Name or Delivery Order Code."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-base bg-white rounded-lg border border-gray-200 w-full"
                />
              </div>
            </div>
            {/* Date Range Picker group - on the right */}
            <div className="flex items-center gap-2 mt-3 md:mt-0">
              <input
                type="date"
                value={dateRange.from}
                max={format(subDays(new Date(dateRange.to), -4), "yyyy-MM-dd")}
                min={format(subDays(today, 365), "yyyy-MM-dd")} // limit back 1 year, adjust as needed
                onChange={(e) => {
                  let newFrom = e.target.value;
                  let newTo = dateRange.to;
                  // If newTo is out of the 4-day window, force it within range
                  if (newTo < newFrom || newTo > format(subDays(new Date(newFrom), -4), "yyyy-MM-dd")) {
                    newTo = format(subDays(new Date(newFrom), -4), "yyyy-MM-dd");
                  }
                  setDateRange({ from: newFrom, to: newTo });
                }}
                className="h-12 rounded-lg border-gray-200 px-2 py-1 text-sm text-gray-700 outline-orange-400 border"
                style={{ width: 150 }}
              />
              <span className="text-gray-600 text-base">to</span>
              <input
                type="date"
                value={dateRange.to}
                min={dateRange.from}
                max={format(subDays(new Date(dateRange.from), -4), "yyyy-MM-dd") < format(today, "yyyy-MM-dd")
                  ? format(subDays(new Date(dateRange.from), -4), "yyyy-MM-dd")
                  : format(today, "yyyy-MM-dd")}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                className="h-12 rounded-lg border-gray-200 px-2 py-1 text-sm text-gray-700 outline-orange-400 border"
                style={{ width: 150 }}
              />
            </div>
          </div>

          {/* CONTENT GRID */}
          <div className="grid md:grid-cols-2 gap-7 pt-1 items-stretch">
            {isLoading ? (
              <div className="text-center py-16 text-muted-foreground col-span-2">Loading orders...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground col-span-2">No delivery orders found</div>
            ) : (
              filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col shadow-sm min-h-[240px]"
                >
                  {/* Top Row: Order Info + Customer Info */}
                  <div className="flex items-start justify-between pb-3 mb-1 w-full gap-y-2 border-b border-gray-200">
                    {/* Order Info (left) */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="text-sm lg:text-base text-[#A1A1A1] font-semibold tracking-wide">
                        DO{String(order.id).padStart(6, '0')}
                      </span>
                      {order.status === 'FINAL' ? (
                        <span className="bg-green-500/90 text-[0.6rem] text-white px-2 py-1 rounded font-regular">
                          Delivered
                        </span>
                      ) : (
                        <span className="bg-[#EAA6A6] text-[0.6rem] text-[#A74A4A] px-2 py-1 rounded font-regular">
                          Pending
                        </span>
                      )}
                      <span className="text-sm md:text-base lg:text-lg text-gray-800 font-medium ml-auto text-right">
                        {format(new Date(order.createdAt), 'dd-MM-yyyy')}
                      </span>
                    </div>
                    {/* Customer Info (right) */}
                    <div className="pl-3 md:pl-7 flex flex-col items-end text-right ml-2 md:ml-3 min-w-[125px] md:min-w-[180px]">
                      <span className="font-medium text-gray-800 text-sm md:text-lg">
                        {"order.customerName"}
                      </span>
                      <span className="text-xs md:text-sm text-gray-400 font-medium">
                        {"order.customerPhone"}
                      </span>
                    </div>
                  </div>


                  {/* Row: Delivery Items + Total QTY + Total ITEMS */}
                  <div className="grid grid-cols-[2fr_1fr_1fr] items-center mt-2 mb-4 px-2 mr-2">
                    <div className="flex items-center gap-2 font-regular text-black text-[15px] w-54">
                      <ShoppingCart className="h-4 w-4" />
                      Delivery Items
                    </div>
                    <div className="text-start items-baseline">
                      <span className="font-thin text-gray-400 text-sm mr-2">Qty:</span>
                      <span className="font-semibold text-gray-900 text-lg">{totalQuantity(order)}</span>
                    </div>
                    <div className="text-right items-baseline">
                      <span className="font-thin text-gray-400 text-sm mr-2">Items:</span>
                      <span className="font-semibold text-gray-900 text-lg">{order.deliveryItems.length}</span>
                    </div>
                  </div>

                  {/* Delivery Items Table */}
                  <div className="px-4">
                    {/* Table Rows */}
                    {order.deliveryItems.map((item, idx) => (
                      <div key={item.id || idx} className="flex items-center mb-2 gap-16">
                        <div className="flex items-center w-56">
                          <div className="font-medium text-[15px]">{item.item.itemCode}</div>
                          <div className="text-gray-400 text-sm ml-4">{item.item.itemName}</div>
                        </div>
                        <div className="font-medium text-gray-800 text-[15px] w-16 text-center">{item.quantity}</div>
                        <div className="text-gray-400 text-sm flex-1 text-right">
                          {item.item.godown} - {item.item.rack || 'B2'}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-auto mt-7">
                    {order.status !== 'FINAL' && (
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => navigate(`/edit-order/${order.id}`)}
                        className="border-orange-500 text-orange-600 px-8 py-3 font-medium rounded-lg bg-white hover:bg-orange-50 shadow-sm flex-1 flex justify-center"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    )}
                    {order.status !== 'FINAL' && (
                      <Button
                        size="lg"
                        onClick={() => handleMarkAsDelivered(order.id)}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 font-semibold rounded-lg shadow-sm flex-1 flex justify-center"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Mark Delivered
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
