import './NotificationModal.css';

const ModalNotification = ({ isOpen, onClose, title = 'Thông báo', message = 'Chức năng đang được phát triển. Vui lòng quay lại sau.' }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-notification-backdrop" onClick={onClose}>
      <div className="modal-notification" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        <button onClick={onClose}>Đóng</button>
      </div>
    </div>
  );
};

export default ModalNotification;
