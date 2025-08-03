
import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const renderPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;
        const halfPages = Math.floor(maxPagesToShow / 2);
        
        let startPage = Math.max(1, currentPage - halfPages);
        let endPage = Math.min(totalPages, currentPage + halfPages);

        if (currentPage <= halfPages) {
            endPage = Math.min(totalPages, maxPagesToShow);
        }
        if (currentPage + halfPages >= totalPages) {
            startPage = Math.max(1, totalPages - maxPagesToShow + 1);
        }

        if (startPage > 1) {
            pages.push(<button key={1} onClick={() => onPageChange(1)} className="px-3 py-1 mx-1 rounded-md text-slate-300 bg-slate-700/50 hover:bg-slate-600/50 transition-colors text-xs sm:text-sm">1</button>);
            if (startPage > 2) {
                pages.push(<span key="start-ellipsis" className="px-3 py-1 mx-1 text-slate-400">...</span>);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => onPageChange(i)}
                    className={`px-3 py-1 mx-1 rounded-md transition-colors text-xs sm:text-sm ${
                        currentPage === i ? 'bg-sky-600 text-white font-bold' : 'text-slate-300 bg-slate-700/50 hover:bg-slate-600/50'
                    }`}
                >
                    {i}
                </button>
            );
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pages.push(<span key="end-ellipsis" className="px-3 py-1 mx-1 text-slate-400">...</span>);
            }
            pages.push(<button key={totalPages} onClick={() => onPageChange(totalPages)} className="px-3 py-1 mx-1 rounded-md text-slate-300 bg-slate-700/50 hover:bg-slate-600/50 transition-colors text-xs sm:text-sm">{totalPages}</button>);
        }


        return pages;
    };


    return (
        <div className="flex justify-center items-center mt-6 py-2 flex-shrink-0">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-md text-slate-300 bg-slate-700/80 hover:bg-slate-700 disabled:bg-slate-800/50 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors text-sm"
            >
                Back
            </button>

            <div className="mx-2 flex">
                {renderPageNumbers()}
            </div>

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-md text-slate-300 bg-slate-700/80 hover:bg-slate-700 disabled:bg-slate-800/50 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors text-sm"
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;
