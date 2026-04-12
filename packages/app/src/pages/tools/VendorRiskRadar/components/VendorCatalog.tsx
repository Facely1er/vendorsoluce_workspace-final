import React, { useState, useMemo } from 'react';
import { X, Search, Plus } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Card, CardContent } from '../../../../components/ui/Card';
import { ENTERPRISE_VENDOR_CATALOG, searchVendors, getVendorsByCategory } from '../../../../utils/vendorCatalog';
import type { VendorBase } from '../../../../types/vendorRadar';

interface VendorCatalogProps {
  onClose: () => void;
  onAddVendor: (vendor: Partial<VendorBase>) => void;
}

const VendorCatalog: React.FC<VendorCatalogProps> = ({ onClose, onAddVendor }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredVendors = useMemo(() => {
    let vendors = selectedCategory === 'all' 
      ? ENTERPRISE_VENDOR_CATALOG 
      : getVendorsByCategory(selectedCategory);
    
    if (searchTerm) {
      vendors = searchVendors(searchTerm);
    }
    
    return vendors;
  }, [searchTerm, selectedCategory]);

  const handleAddVendor = (vendor: VendorBase) => {
    onAddVendor(vendor);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Vendor Catalog</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Browse {ENTERPRISE_VENDOR_CATALOG.length} pre-populated enterprise vendors
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-vendorsoluce-green"
              aria-label="Search vendors"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-vendorsoluce-green"
            aria-label="Filter by category"
          >
            <option value="all">All Categories</option>
            <option value="critical">Critical</option>
            <option value="strategic">Strategic</option>
            <option value="tactical">Tactical</option>
            <option value="commodity">Commodity</option>
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {filteredVendors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">No vendors found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredVendors.map((vendor, index) => (
                <Card
                  key={index}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {vendor.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            vendor.category === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                            vendor.category === 'strategic' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                            vendor.category === 'tactical' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            {vendor.category}
                          </span>
                          <span>{vendor.sector}</span>
                        </div>
                        {vendor.location && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                            📍 {vendor.location}
                          </p>
                        )}
                        {vendor.notes && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                            {vendor.notes}
                          </p>
                        )}
                        {vendor.dataTypes && vendor.dataTypes.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {vendor.dataTypes.map((dt, i) => (
                              <span
                                key={i}
                                className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                              >
                                {dt}
                              </span>
                            ))}
                          </div>
                        )}
                        {vendor.sbomProfile?.providesSoftware && (
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {vendor.sbomProfile.sbomAvailable ? (
                              <span className="text-green-600 dark:text-green-400">✓ SBOM Available</span>
                            ) : (
                              <span className="text-yellow-600 dark:text-yellow-400">⚠ SBOM Gap</span>
                            )}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAddVendor(vendor)}
                        className="ml-2 flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorCatalog;
