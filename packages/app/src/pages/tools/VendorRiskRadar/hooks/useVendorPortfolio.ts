import { useState, useEffect, useCallback, useMemo } from 'react';
import { useVendors } from '../../../../hooks/useVendors';
import { useAuth } from '../../../../context/AuthContext';
import {
  calculateInherentRisk,
  calculateResidualRisk,
  calculatePortfolioStats,
  vendorRiskFieldsFromResidual,
  hasCompleteIntakeFactors,
} from '../../../../utils/riskCalculations';
import { mergeRadarMetaIntoNotes, parseRadarMetaFromNotes } from '../../../../utils/vendorRadarMeta';
import { parseCSV, generateCSV } from '../../../../utils/csvImportExport';
import {
  tryParseRadarPortfolioExchange,
  serializeRadarPortfolioExchange,
} from '../../../../utils/vendorRadarPortfolioExchange';
import type { VendorRadar, VendorBase, PortfolioStats } from '../../../../types/vendorRadar';

const STORAGE_KEY = 'vendorsoluce_vendors';

export const useVendorPortfolio = () => {
  const { isAuthenticated, user } = useAuth();
  const { vendors: dbVendors, createVendor, updateVendor, deleteVendor } = useVendors();
  const [localVendors, setLocalVendors] = useState<VendorRadar[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load vendors from database or localStorage
  useEffect(() => {
    if (isAuthenticated && user) {
      // Database vendors are loaded via useVendors hook
      // Convert database vendors to VendorRadar format if needed
    } else {
      // Load from localStorage
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setLocalVendors(Array.isArray(parsed) ? parsed : []);
        } catch (e) {
          console.error('Failed to load vendors from localStorage:', e);
        }
      }
    }
  }, [isAuthenticated, user]);

  // Convert database vendors to VendorRadar format
  const vendors: VendorRadar[] = useMemo(() => {
    if (isAuthenticated && dbVendors && dbVendors.length > 0) {
      return dbVendors.map((v): VendorRadar => {
        const meta = parseRadarMetaFromNotes(v.notes);
        const category = (v.risk_level === 'Critical'
          ? 'critical'
          : v.risk_level === 'High'
            ? 'strategic'
            : v.risk_level === 'Medium'
              ? 'tactical'
              : 'commodity') as VendorRadar['category'];
        const intakeFactors = meta.intakeFactors;
        const base: Partial<VendorRadar> = {
          category,
          sector: v.industry || '',
          location: '',
          dataTypes: [],
          serviceType: meta.serviceType,
          populationImpacted: meta.populationImpacted,
          intakeFactors: hasCompleteIntakeFactors(intakeFactors) ? intakeFactors : undefined,
        };
        const stored = v.risk_score || 0;
        const inherentRisk = hasCompleteIntakeFactors(intakeFactors)
          ? calculateInherentRisk({ ...base, intakeFactors })
          : stored;
        const residualRisk = hasCompleteIntakeFactors(intakeFactors)
          ? calculateResidualRisk({ ...base, intakeFactors }, inherentRisk)
          : stored;
        return {
          id: v.id,
          name: v.name,
          category,
          sector: v.industry || '',
          location: '',
          contact: v.contact_email ?? undefined,
          notes: v.notes ?? undefined,
          dataTypes: [],
          serviceType: meta.serviceType,
          populationImpacted: meta.populationImpacted,
          intakeFactors: hasCompleteIntakeFactors(intakeFactors) ? intakeFactors : undefined,
          inherentRisk,
          residualRisk,
          sbomProfile: undefined,
          createdAt: v.created_at || new Date().toISOString(),
          updatedAt: v.updated_at || new Date().toISOString(),
        };
      });
    }
    return localVendors;
  }, [isAuthenticated, dbVendors, localVendors]);

  // Calculate portfolio statistics
  const stats: PortfolioStats = useMemo(() => {
    return calculatePortfolioStats(vendors);
  }, [vendors]);

  // Add vendor
  const addVendor = useCallback(async (vendorData: Partial<VendorBase | VendorRadar>) => {
    setLoading(true);
    setError(null);
    
    try {
      // Calculate risks
      const inherentRisk = calculateInherentRisk(vendorData);
      const residualRisk = calculateResidualRisk(vendorData, inherentRisk);
      
      const vendor: VendorRadar = {
        id: crypto.randomUUID(),
        name: vendorData.name || '',
        category: vendorData.category || 'tactical',
        sector: vendorData.sector || '',
        location: vendorData.location || '',
        contact: vendorData.contact,
        notes: vendorData.notes,
        dataTypes: vendorData.dataTypes || [],
        serviceType: vendorData.serviceType,
        populationImpacted: vendorData.populationImpacted,
        inherentRisk,
        residualRisk,
        sbomProfile: vendorData.sbomProfile,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (isAuthenticated && user) {
        const notesForDb = mergeRadarMetaIntoNotes(vendor.notes, {
          serviceType: vendor.serviceType,
          populationImpacted: vendor.populationImpacted,
          intakeFactors: vendor.intakeFactors,
        });
        await createVendor({
          name: vendor.name,
          ...vendorRiskFieldsFromResidual(residualRisk),
          notes: notesForDb,
          industry: vendor.sector,
          contact_email: vendor.contact,
        });
      } else {
        const updated = [...localVendors, vendor];
        setLocalVendors(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add vendor');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, localVendors, createVendor]);

  // Update vendor
  const updateVendorData = useCallback(async (id: string, vendorData: Partial<VendorRadar>) => {
    setLoading(true);
    setError(null);
    
    try {
      const existingList = isAuthenticated && dbVendors?.length
        ? dbVendors.map((v) => {
            const meta = parseRadarMetaFromNotes(v.notes);
            return {
              id: v.id,
              name: v.name,
              category: (v.risk_level === 'Critical' ? 'critical' : 
                        v.risk_level === 'High' ? 'strategic' : 
                        v.risk_level === 'Medium' ? 'tactical' : 'commodity') as VendorRadar['category'],
              sector: v.industry || '',
              location: '',
              contact: v.contact_email ?? undefined,
              notes: v.notes ?? undefined,
              dataTypes: [] as string[],
              serviceType: meta.serviceType,
              populationImpacted: meta.populationImpacted,
              inherentRisk: v.risk_score || 0,
              residualRisk: v.risk_score || 0,
              createdAt: v.created_at || new Date().toISOString(),
              updatedAt: v.updated_at || new Date().toISOString(),
            } as VendorRadar;
          })
        : localVendors;
      const prior = existingList.find((v) => v.id === id);
      const mergedInput: Partial<VendorRadar> = prior ? { ...prior, ...vendorData } : { ...vendorData };

      const inherentRisk = calculateInherentRisk(mergedInput);
      const residualRisk = calculateResidualRisk(mergedInput, inherentRisk);
      
      const updated: VendorRadar = {
        ...(mergedInput as VendorRadar),
        id,
        inherentRisk,
        residualRisk,
        updatedAt: new Date().toISOString()
      };

      if (isAuthenticated && user) {
        const notesForDb = mergeRadarMetaIntoNotes(updated.notes, {
          serviceType: updated.serviceType,
          populationImpacted: updated.populationImpacted,
          intakeFactors: updated.intakeFactors,
        });
        await updateVendor(id, {
          name: updated.name,
          ...vendorRiskFieldsFromResidual(residualRisk),
          notes: notesForDb,
          industry: updated.sector,
          contact_email: updated.contact,
        });
      } else {
        const updatedList = localVendors.map(v => v.id === id ? updated : v);
        setLocalVendors(updatedList);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update vendor');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, localVendors, updateVendor, dbVendors]);

  // Delete vendor
  const deleteVendorData = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      if (isAuthenticated && user) {
        await deleteVendor(id);
      } else {
        const updated = localVendors.filter(v => v.id !== id);
        setLocalVendors(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete vendor');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, localVendors, deleteVendor]);

  // Import vendors from CSV or portable JSON (website / app exchange)
  const importVendors = useCallback(async (csvText: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const fromPortfolio = tryParseRadarPortfolioExchange(csvText);
      const importedVendors = fromPortfolio ?? parseCSV(csvText);
      
      if (isAuthenticated && user) {
        // Import to database
        await Promise.all(
          importedVendors.map((v) =>
            createVendor({
              name: v.name,
              ...vendorRiskFieldsFromResidual(v.residualRisk),
              notes: mergeRadarMetaIntoNotes(v.notes, {
                serviceType: v.serviceType,
                populationImpacted: v.populationImpacted,
              }),
              industry: v.sector,
              contact_email: v.contact,
            })
          )
        );
      } else {
        const updated = [...localVendors, ...importedVendors];
        setLocalVendors(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import vendors');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, localVendors, createVendor]);

  // Export vendors to CSV
  const exportVendors = useCallback(() => {
    try {
      const csv = generateCSV(vendors);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vendorsoluce-vendors-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export vendors');
    }
  }, [vendors]);

  /** Portable JSON for static radar page or backup (same schema as website export). */
  const exportPortfolioExchange = useCallback(() => {
    try {
      const json = serializeRadarPortfolioExchange(vendors);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vendorsoluce-radar-portfolio-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export portfolio');
    }
  }, [vendors]);

  // Scan vendors (recalculate risks)
  const scanVendors = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const updated = vendors.map(v => {
        const inherentRisk = calculateInherentRisk(v);
        const residualRisk = calculateResidualRisk(v, inherentRisk);
        return {
          ...v,
          inherentRisk,
          residualRisk,
          updatedAt: new Date().toISOString()
        };
      });

      if (isAuthenticated && user) {
        await Promise.all(
          updated.map((v) => updateVendor(v.id, vendorRiskFieldsFromResidual(v.residualRisk)))
        );
      } else {
        setLocalVendors(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan vendors');
    } finally {
      setLoading(false);
    }
  }, [vendors, isAuthenticated, user, updateVendor]);

  return {
    vendors,
    stats,
    addVendor,
    updateVendor: updateVendorData,
    deleteVendor: deleteVendorData,
    importVendors,
    exportVendors,
    exportPortfolioExchange,
    scanVendors,
    loading,
    error
  };
};
