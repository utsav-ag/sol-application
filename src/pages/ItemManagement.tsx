import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ItemsService } from '@/services/items.service';
import { Item } from '@/types/api';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import React from 'react';

type PanelMode = 'view' | 'edit' | 'create' | null;

export default function ItemManagement() {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [panelMode, setPanelMode] = useState<PanelMode>(null);
  const [tempItem, setTempItem] = useState<Partial<Item> | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [formData, setFormData] = useState<Partial<Item>>({});
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();


  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = items.filter(
        (item) =>
          item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.thickness?.toLowerCase().includes(searchTerm.toLowerCase())
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
    setFormData(item);
    setPanelMode('view');
    setTempItem(null);
  };

  const handleAddNewItem = () => {
    const newTempItem: Partial<Item> = {
      itemCode: '',
      itemName: '',
      type: 'Sunmica',
      qtyRemaining: 0,
      godown: 'Shop',
      rack: '',
      thickness: '0.7mm',
      basePrice: 0,
      gst: 0,
    };
    setTempItem(newTempItem);
    setFormData(newTempItem);
    setSelectedItem(null);
    setPanelMode('create');
  };

  const handleEdit = () => {
    if (selectedItem) {
      setFormData(selectedItem);
      setPanelMode('edit');
      setTempItem(null);
    }
  };

  const handleSave = async () => {
    if (!formData.itemCode || !formData.type) {
      toast.error('Please fill all mandatory fields');
      return;
    }

    try {
      if (panelMode === 'create') {
        await ItemsService.createItem(formData as any);
        toast.success('Item created successfully');
      } else if (panelMode === 'edit' && selectedItem) {
        await ItemsService.updateItem(selectedItem.itemCode, formData as any);
        toast.success('Item updated successfully');
      }
      setPanelMode('view');
      setTempItem(null);
      loadItems();
    } catch (error) {
      toast.error('Failed to save item');
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;

    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await ItemsService.deleteItem(selectedItem.itemCode);
      toast.success('Item deleted successfully');
      setPanelMode(null);
      setSelectedItem(null);
      setFormData({});
      loadItems();
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const handleCancel = () => {
    if (panelMode === 'create') {
      setPanelMode(null);
      setTempItem(null);
      setSelectedItem(null);
      setFormData({});
    } else if (panelMode === 'edit') {
      setPanelMode('view');
      setFormData(selectedItem || {});
    }
  };

  const handleUpdateField = (field: keyof Item, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (tempItem) {
      setTempItem({ ...tempItem, [field]: value });
    }
  };

  // Group items by type
  const groupedItems = filteredItems.reduce((groups, item) => {
    if (!groups[item.type]) groups[item.type] = [];
    groups[item.type].push(item);
    return groups;
  }, {} as Record<string, Item[]>);

  const typeKeys = Object.keys(groupedItems);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (type: string) => {
    setOpenGroups(prev => ({ ...prev, [type]: !prev[type] }));
  };

  useEffect(() => {
    if (typeKeys.length > 0 && Object.keys(openGroups).length === 0) {
      const allOpen = typeKeys.reduce((acc, type) => {
        acc[type] = true;
        return acc;
      }, {} as Record<string, boolean>);
      setOpenGroups(allOpen);
    }
  }, [typeKeys, openGroups]);

  // Render form fields (used in both edit and create modes)
  const renderForm = (isEditable: boolean) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-gray-700 font-medium">
            Item Code <span className="text-red-500">*</span>
          </Label>
          <Input
            value={formData.itemCode || ''}
            onChange={(e) => handleUpdateField('itemCode', e.target.value)}
            className="mt-1.5 h-11"
            disabled={!isEditable || panelMode === 'edit'}
          />
        </div>
        <div>
          <Label className="text-gray-700 font-medium">Item Name</Label>
          <Input
            value={formData.itemName || ''}
            onChange={(e) => handleUpdateField('itemName', e.target.value)}
            className="mt-1.5 h-11"
            disabled={!isEditable}
          />
        </div>
      </div>

      <div>
        <Label className="text-gray-700 font-medium">Upload Image</Label>
        <Input type="file" className="mt-1.5 h-11" disabled={!isEditable} />
      </div>

      <div>
        <Label className="text-gray-700 font-medium">Storage Location</Label>
        <Select
          value={formData.godown || ''}
          onValueChange={(value) => handleUpdateField('godown', value)}
          disabled={!isEditable}
        >
          <SelectTrigger className="mt-1.5 h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Shop">Shop</SelectItem>
            <SelectItem value="Godown 1">Godown 1</SelectItem>
            <SelectItem value="Godown 2">Godown 2</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-gray-700 font-medium">Quantity Available</Label>
          <Input
            type="number"
            value={formData.qtyRemaining || 0}
            onChange={(e) =>
              handleUpdateField('qtyRemaining', parseInt(e.target.value) || 0)
            }
            className="mt-1.5 h-11"
            disabled={!isEditable}
          />
        </div>
        <div>
          <Label className="text-gray-700 font-medium">Rack Number</Label>
          <Input
            value={formData.rack || ''}
            onChange={(e) => handleUpdateField('rack', e.target.value)}
            className="mt-1.5 h-11"
            disabled={!isEditable}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-gray-700 font-medium">
            Item Type <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.type || ''}
            onValueChange={(value) => handleUpdateField('type', value)}
            disabled={!isEditable}
          >
            <SelectTrigger className="mt-1.5 h-11">
              <SelectValue placeholder="Sunmica" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Sunmica">Sunmica</SelectItem>
              <SelectItem value="Acrylic">Acrylic</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-gray-700 font-medium">
            Thickness <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.thickness || ''}
            onValueChange={(value) => handleUpdateField('thickness', value)}
            disabled={!isEditable}
          >
            <SelectTrigger className="mt-1.5 h-11">
              <SelectValue placeholder="0.7mm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0.7mm">0.7mm</SelectItem>
              <SelectItem value="1mm">1mm</SelectItem>
              <SelectItem value="2mm">2mm</SelectItem>
              <SelectItem value="3mm">3mm</SelectItem>
              <SelectItem value="6mm">6mm</SelectItem>
              <SelectItem value="8mm">8mm</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-gray-700 font-medium">
            Base Price <span className="text-red-500">*</span>
          </Label>
          <Input
            type="number"
            value={formData.basePrice || 0}
            onChange={(e) =>
              handleUpdateField('basePrice', parseFloat(e.target.value) || 0)
            }
            className="mt-1.5 h-11"
            disabled={!isEditable}
            placeholder="138"
          />
        </div>
        <div>
          <Label className="text-gray-700 font-medium">
            GST Rate <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.gst?.toString() || ''}
            onValueChange={(value) => handleUpdateField('gst', parseInt(value))}
            disabled={!isEditable}
          >
            <SelectTrigger className="mt-1.5 h-11">
              <SelectValue placeholder="0%" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">0%</SelectItem>
              <SelectItem value="5">5%</SelectItem>
              <SelectItem value="12">12%</SelectItem>
              <SelectItem value="18">18%</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderPanelContent = () => {
    if (panelMode === 'view' && selectedItem) {
      const qtyReserved = selectedItem.qtyReserved ?? 0;
      const qtyAvailable = (selectedItem.qtyRemaining ?? 0) - qtyReserved;
      const priceAfterGst =
        (selectedItem.basePrice ?? 0) * (1 + (selectedItem.gst ?? 0) / 100);

      // Multiple godown/rack for modern API (else fallback)
      const inventoryList = (
        selectedItem.godown
          ? [{ godown: selectedItem.godown, rack: selectedItem.rack ?? 'N/A' }]
          : []
      );

      return (
        <>
          <h2 className="text-xl font-semibold mb-6 text-gray-900">
            Item Details
          </h2>
          <div className="space-y-4 flex flex-col gap-3">
            {/* Top Section */}
            <div className="flex flex-col md:flex-row gap-1 items-start">
              {/* Image */}
              <div className="flex-1 flex justify-left">
                {selectedItem.itemImage ? (
                  <img
                    src={selectedItem.itemImage}
                    alt={selectedItem.itemName || selectedItem.itemCode}
                    className="rounded-md object-cover h-72 w-60 border border-gray-200 bg-gray-50"
                  />
                ) : (
                  <div className="flex items-center justify-center rounded-lg bg-gray-50 h-72 w-60 text-gray-400">
                    No Image
                  </div>
                )}
              </div>
              {/* Details + badges */}
              <div className="flex-1 flex flex-col gap-7">
                {/* Basic Details */}
                <div className="grid gap-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 min-w-[70px] text-sm">Item Code</span>
                    <span className="text-gray-500 min-w-[20px] text-sm">:</span>
                    <span className="font-medium text-gray-900 text-base">{selectedItem.itemCode}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 min-w-[70px] text-sm">Item Name</span>
                    <span className="text-gray-500 min-w-[20px] text-sm">:</span>
                    <span className="font-medium text-gray-900 text-base">{selectedItem.itemName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 min-w-[70px] text-sm">Item Type</span>
                    <span className="text-gray-500 min-w-[20px] text-sm">:</span>
                    <span className="font-medium text-gray-900 text-base">{selectedItem.type}</span>
                  </div>
                  {selectedItem.type && (
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 min-w-[70px] text-sm">Item Tag</span>
                      <span className="text-gray-500 min-w-[20px] text-sm">:</span>
                      <span className="font-medium text-gray-900 text-base">{selectedItem.type}</span>
                    </div>
                  )}
                  {selectedItem.thickness && (
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 min-w-[70px] text-sm">Thickness</span>
                      <span className="text-gray-500 min-w-[20px] text-sm">:</span>
                      <span className="font-medium text-gray-900 text-base">{selectedItem.thickness}</span>
                    </div>
                  )}
                </div>

                {/* Inventory (Godown + Rack) */}
                <div>
                  <div className="font-semibold text-[15px] text-gray-700 mb-4">Warehouse Information</div>
                  <div className="grid grid-cols-2 md:grid-cols-2 gap-y-2 gap-x-6">
                    {inventoryList.length === 0
                      ? <span className="text-gray-400 col-span-2">N/A</span>
                      : inventoryList.map((inv, idx) => (
                        <React.Fragment key={idx}>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500 text-sm">Godown:</span>
                            <span className="text-gray-800 text-base">{inv.godown}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500 text-sm">Rack:</span>
                            <span className="text-gray-800 text-base">{inv.rack}</span>
                          </div>
                        </React.Fragment>
                      ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Stock Info */}
            <div>
              <div className="font-semibold text-[15px] text-gray-700 mb-4">Stock Information</div>
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg bg-blue-50 text-blue-600 flex flex-col items-center justify-center py-2">
                  <span className="text-xs font-regular">Stock Present</span>
                  <span className="text-lg font-semibold">{selectedItem.qtyRemaining ?? 0}</span>
                </div>
                <div className="rounded-lg bg-orange-50 text-orange-600 flex flex-col items-center justify-center py-2">
                  <span className="text-xs font-regular">Reserved Quantity</span>
                  <span className="text-lg font-semibold">{qtyReserved}</span>
                </div>
                <div className="rounded-lg bg-green-50 text-green-700 flex flex-col items-center justify-center py-2">
                  <span className="text-xs font-regular">Available to Sell</span>
                  <span className="text-lg font-semibold">{qtyAvailable < 0 ? 0 : qtyAvailable}</span>
                </div>
              </div>
            </div>
            {/* Price Info */}
            <div>
              <div className="font-semibold text-[15px] text-gray-700 mb-4">Price Information</div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-gray-500 text-xs mb-1">Base Price</div>
                  <div className="text-gray-800 font-semibold text-lg">₹{selectedItem.basePrice?.toFixed(2) ?? '0'}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs mb-1">GST Percentage</div>
                  <div className="text-gray-800 font-semibold text-lg">{selectedItem.gst ?? "0"}%</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs mb-1">Net Price (After GST)</div>
                  <div className="text-green-600 font-semibold text-lg">₹{Number(priceAfterGst).toFixed(2)}</div>
                </div>
              </div>
            </div>
            {/* Actions */}
            <div className="flex gap-4 pt-1">
              <Button
                onClick={handleDelete}
                className="flex-1 border border-orange-200 text-gray-700 h-12 font-medium flex items-center justify-center gap-2 bg-white hover:bg-orange-100 hover:border-transparent"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
              <Button
                onClick={handleEdit}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white h-12 font-medium flex items-center justify-center gap-2"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
          </div>
        </>
      );
    }



    if (panelMode === 'edit' || panelMode === 'create') {
      return (
        <>
          <h2 className="text-xl font-semibold mb-6 text-gray-900">
            {panelMode === 'create' ? 'Add New Item' : 'Edit Item'}
          </h2>

          {renderForm(true)}

          <div className="flex gap-4 pt-6">
            <Button
              onClick={handleCancel}
              className="flex-1 border border-orange-200 text-gray-700 h-12 font-medium flex items-center justify-center gap-2 bg-white hover:bg-orange-100 hover:border-transparent"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white h-12 font-medium"
            >
              {panelMode === 'create' ? 'Save Item' : 'Update Item'}
            </Button>
          </div>
        </>
      );
    }

    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Select an item to view details or create a new item
      </div>
    );
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row h-[calc(100vh-3.5rem)] gap-6 py-8">
        {/* LEFT PANEL - Item List */}
        <div className="w-full md:w-1/2 bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by Item Code, Type, Thickness"
                className="pl-10 bg-gray-50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              onClick={handleAddNewItem}
              className="bg-orange-500 hover:bg-orange-600 text-white whitespace-nowrap"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add New Item
            </Button>
          </div>

          <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Temp Item Indicator */}
            {tempItem && panelMode === 'create' && (
              <div className="p-3 bg-orange-50 border-2 border-orange-300 rounded-lg">
                <div className="text-sm font-medium text-orange-600">📝 New Item (Unsaved)</div>
                <div className="text-xs text-gray-500 mt-1">
                  Fill in the details and click Save Item
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-12 text-gray-500">Loading items...</div>
            ) : (
              <div className="mt-2 space-y-4 overflow-y-auto pr-[2px]">
                {typeKeys.map((type) => (
                  <div key={type}>
                    <div className="text-lg font-semibold text-orange-500 mb-2">
                      <span>{type}</span>
                      {/* <span className="ml-3 cursor-pointer" onClick={() => toggleGroup(type)}>{openGroups[type] ? '-' : '+'}</span> */}
                    </div>

                    {openGroups[type] && (
                      <div className="space-y-2 px-1 bg-white rounded-b-lg">
                        {groupedItems[type].map((item) => (
                          <div
                            key={item.itemCode}
                            className={`
                              grid grid-cols-[auto_auto_1fr] items-center rounded-2xl px-6 py-3 cursor-pointer transition gap-x-24
                              ${selectedItem?.itemCode === item.itemCode ? 'bg-orange-100 border-orange-200 border-2 shadow-sm' : 'bg-white border border-[#f3f3f3]'}
                              `}
                            onClick={() => handleItemClick(item)}
                          >
                            {/* Code column */}
                            <div className="flex items-center justify-start min-w-0 whitespace-nowrap">
                              <span className="text-gray-400 font-light text-xs">Code:</span>
                              <span className="ml-1 text-gray-800 font-medium text-base">{item.itemCode}</span>
                            </div>
                            {/* Qty column */}
                            <div className="flex items-center justify-center min-w-0 whitespace-nowrap">
                              <span className="text-gray-400 font-light text-xs">Qty:</span>
                              <span className="ml-1 text-gray-800 font-medium text-base">{item.qtyRemaining}</span>
                            </div>
                            {/* Location column */}
                            <div className="flex items-center justify-center min-w-0 gap-8 whitespace-nowrap justify-self-end">
                              <span>
                                <span className="text-gray-400 font-light text-xs">Location:</span>
                                <span className="ml-1 text-gray-500 font-medium text-sm">{item.godown}</span>
                              </span>
                              <span>
                                <span className="text-gray-400 font-light text-xs">Rack:</span>
                                <span className="ml-1 text-gray-500 font-medium text-sm">{item.rack || 'N/A'}</span>
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

            )}
          </div>
        </div>

        {/* RIGHT PANEL - Item Details (Desktop Only) */}
        {!isMobile && (
          <div className="w-full md:w-1/2 bg-white rounded-lg shadow p-6 overflow-y-auto">
            {renderPanelContent()}
          </div>
        )}

        {/* Mobile Modal */}
        {isMobile && (
          <Dialog
            open={panelMode !== null}
            onOpenChange={() => {
              if (panelMode === 'create') {
                handleCancel();
              } else {
                setPanelMode(null);
                setSelectedItem(null);
                setFormData({});
              }
            }}
          >
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="sr-only">
                  {panelMode === 'view'
                    ? 'Item Details'
                    : panelMode === 'edit'
                      ? 'Edit Item'
                      : 'Add New Item'}
                </DialogTitle>
              </DialogHeader>
              {renderPanelContent()}
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Layout>
  );
}
