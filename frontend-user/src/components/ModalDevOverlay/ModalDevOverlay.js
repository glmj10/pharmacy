import './ModalDevOverlay.css';

const ModalDevOverlay = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="modal-dev-overlay" onClick={onClose}>
      <div className="modal-dev" onClick={e => e.stopPropagation()}>
        <h4>Chức năng đang được phát triển</h4>
        <p>Vui lòng quay lại sau!</p>
        <button className="btn btn-secondary" onClick={onClose}>Đóng</button>
      </div>
    </div>
  );
};

export default ModalDevOverlay;
