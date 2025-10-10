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
import { SearchInput } from './ui/search-input';
import { QuantityModal } from '@/components/modals/QuantityModal';
import { CustomerSearchModal } from '@/components/modals/CustomerSearchModal';



export interface DeliveryOrderFormProps {
    /** If given, form is in edit mode, otherwise create mode */
    orderId?: number;
    /** Optional: Supply initial display title from parent */
    title?: string;
}

interface CartItem {
    item: Item;
    quantity: number;
}

export function DeliveryOrderForm({ orderId, title }: DeliveryOrderFormProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [items, setItems] = useState<Item[]>([]);
    const [filteredItems, setFilteredItems] = useState<Item[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState(Number);
    const navigate = useNavigate();
    const [modalItem, setModalItem] = useState<Item | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentQuantity, setCurrentQuantity] = useState(Number);
    const [customerModalOpen, setCustomerModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<{ id: string; name: string; phone: string } | null>(null);


    useEffect(() => {
        loadItems();
        if (orderId != null) loadOrder();
        // eslint-disable-next-line
    }, [orderId]);

    useEffect(() => {
        if (searchTerm) {
            const filtered = items
                .filter(
                    (item) =>
                        (item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.itemName.toLowerCase().includes(searchTerm.toLowerCase())) &&
                        !cart.some((cartItem) => cartItem.item.itemCode === item.itemCode) // exclude items already in cart
                )
                .slice(0, 5);

            setFilteredItems(filtered);
        } else {
            setFilteredItems([]);
        }
    }, [searchTerm, items, cart]);


    const loadItems = async () => {
        try {
            const data = await ItemsService.getAllItems();
            setItems(data);
        } catch (error) {
            toast.error('Failed to load items');
        }
    };

    const loadOrder = async () => {
        try {
            const order = await DeliveryOrdersService.getOrderById(orderId!);
            const cartItems = order.deliveryItems.map(di => ({
                item: di.item,
                quantity: di.quantity,
            }));
            setCart(cartItems);
            // Optionally update customerName and phoneNumber when API supports it
            setCustomerName('order.customerName');
            setPhoneNumber(8971150222);
        } catch (error) {
            toast.error('Failed to load order');
        }
    };

    const handleSelectItem = (item: Item) => {
        setModalItem(item);
        setModalOpen(true);
    };

    const updateQuantity = (itemCode: string, quantity: number) => {
        if (quantity <= 0) return;
        setCart(
            cart.map(cartItem =>
                cartItem.item.itemCode === itemCode ? { ...cartItem, quantity } : cartItem
            )
        );
    };

    const removeFromCart = (itemCode: string) => {
        setCart(cart.filter(cartItem => cartItem.item.itemCode !== itemCode));
    };

    // Save handler, conditionally calls create or update
    const handleSave = async (status: "DRAFT" | "FINAL" = "DRAFT") => {
        if (cart.length === 0) {
            toast.error('Please add items to the order');
            return;
        }
        setIsLoading(true);
        try {
            if (orderId) {
                await DeliveryOrdersService.updateOrder(orderId, {
                    status,
                    items: cart.map(cartItem => ({
                        itemCode: cartItem.item.itemCode,
                        quantity: cartItem.quantity,
                    })),
                    customerid: "customerName",
                    customerphone: phoneNumber
                });
                toast.success('Order updated successfully');
            } else {
                await DeliveryOrdersService.createOrder({
                    status,
                    items: cart.map(cartItem => ({
                        itemCode: cartItem.item.itemCode,
                        quantity: cartItem.quantity,
                    })),
                    customerid: "customerName",
                    customerphone: phoneNumber
                });
                toast.success(
                    status === "DRAFT"
                        ? 'Order saved as pending'
                        : 'Order created and marked as delivered'
                );
            }
            navigate('/delivery-orders');
        } catch (error) {
            toast.error('Failed to save order');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Layout>
            <div className="min-h-dvh flex flex-col items-center">
                {/* Title */}
                <div className="fixed bottom-[85%] left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-4 md:px-6 py-4">
                    {title && <h1 className="text-xl font-semibold">{title}</h1>}
                </div>

                {/* Fixed Search */}
                <div className="fixed bottom-[78%] left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 md:px-6 z-40">
                    <div className="relative w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <SearchInput
                            placeholder="Search by item name or item code..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className={["pl-12 h-14 text-base bg-white border border-gray-200 focus:shadow-2xl focus:z-20", searchTerm ? "rounded-2xl rounded-b-none" : "rounded-2xl"].join(" ")}
                            autoFocus
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        )}


                        {/* Dropdown results */}
                        {searchTerm && (
                            <div className="absolute left-0 z-20 top-full w-full bg-white rounded-b-2xl shadow-2xl border border-t-0 border-gray-200 px-0 py-4 max-h-80 overflow-y-auto">
                                {filteredItems.length === 0 ? (
                                    <div className="px-6 py-5 text-gray-400 text-base font-medium text-center">
                                        No matching items
                                    </div>
                                ) : (
                                    filteredItems.map(item => (
                                        <div
                                            key={item.itemCode}
                                            onClick={() => handleSelectItem(item)}
                                            className="grid grid-cols-[1.15fr_1fr_1.25fr] gap-8 items-start px-5 py-3 hover:bg-blue-50 rounded-2xl cursor-pointer transition-colors"
                                        >
                                            {/* Column 1: Item code and name */}
                                            <div className="flex flex-col ml-4">
                                                <span className="text-base font-semibold text-gray-900">{item.itemCode}</span>
                                                <span className="text-sm text-gray-400">{item.itemName}</span>
                                            </div>

                                            {/* Column 2: Quantity remaining */}
                                            <div className="flex items-center justify-start">
                                                <span className="text-xs text-gray-400 mr-2">Qty:</span>
                                                <span className="text-lg font-semibold text-gray-900">{item.qtyRemaining}</span>
                                            </div>

                                            {/* Column 3: Location/Godown, right-aligned */}
                                            <div className="flex items-baseline justify-start">
                                                <span className="text-xs text-gray-400 mr-2">Location:</span>
                                                <span className="font-semibold text-gray-500">{item.godown + ' - ' + item.rack}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Fixed Cart (below search) */}
                <div className="fixed bottom-[27%] left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 md:px-6 z-30">
                    <div className="bg-card rounded-2xl border border-border p-4 h-[48vh] overflow-y-auto">

                        {/* Header row */}
                        <div className="grid grid-cols-[2fr_1fr_1fr] items-center mb-3 px-2">
                            <h2 className="font-semibold flex items-center gap-2 col-span-1">
                                <ShoppingCart className="h-5 w-5" />
                                Items in cart
                            </h2>
                            <div className="text-right items-baseline">
                                <span className="font-thin text-gray-500 text-sm mr-2">Total Qty:</span>
                                <span className="font-semibold text-gray-900 text-lg">
                                    {cart.reduce((sum, c) => sum + c.quantity, 0)}
                                </span>
                            </div>
                            <div className="text-right items-baseline">
                                <span className="font-thin text-gray-500 text-sm mr-2">Total Items:</span>
                                <span className="font-semibold text-gray-900 text-lg">{cart.length}</span>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-border mb-3"></div>

                        {/* Empty state */}
                        {cart.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground">
                                <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                <p className="font-medium">Your cart is empty</p>
                                <p className="text-sm">Search and select items above to add them</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {cart.map(cartItem => (
                                    <div
                                        key={cartItem.item.itemCode}
                                        className="grid grid-cols-[1.75fr_0.5fr_1.25fr_0.75fr] items-center gap-1 px-3 py-1 bg-muted rounded-lg"
                                    >
                                        {/* Item code and name */}
                                        <div className="flex items-baseline gap-1 justify-start">
                                            <p className="font-semibold text-lg text-gray-900 mr-4">{cartItem.item.itemCode}</p>
                                            <p className="text-sm text-gray-400">{cartItem.item.itemName}</p>
                                        </div>

                                        {/* Quantity added (label + value inline) */}
                                        <div className="flex items-baseline gap-1 justify-center">
                                            <span className="text-lg font-semibold text-gray-900">{cartItem.quantity}</span>
                                        </div>

                                        {/* Godown & Rack (label + value inline) */}
                                        <div className="flex items-baseline gap-1 justify-end">
                                            <span className="text-sm font-medium text-gray-500">
                                                {cartItem.item.godown} - {cartItem.item.rack || "B2"}
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center justify-end gap-3">
                                            <Button
                                                size="lg"
                                                variant="ghost"
                                                className="h-10 w-10 p-0"
                                                onClick={() => {
                                                    setModalItem(cartItem.item);
                                                    setModalOpen(true);
                                                    setCurrentQuantity(cartItem.quantity);
                                                }}
                                            >
                                                <Edit className="h-5 w-5" />
                                            </Button>
                                            <Button
                                                size="lg"
                                                variant="ghost"
                                                className="h-10 w-10 p-0 text-destructive hover:text-destructive"
                                                onClick={() => removeFromCart(cartItem.item.itemCode)}
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>
                </div>


                {/* Customer Info (above footer) */}
                <div className="fixed bottom-[12%] left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-4 md:px-6 z-20">
                    <div className="bg-card rounded-2xl max-w-4xl mx-auto w-full border border-border overflow-hidden h-28 flex items-center">
                        {selectedCustomer ? (
                            <div className="w-full flex items-center justify-between gap-4 px-4">
                                {/* Customer Name and Phone */}
                                <div className="flex-1 flex items-center gap-4">
                                    {/* Name */}
                                    <div className="flex flex-col w-3/5">
                                        <Label className="text-xs text-gray-500">Customer Name</Label>
                                        <p className="text-lg font-semibold text-gray-900 mt-1">{selectedCustomer.name}</p>
                                    </div>

                                    {/* Phone */}
                                    <div className="flex flex-col w-2/5">
                                        <Label className="text-xs text-gray-500">Phone Number</Label>
                                        {selectedCustomer.name.toLowerCase() === 'cash' ? (
                                            <Input
                                                value={selectedCustomer.phone}
                                                onChange={(e) =>
                                                    setSelectedCustomer({
                                                        ...selectedCustomer,
                                                        phone: e.target.value,
                                                    })
                                                }
                                                className="mt-1 font-semibold"
                                            />
                                        ) : (
                                            <p className="mt-1 text-gray-900 text-base font-semibold">{selectedCustomer.phone}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Change Customer Button */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9"
                                    onClick={() => setCustomerModalOpen(true)}
                                >
                                    Change
                                </Button>
                            </div>
                        ) : (
                            <div
                                onClick={() => setCustomerModalOpen(true)}
                                className="w-full h-full flex items-center justify-center bg-blue-100/60 hover:bg-blue-200/70 hover:text-lg text-blue-700 text-base font-semibold cursor-pointer transition-all"
                            >
                                Search & Select Customer
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-4 md:px-6 z-10">
                    <div className="max-w-4xl mx-auto w-full py-4 md:py-6 px-1 md:px-2 flex gap-3">
                        <Button
                            variant="destructive"
                            onClick={() => navigate('/delivery-orders')}
                            className="flex-1 h-12"
                        >
                            <X className="h-4 w-4 mr-1" /> Cancel
                        </Button>
                        <Button
                            onClick={() => handleSave("DRAFT")}
                            disabled={isLoading}
                            className="flex-1 bg-accent hover:bg-accent/80 text-accent-foreground h-12"
                        >
                            {orderId ? "Save" : "Save as Pending"}
                        </Button>
                        {!orderId && (
                            <Button
                                onClick={() => handleSave("FINAL")}
                                disabled={isLoading}
                                className="flex-1 h-12 bg-success text-success-foreground hover:bg-success/80"
                            >
                                Mark as Delivered
                            </Button>
                        )}
                    </div>
                </div>
            </div>
            <QuantityModal
                open={modalOpen}
                item={modalItem}
                currentQuantity={currentQuantity}
                onConfirm={(quantity) => {
                    if (!modalItem) return;

                    const existing = cart.find(ci => ci.item.itemCode === modalItem.itemCode);
                    if (existing) {
                        updateQuantity(modalItem.itemCode, quantity);
                    } else {
                        setCart([...cart, { item: modalItem, quantity }]);
                    }

                    // Close modal and reset
                    setModalOpen(false);
                    setModalItem(null);
                    setCurrentQuantity(null);
                    setSearchTerm('');
                    setFilteredItems([]);
                }}
                onClose={() => {
                    setModalOpen(false);
                    setModalItem(null);
                    setCurrentQuantity(null);
                }}
            />
            <CustomerSearchModal
                open={customerModalOpen}
                onClose={() => setCustomerModalOpen(false)}
                onSelect={(cust) => {
                    setSelectedCustomer(cust);
                    setCustomerName(cust.name);
                    setPhoneNumber(Number(cust.phone));
                }}
            />
        </Layout>

    );

}