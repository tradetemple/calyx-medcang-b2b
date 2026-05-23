'use client'
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUp, ArrowDown, ArrowUpDown, FileText } from 'lucide-react';
import { EnhancedProduct } from '@/lib/product-enhancement';
import DynamicPrice from '@/components/DynamicPrice';
import { useProductFiltersStore } from '@/stores/productFiltersStore';
import { useAuditStore } from '@/stores/useAuditStore';

interface ProductGridProps {
  products: EnhancedProduct[];
  vatNumber: string;
  lang: string;
  dict: any;
}

// STRICT TYPE PARSER: Safely converts stringified JSON or returns the array
const getSpecsArray = (specs: any): { name: string; value: string }[] => {
  if (!specs) return [];
  if (Array.isArray(specs)) return specs;
  if (typeof specs === 'string') {
    try {
      const parsed = JSON.parse(specs);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

// SPEC EXTRACTOR: Safely finds the value by name
const getSpecValue = (specs: any, key: string): string | null => {
  const specArray = getSpecsArray(specs);
  return specArray.find(s => s.name === key)?.value || null;
};

// TEST RESULTS PARSER
const getTestResults = (results: any): Record<string, any> => {
  if (!results) return {};
  if (typeof results === 'object' && !Array.isArray(results)) return results;
  if (typeof results === 'string') {
    try { return JSON.parse(results); } catch { return {}; }
  }
  return {};
};

export default function ProductGrid({ products, lang, dict }: ProductGridProps) {
  const { sortBy, sortOrder, setSorting } = useProductFiltersStore();
  const addAuditLog = useAuditStore(state => state.addLog);
  const t = dict.productGrid;

  const handleSort = (field: any) => {
    setSorting(field, sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const SortableHeader = ({ field, label, width = 'w-[100px]' }: { field: string, label: string, width?: string }) => {
    const isActive = sortBy === field;
    return (
      <th className={`p-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 ${width} align-middle`}>
        <button
          onClick={() => handleSort(field)}
          className={`group flex items-center gap-1.5 transition-all outline-none ${
            isActive ? 'text-blue-600' : 'hover:text-slate-800'
          }`}
        >
          {label}
          <span className="flex-shrink-0">
            {isActive ? (
              sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
            ) : (
              <ArrowUpDown className="w-3 h-3 opacity-30 group-hover:opacity-100" />
            )}
          </span>
        </button>
      </th>
    );
  };

  return (
    <div className="space-y-4">
      {/* DESKTOP VIEW */}
      <div className="hidden md:block">
        <div className="w-full rounded-none border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="max-h-[75vh] overflow-y-auto overflow-x-auto custom-scrollbar">
            <div className="min-w-[1150px]">
              <table className="w-full border-collapse text-left table-fixed">
                <thead className="sticky top-0 z-30 bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 w-[70px]">{t.labels.image}</th>
                    <SortableHeader field="name" label={t.labels.product} width="w-[240px]" />
                    <SortableHeader field="price" label={t.labels.price} width="w-[100px]" />
                    <SortableHeader field="thc" label={t.labels.thc} width="w-[80px]" />
                    <SortableHeader field="cbd" label={t.labels.cbd} width="w-[80px]" />
                    <th className="p-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 w-[100px]">{t.labels.genetics}</th>
                    <SortableHeader field="irradiation" label={t.labels.irradiation} width="w-[100px]" />
                    <SortableHeader field="batch" label={`${t.labels.batch} / ${t.labels.exp}`} width="w-[140px]" />
                    <SortableHeader field="liveStock" label={t.labels.liveStock} width="w-[100px]" />
                    <th className="p-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 w-[60px]">{t.labels.coa}</th>
                    <th className="p-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 w-[90px]">{t.labels.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {products.map((product) => {
                    const testResults = getTestResults(product.test_results);
                    const isOOS = product.status === 'out_of_stock';
                    
                    return (
                      <tr key={product.id} className={`hover:bg-slate-50/80 transition-colors ${isOOS ? 'opacity-50' : ''}`}>
                        <td className="p-3">
                          <div className="relative w-12 h-12 border border-slate-100 bg-slate-50">
                            {product.product_image && (
                              <Image src={product.product_image} alt="" fill className="object-cover" sizes="48px" />
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col">
                            <Link href={product.productUrl} className="font-bold text-slate-900 text-sm hover:text-blue-600 truncate">
                              {product.displayName}
                            </Link>
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-tighter truncate">
                              {product.descriptive_name}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 font-mono text-sm font-bold text-slate-700">
                          <DynamicPrice lang={lang} basePrice={product.rawPrice} />
                          <span className="text-[10px] ml-0.5 text-slate-400">/g</span>
                        </td>
                        <td className="p-3 font-mono text-sm text-slate-900">{getSpecValue(product.specifications, 'THC Content') || '-'}</td>
                        <td className="p-3 font-mono text-sm text-slate-900">{getSpecValue(product.specifications, 'CBD Content') || '-'}</td>
                        <td className="p-3 text-xs text-slate-600">{getSpecValue(product.specifications, 'Genotype') || '-'}</td>
                        <td className="p-3">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 border ${
                            getSpecValue(product.specifications, 'Irradiation')?.includes('Non') 
                              ? 'text-emerald-700 border-emerald-200 bg-emerald-50' 
                              : 'text-amber-700 border-amber-200 bg-amber-50'
                          }`}>
                            {getSpecValue(product.specifications, 'Irradiation') === 'Non-Irradiated' ? 'NON' : 'GAMMA'}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col">
                            <span className="font-mono text-[11px] text-slate-900 font-bold">
                              {testResults.batch_number || '-'}
                            </span>
                            {testResults.expiry_date && (
                              <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                                {t.labels.exp} {testResults.expiry_date}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 font-mono text-sm font-bold text-slate-900">
                          {isOOS ? '0' : product.live_stock_grams?.toLocaleString()}g
                        </td>
                        <td className="p-3">
                          {testResults.coa_url && (
                            <a 
                              href={testResults.coa_url} 
                              target="_blank" 
                              onClick={() => addAuditLog('COA_ACCESS', `Quality report accessed for Batch: ${testResults.batch_number || product.displayName}`, 'SUCCESS')}
                              className="text-slate-400 hover:text-blue-600"
                            >
                              <FileText className="w-5 h-5" />
                            </a>
                          )}
                        </td>
                        <td className="p-3">
                          <Link href={product.productUrl} className="text-[10px] bg-blue-600 font-bold uppercase text-white p-2 tracking-widest hover:underline">
                            {t.labels.view}
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE VIEW */}
      <div className="md:hidden space-y-3">
        {products.map((product) => {
          const testResults = getTestResults(product.test_results);
          const isOOS = product.status === 'out_of_stock';
          
          return (
            <div key={product.id} className={`bg-white border border-slate-200 p-4 shadow-sm ${isOOS ? 'opacity-60' : ''}`}>
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-slate-50 border border-slate-100 relative flex-shrink-0">
                  {product.product_image && <Image src={product.product_image} alt="" fill className="object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={product.productUrl} className="font-bold text-slate-900 block truncate">
                    {product.displayName}
                  </Link>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 truncate">{product.descriptive_name}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-blue-600">
                      <DynamicPrice lang={lang} basePrice={product.rawPrice} />/g
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 border border-slate-200">
                      {getSpecValue(product.specifications, 'THC Content')} {t.labels.thc}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100">
                <div>
                  <p className="text-[9px] uppercase text-slate-400 font-bold">{`${t.labels.batch} / ${t.labels.exp}`}</p>
                  <p className="text-[10px] font-mono font-bold text-slate-700">{testResults.batch_number || '-'}</p>
                  <p className="text-[10px] font-mono text-slate-500">{testResults.expiry_date || '-'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] uppercase text-slate-400 font-bold">{t.labels.liveStock}</p>
                  <p className="text-xs font-mono font-bold">{isOOS ? '0' : product.live_stock_grams}g</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}