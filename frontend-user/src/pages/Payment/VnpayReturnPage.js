import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { paymentService } from '../../services/paymentService';

const VnpayReturnPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const paramObj = {};
    for (const [key, value] of params.entries()) {
      paramObj[key] = value;
    }
    paymentService.paymentVNPAYReturn(paramObj)
      .then(res => {
        setResult(res);
      })
      .catch(() => {
        setResult({ status: 500, message: 'Có lỗi xảy ra khi xác thực thanh toán.' });
      })
      .finally(() => setLoading(false));
  }, [location.search]);

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!loading && result?.status === 200) {
      setShowModal(true);
    }
  }, [loading, result]);

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: 80 }}>Đang xác thực thanh toán...</div>;
  }

  return (
    <>
      {/* Modal for success */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '40px 32px', minWidth: 340, boxShadow: '0 4px 24px rgba(0,0,0,0.15)', textAlign: 'center', position: 'relative', animation: 'fadeIn 0.5s' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ animation: 'popV 0.7s cubic-bezier(.17,.67,.83,.67) both' }}>
                <circle cx="48" cy="48" r="48" fill="#4caf50"/>
                <path d="M28 50L43 65L68 40" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 style={{ color: '#4caf50', marginBottom: 12, fontSize: 28, fontWeight: 700 }}>Thanh toán thành công!</h2>
            <p style={{ fontSize: 16, marginBottom: 18 }}>{result.data || 'Vui lòng kiểm tra email để xem chi tiết đơn hàng'}</p>
            <button
              style={{ marginTop: 10, padding: '12px 32px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 500, cursor: 'pointer', fontSize: 18 }}
              onClick={() => { setShowModal(false); navigate('/orders'); }}
            >Quay về đơn hàng</button>
            <style>{`
              @keyframes popV {
                0% { transform: scale(0.5); opacity: 0; }
                60% { transform: scale(1.2); opacity: 1; }
                100% { transform: scale(1); }
              }
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
            `}</style>
          </div>
        </div>
      )}
      {/* Fallback for failure */}
      {!showModal && result?.status !== 200 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '40px 32px', minWidth: 340, boxShadow: '0 4px 24px rgba(0,0,0,0.15)', textAlign: 'center', position: 'relative', animation: 'fadeIn 0.5s' }}>
            <h2 style={{ color: '#d32f2f', marginBottom: 12, fontSize: 28, fontWeight: 700 }}>Thanh toán thất bại!</h2>
            <p style={{ fontSize: 16, marginBottom: 18 }}>{result?.message || 'Có lỗi xảy ra khi xác thực thanh toán.'}</p>
            <button
              style={{ marginTop: 10, padding: '12px 32px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 500, cursor: 'pointer', fontSize: 18 }}
              onClick={() => navigate('/')}
            >Quay về trang chủ</button>
            <style>{`
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
            `}</style>
          </div>
        </div>
      )}
    </>
  );
};

export default VnpayReturnPage;
