import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSeasonContext } from '@/context/SeasonContext';
import { useStandings } from '@/hooks/useStandings';
import { RankBadge } from '@/components/RankBadge';
import { SearchInput } from '@/components/SearchInput';
import { ExportButton } from '@/components/ExportButton';
import { TableSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { ArrowUpDown, Trophy, Eye } from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';

export const StandingsPage: React.FC = () => {
  const { selectedSeason, selectedSeasonId } = useSeasonContext();
  const { standings, loading } = useStandings(selectedSeasonId);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<string>('totalScore'); // 'totalScore' or categoryId
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sorting Handler
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  // Filter & Sort Data
  const filteredAndSortedRows = useMemo(() => {
    if (!standings || !standings.rows) return [];

    let rows = [...standings.rows];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter((row) => row.teamName.toLowerCase().includes(q));
    }

    // Sort rows
    rows.sort((a, b) => {
      let valA = 0;
      let valB = 0;

      if (sortKey === 'totalScore') {
        valA = a.totalScore;
        valB = b.totalScore;
      } else {
        // Sort by specific category score
        const scoreA = a.categoryScores.find((c) => c.categoryId === sortKey);
        const scoreB = b.categoryScores.find((c) => c.categoryId === sortKey);
        valA = scoreA ? scoreA.scoreValue : 0;
        valB = scoreB ? scoreB.scoreValue : 0;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return rows;
  }, [standings, searchQuery, sortKey, sortOrder]);

  // Pagination
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedRows.slice(start, start + itemsPerPage);
  }, [filteredAndSortedRows, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedRows.length / itemsPerPage);

  // Excel Export Handler
  const handleExportExcel = () => {
    if (!standings) return;

    // Build worksheet data
    const data = filteredAndSortedRows.map((row) => {
      const rowData: Record<string, any> = {
        'الترتيب': row.rank,
        'اسم الفريق': row.teamName,
      };

      standings.categories.forEach((cat) => {
        const scoreObj = row.categoryScores.find((c) => c.categoryId === cat.id);
        rowData[cat.name] = scoreObj ? scoreObj.scoreValue : 0;
      });

      rowData['المجموع التراكمي'] = row.totalScore;
      return rowData;
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'الترتيب العام');
    
    // Write in Arabic format
    XLSX.writeFile(workbook, `ترتيب_دوري_الأنبا_أبانوب_${selectedSeason?.name.replace(/ /g, '_')}.xlsx`);
  };

  // PDF Export Handler
  const handleExportPdf = () => {
    if (!standings || !selectedSeason) return;

    const doc = new jsPDF({ orientation: 'landscape', format: 'a4' });
    
    // Add generic PDF title and meta info
    doc.setFontSize(18);
    doc.text(`Abanob Premier League - Standings Report`, 14, 20);
    doc.setFontSize(12);
    doc.text(`Season: ${selectedSeason.name}`, 14, 28);
    doc.text(`Generated Date: ${new Date().toLocaleDateString()}`, 14, 34);
    
    // Draw columns & table rows
    let y = 45;
    doc.setFillColor(11, 42, 91); // Brand Navy
    doc.rect(14, y, 268, 8, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text('Rank', 16, y + 6);
    doc.text('Team Name', 32, y + 6);
    
    let xOffset = 110;
    standings.categories.forEach((cat) => {
      const abbrev = cat.name.slice(0, 8);
      doc.text(abbrev, xOffset, y + 6);
      xOffset += 20;
    });
    doc.text('Total Score', 250, y + 6);
    
    y += 8;
    doc.setTextColor(50, 50, 50);

    filteredAndSortedRows.forEach((row, i) => {
      // Draw stripes
      if (i % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, y, 268, 7, 'F');
      }
      
      doc.text(row.rank.toString(), 16, y + 5);
      doc.text(row.teamName, 32, y + 5);
      
      let scoreXOffset = 110;
      standings.categories.forEach((cat) => {
        const scoreObj = row.categoryScores.find((c) => c.categoryId === cat.id);
        const val = scoreObj ? scoreObj.scoreValue.toString() : '0';
        doc.text(val, scoreXOffset, y + 5);
        scoreXOffset += 20;
      });
      
      doc.setFont('helvetica', 'bold');
      doc.text(row.totalScore.toString(), 250, y + 5);
      doc.setFont('helvetica', 'normal');
      
      y += 7;
      if (y > 185) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save(`ترتيب_دوري_الأنبا_أبانوب_${selectedSeason.name.replace(/ /g, '_')}.pdf`);
  };

  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <div className="w-full space-y-6" dir="rtl">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 dark:border-brand-navy-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy className="h-5.5 w-5.5 text-brand-gold-500" />
            <span>جدول الترتيب العام</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            جدول إحصائيات المجموعات لـ <span className="font-extrabold text-brand-navy-600 dark:text-brand-gold-400">{selectedSeason?.name}</span>. انقر على رؤوس الأعمدة لفرز الدرجات.
          </p>
        </div>
        
        {standings && standings.rows.length > 0 && (
          <ExportButton 
            onExportExcel={handleExportExcel} 
            onExportPdf={handleExportPdf} 
          />
        )}
      </div>

      {/* Roster Controls */}
      {standings && standings.rows.length > 0 ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-brand-navy-900 p-4 rounded-2xl border border-slate-200 dark:border-brand-navy-800 shadow-sm">
            <SearchInput 
              value={searchQuery} 
              onChange={setSearchQuery} 
              placeholder="البحث عن فريق باسمه..." 
            />
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              عدد الفرق في التصفيات: <span className="text-brand-navy-600 dark:text-brand-gold-400 font-extrabold">{filteredAndSortedRows.length} فريق</span>
            </div>
          </div>

          {/* Table Container */}
          <div className="w-full overflow-x-auto border border-slate-200 dark:border-brand-navy-800 rounded-2xl bg-white dark:bg-brand-navy-950 shadow-sm">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-brand-navy-900 border-b border-slate-200 dark:border-brand-navy-800 text-xs font-black text-slate-700 dark:text-slate-300">
                  <th className="py-3 px-3 sm:py-4 sm:px-6 text-center w-16 sm:w-20">الترتيب</th>
                  <th className="py-3 px-3 sm:py-4 sm:px-4 w-36 sm:w-52">اسم الفريق</th>
                  
                  {/* Category Headers (Dynamic) */}
                  {standings.categories.map((cat) => (
                    <th 
                      key={cat.id} 
                      onClick={() => handleSort(cat.id)}
                      className="py-3 px-2 sm:py-4 sm:px-3 text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-brand-navy-800 select-none transition-colors"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>{cat.name}</span>
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      </div>
                      <span className="text-[9px] text-slate-400 block font-normal mt-0.5">الحد الأقصى ({cat.maxScore})</span>
                    </th>
                  ))}

                  {/* Total Score Header */}
                  <th 
                    onClick={() => handleSort('totalScore')}
                    className="py-3 px-3 sm:py-4 sm:px-6 text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-brand-navy-800 select-none transition-colors w-24 sm:w-32 border-r border-slate-200 dark:border-brand-navy-800 bg-brand-navy-50/20 dark:bg-brand-navy-900/40"
                  >
                    <div className="flex items-center justify-center gap-1 text-brand-navy-800 dark:text-brand-gold-400">
                      <span>المجموع</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="py-3 px-3 sm:py-4 sm:px-6 text-center w-16 sm:w-24">ملف الفريق</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-brand-navy-900 text-xs text-slate-800 dark:text-slate-200">
                {paginatedRows.map((row) => {
                  const isTopThree = row.rank <= 3;
                  const initials = row.teamName.replace('فريق ', '').slice(0, 2);

                  return (
                    <tr 
                      key={row.teamId} 
                      className={`hover:bg-slate-50/50 dark:hover:bg-brand-navy-900/30 transition-colors ${
                        isTopThree ? 'font-bold' : ''
                      }`}
                    >
                      {/* Rank Badge */}
                      <td className="py-3 px-3 sm:py-4 sm:px-6 text-center">
                        <RankBadge rank={row.rank} />
                      </td>

                      {/* Team Name */}
                      <td className="py-3 px-3 sm:py-4 sm:px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-brand-navy-900 overflow-hidden flex items-center justify-center border border-slate-200 dark:border-brand-navy-800 font-extrabold text-[10px] text-brand-gold-500 shadow-sm shrink-0">
                            {row.logoUrl && !row.logoUrl.includes('default') ? (
                              <img src={row.logoUrl} alt={row.teamName} className="h-full w-full object-cover" />
                            ) : (
                              <span>{initials}</span>
                            )}
                          </div>
                          <span className="truncate">{row.teamName}</span>
                        </div>
                      </td>

                      {/* Category Scores */}
                      {standings.categories.map((cat) => {
                        const scoreObj = row.categoryScores.find((c) => c.categoryId === cat.id);
                        const scoreVal = scoreObj ? scoreObj.scoreValue : 0;
                        const scoreMax = scoreObj ? scoreObj.maxScore : cat.maxScore;
                        const isPerfect = scoreVal === scoreMax && scoreMax > 0;

                        return (
                          <td key={cat.id} className="py-3 px-2 sm:py-4 sm:px-3 text-center">
                            <span 
                              className={`px-2 py-1 rounded-md ${
                                isPerfect 
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 font-black' 
                                  : 'text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {scoreVal}
                            </span>
                          </td>
                        );
                      })}

                      {/* Total Score */}
                      <td className="py-3 px-3 sm:py-4 sm:px-6 text-center font-black text-sm text-brand-navy-700 dark:text-brand-gold-400 bg-brand-navy-50/10 dark:bg-brand-navy-900/20 border-r border-slate-200 dark:border-brand-navy-800">
                        {row.totalScore}
                      </td>

                      {/* View Profile Action */}
                      <td className="py-3 px-3 sm:py-4 sm:px-6 text-center">
                        <Link
                          to={`/team/${row.teamId}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:text-brand-navy-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-brand-gold-400 dark:hover:bg-brand-navy-900 transition-colors"
                          title="عرض التفاصيل والتحليلات"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white dark:bg-brand-navy-900 p-4 rounded-2xl border border-slate-200 dark:border-brand-navy-800 shadow-sm text-xs font-bold" dir="rtl">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="px-3.5 py-2 border border-slate-200 dark:border-brand-navy-800 rounded-lg hover:bg-slate-50 dark:hover:bg-brand-navy-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                السابق
              </button>
              <span className="text-slate-500 dark:text-slate-400">
                صفحة <span className="text-slate-800 dark:text-white font-extrabold">{currentPage}</span> من <span className="font-extrabold">{totalPages}</span>
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-3.5 py-2 border border-slate-200 dark:border-brand-navy-800 rounded-lg hover:bg-slate-50 dark:hover:bg-brand-navy-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                التالي
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState 
          title="لا يوجد فرق مسجلة بعد" 
          description="لم يتم إدراج أي فرق أو درجات تقييم للموسم المحدد بعد. يرجى مراجعة لوحة التحكم لتسجيل البيانات." 
        />
      )}

    </div>
  );
};
