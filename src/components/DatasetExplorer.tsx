import React, { useState, useMemo } from 'react';
import { BostonRow } from '../types';
import { Database, Filter, ArrowUpDown, Info, TrendingUp, Search, Download } from 'lucide-react';

interface DatasetExplorerProps {
  dataset: BostonRow[];
  activeFeature: keyof BostonRow;
  setActiveFeature: (feature: keyof BostonRow) => void;
}

export default function DatasetExplorer({
  dataset,
  activeFeature,
  setActiveFeature
}: DatasetExplorerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof BostonRow>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [tablePage, setTablePage] = useState(0);

  // Hardcoded real-world correlations with MEDV (housing price)
  const correlations = [
    { feature: 'RM', label: 'Average Rooms (RM)', correlation: 0.695, desc: 'Houses with more rooms are highly valued' },
    { feature: 'ZN', label: 'Residential Zone Ratio (ZN)', correlation: 0.360, desc: 'Higher proportion of residential land zoned' },
    { feature: 'B', label: 'Neighborhood Index (B)', correlation: 0.333, desc: 'Historical demographic index statistic' },
    { feature: 'DIS', label: 'Employment Distance (DIS)', correlation: 0.249, desc: 'Closer proximity to key labor market nodes' },
    { feature: 'CHAS', label: 'Bounds Charles River (CHAS)', correlation: 0.175, desc: 'Dwellings bounding the river bear premiums' },
    { feature: 'AGE', label: 'Pre-1940 Homes proportion (AGE)', correlation: -0.377, desc: 'Older structures tend to have lower averages' },
    { feature: 'CRIM', label: 'Per Capita Crime Rate (CRIM)', correlation: -0.388, desc: 'Increased crime has visual downward pressures' },
    { feature: 'RAD', label: 'Highway Accessibility (RAD)', correlation: -0.382, desc: 'Index of access to radial highways' },
    { feature: 'NOX', label: 'Nitric Oxides Level (NOX)', correlation: -0.427, desc: 'Higher chemical oxide trace correlates downward' },
    { feature: 'TAX', label: 'Full Value Tax Rate (TAX)', correlation: -0.469, desc: 'Regions with heavier taxation zones show lower values' },
    { feature: 'INDUS', label: 'Industrial Acres Ratio (INDUS)', correlation: -0.484, desc: 'Greater non-retail business ratios depress pricing' },
    { feature: 'PTRATIO', label: 'Pupil-Teacher Ratio (PTRATIO)', correlation: -0.508, desc: 'Higher class densities skew neighborhoods cheaper' },
    { feature: 'LSTAT', label: 'Lower Class Status Ratio (LSTAT)', correlation: -0.738, desc: 'High poverty ratio shows strongest downward trends' },
  ];

  const handleSort = (field: keyof BostonRow) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Search filter and Sort logic
  const processedData = useMemo(() => {
    let filtered = dataset;
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = dataset.filter(row => 
        row.RM.toString().includes(term) ||
        row.LSTAT.toString().includes(term) ||
        row.CRIM.toString().includes(term) ||
        row.MEDV.toString().includes(term)
      );
    }

    return [...filtered].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [dataset, searchTerm, sortField, sortDirection]);

  const downloadCSV = () => {
    if (processedData.length === 0) return;
    
    // Ordered headers matching BostonRow's schema
    const headers: (keyof BostonRow)[] = [
      'id', 'CRIM', 'ZN', 'INDUS', 'CHAS', 'NOX', 'RM', 'AGE', 'DIS', 'RAD', 'TAX', 'PTRATIO', 'B', 'LSTAT', 'MEDV'
    ];
    
    // Create the CSV content
    const csvRows = [
      headers.join(','), // Header row
      ...processedData.map(row => 
        headers.map(header => {
          const val = row[header];
          return val !== undefined ? val : '';
        }).join(',')
      )
    ];
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    
    const filename = searchTerm.trim() !== '' 
      ? `boston_dataset_filtered_${searchTerm.toLowerCase().replace(/[^a-z0-9]/g, '_')}.csv`
      : 'boston_dataset.csv';
      
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Paginated Rows (Show 10 rows as queried)
  const paginatedRows = useMemo(() => {
    return processedData.slice(tablePage * 10, (tablePage + 1) * 10);
  }, [processedData, tablePage]);

  const totalPages = Math.ceil(processedData.length / 10);

  // Scatter plot points renderer
  const scatterFeatureData = useMemo(() => {
    const xValues = dataset.map(r => r[activeFeature] as number);
    const yValues = dataset.map(r => r.MEDV);
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);

    return {
      points: dataset.map(row => ({
        x: row[activeFeature] as number,
        y: row.MEDV,
        id: row.id,
      })),
      minX: minX * 0.95,
      maxX: maxX * 1.05,
      minY: minY * 0.9,
      maxY: maxY * 1.1
    };
  }, [dataset, activeFeature]);

  return (
    <section id="section-dataset" className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 space-y-8 scroll-mt-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-semibold uppercase tracking-wider">
            <Database className="w-4 h-4" /> Exploring Boston Housing Data
          </div>
          <h2 className="text-xl md:text-2xl text-white font-sans font-bold tracking-tight mt-1">
            Standard Exploratory Data Analysis (EDA)
          </h2>
          <p className="text-slate-400 text-xs mt-0.5">
            Examine sample records, review variable descriptive statistics, and plot linear correlation metrics.
          </p>
        </div>

        {/* Quick statistics readout */}
        <div className="flex gap-2 flex-wrap" id="eda-stats-pills">
          <div className="bg-slate-950 border border-slate-800 px-3.5 py-1.5 rounded-lg font-mono">
            <span className="text-[10px] text-slate-500 block">TOTAL RECORD VOLUME</span>
            <strong className="text-white text-sm">100 Samples</strong>
          </div>
          <div className="bg-slate-950 border border-slate-800 px-3.5 py-1.5 rounded-lg font-mono">
            <span className="text-[10px] text-slate-500 block">DESCRIPTIVE FEATURES</span>
            <strong className="text-emerald-400 text-sm">13 variables</strong>
          </div>
          <div className="bg-slate-950 border border-slate-800 px-3.5 py-1.5 rounded-lg font-mono w-fit">
            <span className="text-[10px] text-slate-500 block">MISSING ENTIRETY</span>
            <strong className="text-emerald-500 text-sm">0 Nulls (100% clean)</strong>
          </div>
        </div>
      </div>

      {/* Two Columns: Visualizations & Table */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Side: Charts (Bar list & Scatter plots) */}
        <div className="xl:col-span-7 space-y-6">
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" /> Linear Correlations with target (MEDV)
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">Positive (+1) to Negative (-1)</span>
            </div>

            {/* Inline SVG/HTML horizontal correlation bar chart */}
            <div className="space-y-2.5 max-h-[290px] overflow-y-auto pr-2 custom-scrollbar" id="correlations-list">
              {correlations.map((c) => {
                const isPositive = c.correlation >= 0;
                const absCor = Math.abs(c.correlation);
                const percent = Math.round(absCor * 100);
                const isSelected = activeFeature === c.feature;

                return (
                  <div
                    key={c.feature}
                    onClick={() => {
                      if (c.feature === 'ZN' || c.feature === 'RM' || c.feature === 'LSTAT' || c.feature === 'CRIM' || c.feature === 'PTRATIO') {
                        setActiveFeature(c.feature as keyof BostonRow);
                      }
                    }}
                    className={`p-2 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                        : 'bg-slate-900/50 border-slate-900 hover:bg-slate-900/90 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${isPositive ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                        <span className="font-semibold">{c.label}</span>
                        {['RM', 'LSTAT', 'CRIM', 'PTRATIO'].includes(c.feature) && (
                          <span className="text-[9px] bg-slate-850 px-1 py-0.2 rounded border border-slate-700 font-mono text-slate-400">
                            Fit Available
                          </span>
                        )}
                      </div>
                      <span className={`font-mono font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPositive ? '+' : ''}{c.correlation.toFixed(3)}
                      </span>
                    </div>

                    {/* Progress Bar Track */}
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden flex">
                      {isPositive ? (
                        <>
                          <div className="w-1/2"></div>
                          <div 
                            className="bg-emerald-500 h-full rounded-r-full transition-all"
                            style={{ width: `${percent / 2}%` }}
                          ></div>
                        </>
                      ) : (
                        <>
                          <div className="w-1/2 flex justify-end">
                            <div 
                              className="bg-red-500 h-full rounded-l-full transition-all"
                              style={{ width: `${percent / 2}%` }}
                            ></div>
                          </div>
                          <div className="w-1/2"></div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 bg-slate-900/30 p-2.5 rounded border border-slate-900">
              <Info className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
              <span>We focus on <strong className="text-white">RM</strong> (average rooms) and <strong className="text-white">LSTAT</strong> (neighborhood status percentage) as premium single predictor metrics because of their strong relationships. Click any predictor variable tagged &quot;Fit Available&quot; to inspect below!</span>
            </div>
          </div>

          {/* Scatter Plot */}
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                📈 2D Relationship: {activeFeature} vs MEDV
              </h3>
              <div className="flex gap-1.5">
                {(['RM', 'LSTAT', 'CRIM', 'PTRATIO'] as (keyof BostonRow)[]).map((feat) => (
                  <button
                    key={feat}
                    onClick={() => setActiveFeature(feat)}
                    className={`px-2 py-0.5 text-[10px] rounded font-mono transition-all ${
                      activeFeature === feat
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-850'
                    }`}
                  >
                    X = {feat}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom SVG Scatter plot */}
            <div className="relative w-full h-[220px]" id="scatter-chart-eda">
              <svg viewBox="0 0 500 220" className="w-full h-full text-slate-700 bg-transparent overflow-visible">
                {/* Axes and Grid Lines */}
                <line x1="40" y1="20" x2="40" y2="185" stroke="#334155" strokeWidth="1" />
                <line x1="40" y1="185" x2="480" y2="185" stroke="#334155" strokeWidth="1" />

                {/* Y-Grid lines */}
                <line x1="40" y1="130" x2="480" y2="130" stroke="#1e293b" strokeDasharray="2,2" />
                <line x1="40" y1="75" x2="480" y2="75" stroke="#1e293b" strokeDasharray="2,2" strokeWidth="1" />

                {/* Plot points */}
                {scatterFeatureData.points.map((pt, idx) => {
                  const paddingLeft = 40;
                  const paddingRight = 480;
                  const paddingTop = 20;
                  const paddingBottom = 185;

                  // Normalize values to fit inside 500x220 container
                  const rangeX = scatterFeatureData.maxX - scatterFeatureData.minX || 1;
                  const rangeY = scatterFeatureData.maxY - scatterFeatureData.minY || 1;

                  const cx = paddingLeft + ((pt.x - scatterFeatureData.minX) / rangeX) * (paddingRight - paddingLeft);
                  // Remember: in SVG, y is 0 at Top, so we invert
                  const cy = paddingBottom - ((pt.y - scatterFeatureData.minY) / rangeY) * (paddingBottom - paddingTop);

                  const isHighPrice = pt.y > 35;
                  
                  return (
                    <circle
                      key={idx}
                      cx={cx}
                      cy={cy}
                      r="4"
                      className={`transition-all hover:r-6 cursor-pointer ${
                        isHighPrice 
                          ? 'fill-indigo-400 stroke-indigo-900 border' 
                          : 'fill-emerald-400 stroke-slate-950'
                      } stroke-[0.8] opacity-75 hover:opacity-100`}
                    >
                      <title>{`ID ${pt.id}: ${activeFeature}=${pt.x.toFixed(2)}, MEDV=$${pt.y.toFixed(1)}k`}</title>
                    </circle>
                  );
                })}

                {/* Chart Labels */}
                <text x="14" y="25" className="fill-slate-500 font-mono text-[9px] text-right" textAnchor="end">$50k</text>
                <text x="14" y="105" className="fill-slate-500 font-mono text-[9px]" textAnchor="end">MEDV (Price)</text>
                <text x="14" y="185" className="fill-slate-500 font-mono text-[9px]" textAnchor="end">$5k</text>

                <text x="40" y="200" className="fill-slate-500 font-mono text-[9px]" textAnchor="start">{scatterFeatureData.minX.toFixed(1)}</text>
                <text x="260" y="208" className="fill-slate-400 font-mono text-[9px]" textAnchor="middle">Independent Variable X ({activeFeature})</text>
                <text x="480" y="200" className="fill-slate-500 font-mono text-[9px]" textAnchor="end">{scatterFeatureData.maxX.toFixed(1)}</text>
              </svg>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span> Standard Homes</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-indigo-400 inline-block"></span> High-Value Dwellings (&gt;$35k)</span>
              <span>Hover points to read original housing records.</span>
            </div>
          </div>
        </div>

        {/* Right Side: Data Table */}
        <div className="xl:col-span-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-slate-900 border border-slate-800 text-emerald-400">
                <Filter className="w-3.5 h-3.5" />
              </span>
              <div>
                <span className="text-[10px] text-slate-500 font-mono block">LIVE WORKSPACE SAMPLE</span>
                <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                  First 10 of Boston Dataset
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Simple Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setTablePage(0); // Reset page on filter
                  }}
                  placeholder="Search values..."
                  className="bg-slate-900 border border-slate-800 text-slate-200 text-xs px-2.5 py-1.5 pl-8 rounded-lg outline-none focus:border-slate-700 w-full sm:w-[130px]"
                />
              </div>

              {/* Download CSV Button */}
              <button
                onClick={downloadCSV}
                title="Download current filtered dataset as CSV"
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-emerald-400 hover:text-emerald-350 font-mono text-xs rounded-lg transition-all cursor-pointer"
                id="btn-download-dataset"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto border border-slate-800 rounded-lg bg-slate-950" id="eda-rows-table">
            <table className="w-full text-left border-collapse text-[11px] font-mono">
              <thead>
                <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                  <th onClick={() => handleSort('id')} className="p-2.5 font-bold cursor-pointer hover:bg-slate-850 transition-colors select-none text-slate-300">
                    ID <ArrowUpDown className="w-2.5 h-2.5 inline" />
                  </th>
                  <th onClick={() => handleSort('CRIM')} className="p-2.5 font-bold cursor-pointer hover:bg-slate-850 transition-colors select-none">
                    CRIM <ArrowUpDown className="w-2.5 h-2.5 inline" />
                  </th>
                  <th onClick={() => handleSort('RM')} className="p-2.5 font-bold bg-slate-850/30 cursor-pointer hover:bg-slate-850 transition-colors select-none text-emerald-400">
                    RM <ArrowUpDown className="w-2.5 h-2.5 inline rotate-90" />
                  </th>
                  <th onClick={() => handleSort('LSTAT')} className="p-2.5 font-bold cursor-pointer hover:bg-slate-850 transition-colors select-none">
                    LSTAT <ArrowUpDown className="w-2.5 h-2.5 inline" />
                  </th>
                  <th onClick={() => handleSort('TAX')} className="p-2.5 font-bold cursor-pointer hover:bg-slate-850 transition-colors select-none">
                    TAX <ArrowUpDown className="w-2.5 h-2.5 inline" />
                  </th>
                  <th onClick={() => handleSort('MEDV')} className="p-2.5 font-bold bg-slate-850/50 cursor-pointer hover:bg-slate-850 transition-colors select-none text-purple-400">
                    MEDV <ArrowUpDown className="w-2.5 h-2.5 inline" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500">
                      No houses match search term.
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-2.5 text-slate-400">#{row.id}</td>
                      <td className="p-2.5 text-slate-300">{row.CRIM.toFixed(3)}</td>
                      <td className="p-2.5 font-semibold text-emerald-400 bg-emerald-500/5">{row.RM.toFixed(3)}</td>
                      <td className="p-2.5 text-slate-300">{row.LSTAT.toFixed(2)}</td>
                      <td className="p-2.5 text-slate-500">{row.TAX}</td>
                      <td className="p-2.5 font-bold text-purple-400 bg-purple-500/5">${row.MEDV.toFixed(1)}k</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table pagination stats */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 bg-slate-950 p-3 rounded-lg border border-slate-800" id="table-pagination-nav">
              <span>Showing rows {tablePage * 10 + 1}-{Math.min((tablePage + 1) * 10, processedData.length)} of {processedData.length}</span>
              <div className="flex gap-1.5">
                <button
                  disabled={tablePage === 0}
                  onClick={() => setTablePage(p => p - 1)}
                  className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:hover:bg-slate-900 font-bold hover:bg-slate-800 transition-colors"
                >
                  &lt; Prev
                </button>
                <button
                  disabled={tablePage >= totalPages - 1}
                  onClick={() => setTablePage(p => p + 1)}
                  className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:hover:bg-slate-900 font-bold hover:bg-slate-800 transition-colors"
                >
                  Next &gt;
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
