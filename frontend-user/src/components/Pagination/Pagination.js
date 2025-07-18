import React from 'react';
import './Pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  // Giới hạn số lượng nút trang hiển thị để tránh tràn màn hình
  const maxPageNumbers = 5; 
  let startPage = Math.max(1, currentPage - Math.floor(maxPageNumbers / 2));
  let endPage = Math.min(totalPages, startPage + maxPageNumbers - 1);

  if (endPage - startPage + 1 < maxPageNumbers) {
    startPage = Math.max(1, endPage - maxPageNumbers + 1);
  }


  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="pagination">
      <button 
        onClick={handlePrev} 
        disabled={currentPage === 1}
        className="pagination-btn"
      >
        Trước
      </button>
      <div className="pagination-pages">
        {startPage > 1 && (
            <>
                <button className="pagination-page-number" onClick={() => onPageChange(1)}>1</button>
                {startPage > 2 && <span className="pagination-ellipsis">...</span>}
            </>
        )}
        {pages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`pagination-page-number ${currentPage === page ? 'active' : ''}`}
          >
            {page}
          </button>
        ))}
        {endPage < totalPages && (
            <>
                {endPage < totalPages - 1 && <span className="pagination-ellipsis">...</span>}
                <button className="pagination-page-number" onClick={() => onPageChange(totalPages)}>{totalPages}</button>
            </>
        )}
      </div>
      <button 
        onClick={handleNext} 
        disabled={currentPage === totalPages}
        className="pagination-btn"
      >
        Sau
      </button>
    </div>
  );
};

export default Pagination;