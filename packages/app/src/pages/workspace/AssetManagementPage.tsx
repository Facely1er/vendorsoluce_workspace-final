import React, { useState, useEffect } from 'react';
import { logger } from '../../utils/logger';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  Plus,
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import WorkspacePageShell from '../../components/vendorsoluce-intelligence/WorkspacePageShell';
import { Asset, AssetWithVendors } from '../types';
import { assetService } from '../../services/assetService';
import { useAuth } from '../../context/AuthContext';
import AssetVendorRelationshipManager from '../../components/asset/AssetVendorRelationshipManager';

const AssetManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [assets, setAssets] = useState<AssetWithVendors[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCriticality, setFilterCriticality] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedAsset, setSelectedAsset] = useState<AssetWithVendors | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    asset_type: Asset['asset_type'];
    category: string;
    criticality_level: Asset['criticality_level'];
    business_impact: Asset['business_impact'];
    data_classification: Asset['data_classification'];
    location: string;
    owner: string;
    custodian: string;
    status: Asset['status'];
    version: string;
    cost: string;
    acquisition_date: string;
    end_of_life_date: string;
    compliance_requirements: string[];
    security_controls: string[];
    tags: string[];
  }>({
    name: '',
    description: '',
    asset_type: 'software',
    category: '',
    criticality_level: 'medium',
    business_impact: 'medium',
    data_classification: 'internal',
    location: '',
    owner: '',
    custodian: '',
    status: 'active',
    version: '',
    cost: '',
    acquisition_date: '',
    end_of_life_date: '',
    compliance_requirements: [],
    security_controls: [],
    tags: []
  });

  useEffect(() => {
    if (user?.id) {
      loadAssets();
    }
  }, [user?.id]);

  const loadAssets = async () => {
    setLoading(true);
    try {
      const assetsData = await assetService.getAssets(user!.id);
      setAssets(assetsData);
    } catch (error) {
      logger.error('Error loading assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAsset = async () => {
    if (!user?.id) return;

    try {
      const assetData = {
        ...formData,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        acquisition_date: formData.acquisition_date || undefined,
        end_of_life_date: formData.end_of_life_date || undefined,
        compliance_requirements: formData.compliance_requirements,
        security_controls: formData.security_controls,
        tags: formData.tags
      };

      await assetService.createAsset(user.id, assetData);
      await loadAssets();
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      logger.error('Error adding asset:', error);
    }
  };

  const handleEditAsset = async () => {
    if (!editingAsset) return;

    try {
      await assetService.updateAsset(editingAsset.id, {
        ...formData,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        acquisition_date: formData.acquisition_date || undefined,
        end_of_life_date: formData.end_of_life_date || undefined,
        compliance_requirements: formData.compliance_requirements,
        security_controls: formData.security_controls,
        tags: formData.tags
      });
      await loadAssets();
      setEditingAsset(null);
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      logger.error('Error updating asset:', error);
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;

    try {
      await assetService.deleteAsset(assetId);
      await loadAssets();
    } catch (error) {
      logger.error('Error deleting asset:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      asset_type: 'software',
      category: '',
      criticality_level: 'medium',
      business_impact: 'medium',
      data_classification: 'internal',
      location: '',
      owner: '',
      custodian: '',
      status: 'active',
      version: '',
      cost: '',
      acquisition_date: '',
      end_of_life_date: '',
      compliance_requirements: [],
      security_controls: [],
      tags: []
    });
  };

  const openEditModal = (asset: Asset) => {
    setEditingAsset(asset);
    setFormData({
      name: asset.name,
      description: asset.description || '',
      asset_type: asset.asset_type,
      category: asset.category,
      criticality_level: asset.criticality_level,
      business_impact: asset.business_impact,
      data_classification: asset.data_classification,
      location: asset.location || '',
      owner: asset.owner,
      custodian: asset.custodian,
      status: asset.status,
      version: asset.version || '',
      cost: asset.cost?.toString() || '',
      acquisition_date: asset.acquisition_date || '',
      end_of_life_date: asset.end_of_life_date || '',
      compliance_requirements: asset.compliance_requirements || [],
      security_controls: asset.security_controls || [],
      tags: asset.tags || []
    });
    setShowAddModal(true);
  };

  const filteredAssets = assets.filter((asset: AssetWithVendors) => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || asset.asset_type === filterType;
    const matchesCriticality = filterCriticality === 'all' || asset.criticality_level === filterCriticality;
    const matchesStatus = filterStatus === 'all' || asset.status === filterStatus;
    return matchesSearch && matchesType && matchesCriticality && matchesStatus;
  });

  const paginatedAssets = filteredAssets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getCriticalityColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'inactive': return 'text-gray-600 bg-gray-100 dark:bg-gray-800';
      case 'deprecated': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'under_review': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800';
    }
  };

  const getRiskLevel = (score: number) => {
    if (score >= 80) return { level: 'Critical', color: 'text-red-600' };
    if (score >= 60) return { level: 'High', color: 'text-orange-600' };
    if (score >= 40) return { level: 'Medium', color: 'text-yellow-600' };
    return { level: 'Low', color: 'text-green-600' };
  };

  const criticalCount = assets.filter((a: AssetWithVendors) => a.criticality_level === 'critical').length;
  const withVendorsCount = assets.filter((a: AssetWithVendors) => (a.vendors?.length || 0) > 0).length;
  const highRiskCount = assets.filter((a: AssetWithVendors) => (a.risk_score || 0) >= 70).length;

  if (loading) {
    return (
      <WorkspacePageShell
        title="Asset management"
        description="Loading your asset inventory…"
      >
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-vendorsoluce-navy" />
            <p className="text-sm text-gray-600 dark:text-gray-300">Loading assets…</p>
          </div>
        </div>
      </WorkspacePageShell>
    );
  }

  if (selectedAsset) {
    return (
      <WorkspacePageShell
        title={selectedAsset.name}
        description={`${selectedAsset.asset_type} • ${selectedAsset.category}`}
        headerActionsSlot={
          <>
            <Button variant="outline" size="sm" onClick={() => setSelectedAsset(null)}>
              ← Back to list
            </Button>
            <Button variant="outline" size="sm" onClick={() => openEditModal(selectedAsset)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit asset
            </Button>
          </>
        }
      >
        <AssetVendorRelationshipManager assetId={selectedAsset.id} onRelationshipChange={loadAssets} />
      </WorkspacePageShell>
    );
  }

  return (
    <WorkspacePageShell
      title="Asset management"
      description="Manage the systems and data assets that define your vendor risk scope."
      headerActionsSlot={
        <>
          <Button variant="outline" size="sm" onClick={loadAssets}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add asset
          </Button>
        </>
      }
      stats={[
        { label: 'Total assets', value: assets.length, hint: 'In inventory' },
        { label: 'Critical', value: criticalCount, hint: 'Highest criticality' },
        { label: 'With vendors', value: withVendorsCount, hint: 'Linked relationships' },
        { label: 'High risk', value: highRiskCount, hint: 'Risk score ≥ 70' },
      ]}
    >
      <div className="space-y-6">
        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search assets..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    aria-label="Search assets"
                  />
                </div>
              </div>
              
              <select
                value={filterType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                aria-label="Filter by asset type"
              >
                <option value="all">All Types</option>
                <option value="software">Software</option>
                <option value="hardware">Hardware</option>
                <option value="service">Service</option>
                <option value="data">Data</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="third_party">Third Party</option>
              </select>
              
              <select
                value={filterCriticality}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterCriticality(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                aria-label="Filter by criticality level"
              >
                <option value="all">All Criticality</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                aria-label="Filter by status"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="deprecated">Deprecated</option>
                <option value="under_review">Under Review</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Assets Table */}
        <Card>
          <CardHeader>
            <CardTitle>Assets ({filteredAssets.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Asset</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Criticality</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Risk Score</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Vendors</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAssets.map((asset: AssetWithVendors) => {
                    const riskLevel = asset.risk_score ? getRiskLevel(asset.risk_score) : null;
                    return (
                      <tr key={asset.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{asset.name}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{asset.description}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-900 dark:text-white">{asset.asset_type}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCriticalityColor(asset.criticality_level)}`}>
                            {asset.criticality_level}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}>
                            {asset.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {asset.risk_score ? (
                            <div>
                              <span className={`font-medium ${riskLevel?.color}`}>
                                {asset.risk_score}
                              </span>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {riskLevel?.level} Risk
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400">Not assessed</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-gray-900 dark:text-white">
                          {asset.vendors?.length || 0} vendor(s)
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedAsset(asset)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditModal(asset)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAsset(asset.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredAssets.length > itemsPerPage && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAssets.length)} of {filteredAssets.length} assets
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev: number) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev: number) => prev + 1)}
                    disabled={currentPage * itemsPerPage >= filteredAssets.length}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {editingAsset ? 'Edit Asset' : 'Add New Asset'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="asset-form-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Asset Name *
                </label>
                <input
                  id="asset-form-name"
                  type="text"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Enter asset name"
                  aria-label="Asset name"
                />
              </div>

              <div>
                <label htmlFor="asset-form-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Asset Type *
                </label>
                <select
                  id="asset-form-type"
                  value={formData.asset_type}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, asset_type: e.target.value as Asset['asset_type']})}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  aria-label="Asset Type"
                >
                  <option value="software">Software</option>
                  <option value="hardware">Hardware</option>
                  <option value="service">Service</option>
                  <option value="data">Data</option>
                  <option value="infrastructure">Infrastructure</option>
                  <option value="third_party">Third Party</option>
                </select>
              </div>

              <div>
                <label htmlFor="asset-form-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <input
                  id="asset-form-category"
                  type="text"
                  value={formData.category}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, category: e.target.value})}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="e.g., Database, Web Application, API"
                  aria-label="Category"
                />
              </div>

              <div>
                <label htmlFor="asset-form-criticality" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Criticality Level *
                </label>
                <select
                  id="asset-form-criticality"
                  value={formData.criticality_level}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, criticality_level: e.target.value as Asset['criticality_level']})}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  aria-label="Criticality Level"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label htmlFor="asset-form-business-impact" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Business Impact *
                </label>
                <select
                  id="asset-form-business-impact"
                  value={formData.business_impact}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, business_impact: e.target.value as Asset['business_impact']})}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  aria-label="Business Impact"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label htmlFor="asset-form-data-classification" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data Classification *
                </label>
                <select
                  id="asset-form-data-classification"
                  value={formData.data_classification}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, data_classification: e.target.value as Asset['data_classification']})}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  aria-label="Data Classification"
                >
                  <option value="public">Public</option>
                  <option value="internal">Internal</option>
                  <option value="confidential">Confidential</option>
                  <option value="restricted">Restricted</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Owner *
                </label>
                <input
                  type="text"
                  value={formData.owner}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, owner: e.target.value})}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Asset owner"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Custodian *
                </label>
                <input
                  type="text"
                  value={formData.custodian}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, custodian: e.target.value})}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Asset custodian"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Asset description"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingAsset(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={editingAsset ? handleEditAsset : handleAddAsset}
                disabled={!formData.name || !formData.category || !formData.owner || !formData.custodian}
              >
                {editingAsset ? 'Update Asset' : 'Add Asset'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </WorkspacePageShell>
  );
};

export default AssetManagementPage;
