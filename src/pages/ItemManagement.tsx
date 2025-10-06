import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ItemsService } from '@/services/items.service';
import { Item } from '@/types/api';
import { Search, Plus, Edit, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useMediaQuery } from '@/hooks/useMediaQuery';

type PanelMode = 'view' | 'edit' | 'create' | null;

export default function ItemManagement() {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [panelMode, setPanelMode] = useState<PanelMode>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [formData, setFormData] = useState<Partial<Item>>({});
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = items.filter(
        (item) =>
          item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(items);
    }
  }, [searchTerm, items]);

  const loadItems = async () => {
    try {
      const data = await ItemsService.getAllItems();
      setItems(data);
      setFilteredItems(data);
    } catch (error) {
      toast.error('Failed to load items');
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemClick = (item: Item) => {
    setSelectedItem(item);
    setPanelMode('view');
  };

  const handleCreate = () => {
    setFormData({});
    setPanelMode('create');
  };

  const handleEdit = (item: Item) => {
    setSelectedItem(item);
    setFormData(item);
    setPanelMode('edit');
  };

  const handleSave = async () => {
    try {
      if (panelMode === 'create') {
        await ItemsService.createItem(formData as any);
        toast.success('Item created successfully');
      } else if (panelMode === 'edit' && selectedItem) {
        await ItemsService.updateItem(selectedItem.itemCode, formData as any);
        toast.success('Item updated successfully');
      }
      setPanelMode(null);
      setFormData({});
      loadItems();
    } catch (error) {
      toast.error('Failed to save item');
    }
  };

  const handleDelete = async (itemCode: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await ItemsService.deleteItem(itemCode);
      toast.success('Item deleted successfully');
      setPanelMode(null);
      loadItems();
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const closePanel = () => {
    setPanelMode(null);
    setSelectedItem(null);
    setFormData({});
  };

  const PanelContent = () => {
    if (panelMode === 'view' && selectedItem) {
      return (
        <>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Item Details</h3>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => handleEdit(selectedItem)}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(selectedItem.itemCode)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground text-sm">Item Code</Label>
                <p className="font-medium">{selectedItem.itemCode}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-sm">Item Name</Label>
                <p className="font-medium">{selectedItem.itemName}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground text-sm">Type</Label>
                <p className="font-medium">{selectedItem.type}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-sm">Thickness</Label>
                <p className="font-medium">{selectedItem.thickness}mm</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground text-sm">Quantity</Label>
                <p className="font-medium">{selectedItem.qtyRemaining}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-sm">Storage Location</Label>
                <p className="font-medium">{selectedItem.godown}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground text-sm">Rack Number</Label>
                <p className="font-medium">{selectedItem.rack || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-sm">Base Price</Label>
                <p className="font-medium">₹{selectedItem.basePrice}</p>
              </div>
            </div>

            <div>
              <Label className="text-muted-foreground text-sm">GST Rate</Label>
              <p className="font-medium">{selectedItem.gst}%</p>
            </div>
          </div>
        </>
      );
    }

    if (panelMode === 'edit' || panelMode === 'create') {
      return (
        <>
          <h3 className="text-lg font-semibold mb-6">
            {panelMode === 'create' ? 'Add New Item' : `Edit ${selectedItem?.itemCode}`}
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Item Code (mandatory)</Label>
                <Input
                  value={formData.itemCode || ''}
                  onChange={(e) => setFormData({ ...formData, itemCode: e.target.value })}
                  disabled={panelMode === 'edit'}
                />
              </div>
              <div>
                <Label>Item Name</Label>
                <Input
                  value={formData.itemName || ''}
                  onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Upload Image</Label>
              <Input type="file" accept="image/*" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Storage Location</Label>
                <Select
                  value={formData.godown || ''}
                  onValueChange={(value) => setFormData({ ...formData, godown: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select godown" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Godown 1">Godown 1</SelectItem>
                    <SelectItem value="Godown 2">Godown 2</SelectItem>
                    <SelectItem value="Shop">Shop</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Rack Number</Label>
                <Input
                  value={formData.rack || ''}
                  onChange={(e) => setFormData({ ...formData, rack: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Quantity Available</Label>
                <Input
                  type="number"
                  value={formData.qtyRemaining || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, qtyRemaining: parseInt(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label>Item Type (mandatory)</Label>
                <Select
                  value={formData.type || ''}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Acrylic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Acrylic">Acrylic</SelectItem>
                    <SelectItem value="Sunmica">Sunmica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Thickness (mandatory for Sunmica/Acrylic)</Label>
                <Select
                  value={formData.thickness || ''}
                  onValueChange={(value) =>
                    setFormData({ ...formData, thickness: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="3mm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3mm">3mm</SelectItem>
                    <SelectItem value="6mm">6mm</SelectItem>
                    <SelectItem value="8mm">8mm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Base Price (mandatory)</Label>
                <Input
                  type="number"
                  value={formData.basePrice || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, basePrice: parseFloat(e.target.value) })
                  }
                />
              </div>
            </div>

            <div>
              <Label>GST Rate (mandatory)</Label>
              <Input
                type="number"
                value={formData.gst || ''}
                onChange={(e) =>
                  setFormData({ ...formData, gst: parseInt(e.target.value) })
                }
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={closePanel} className="flex-1">
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex-1 bg-accent text-accent-foreground">
                {panelMode === 'create' ? 'Save Item' : 'Update'}
              </Button>
            </div>
          </div>
        </>
      );
    }

    return null;
  };

  const PanelWrapper = isMobile ? Dialog : Sheet;
  const PanelContentWrapper = isMobile ? DialogContent : SheetContent;
  const PanelHeaderWrapper = isMobile ? DialogHeader : SheetHeader;
  const PanelTitleWrapper = isMobile ? DialogTitle : SheetTitle;

  return (
    <Layout>
      <div className="flex h-[calc(100vh-3.5rem)] pb-16 md:pb-0">
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-2xl space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Item Code, Type, Thickness..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button onClick={handleCreate} className="bg-accent text-accent-foreground">
                <Plus className="h-4 w-4 mr-1" />
                Add New Item
              </Button>
            </div>

            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading items...</div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No items found</div>
            ) : (
              <div className="space-y-2">
                {filteredItems.map((item) => (
                  <div
                    key={item.itemCode}
                    onClick={() => handleItemClick(item)}
                    className="p-4 bg-card border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{item.itemCode}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.itemName}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{item.godown}</span>
                          <span>-</span>
                          <span>{item.rack || 'C4'}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">In-Stock</p>
                        <p className="text-2xl font-bold">{item.qtyRemaining}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="hidden md:block w-[500px] border-l border-border bg-card p-6 overflow-y-auto">
          {panelMode ? (
            <PanelContent />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select an item to view details or create a new item
            </div>
          )}
        </div>
      </div>

      <PanelWrapper open={panelMode !== null && isMobile} onOpenChange={closePanel}>
        <PanelContentWrapper className="max-h-[90vh] overflow-y-auto">
          <PanelHeaderWrapper>
            <PanelTitleWrapper className="sr-only">
              {panelMode === 'view' ? 'Item Details' : panelMode === 'edit' ? 'Edit Item' : 'Add Item'}
            </PanelTitleWrapper>
          </PanelHeaderWrapper>
          <PanelContent />
        </PanelContentWrapper>
      </PanelWrapper>
    </Layout>
  );
}
