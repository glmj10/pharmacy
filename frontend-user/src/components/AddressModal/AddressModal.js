import React, { useState, useEffect } from 'react';
import './AddressModal.css'; // Sẽ tạo file CSS này sau
import { profileService } from '../../services/profileService';
import { toast } from 'react-toastify';

const AddressModal = ({ isOpen, onClose, onSelectAddress, currentSelectedAddressId, onAddressChange }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAddress, setCurrentAddress] = useState({
    id: null,
    fullName: '',
    phoneNumber: '',
    address: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchAddresses();
      setCurrentAddress({
        id: null,
        fullName: '',
        phoneNumber: '',
        address: ''
      });
      setIsEditing(false);
    }
  }, [isOpen]);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const response = await profileService.getUserProfiles();
      setAddresses(response.data); 
    } catch (error) {
      console.error('Không thể tải danh sách địa chỉ.');
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!currentAddress.fullName.trim() || !currentAddress.phoneNumber.trim() || !currentAddress.address.trim()) { // Sử dụng phoneNumber
      toast.warn('Vui lòng điền đầy đủ thông tin địa chỉ.');
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        console.log(await profileService.updateProfile(currentAddress.id, {
          fullName: currentAddress.fullName,
          phoneNumber: currentAddress.phoneNumber,
          address: currentAddress.address
        }))
        toast.success('Cập nhật địa chỉ thành công!');
      } else {
        await profileService.createProfile({
          fullName: currentAddress.fullName,
          phoneNumber: currentAddress.phoneNumber, 
          address: currentAddress.address
        });
        toast.success('Thêm địa chỉ mới thành công!');
      }
      fetchAddresses(); 
      onAddressChange(); 
      setCurrentAddress({
        id: null,
        fullName: '',
        phoneNumber: '', 
        address: ''
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving address:', error);
    } finally {
      setLoading(false);
    }
  };

 const handleEditClick = (address) => {
    setCurrentAddress({
      id: address.id,
      fullName: address.fullName,
      phoneNumber: address.phoneNumber, 
      address: address.address
    });
    setIsEditing(true);
  };

  const handleDeleteClick = async (addressId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      setLoading(true);
      try {
        await profileService.deleteProfile(addressId);
        toast.success('Xóa địa chỉ thành công!');
        fetchAddresses(); 
        onAddressChange(); 
        if (currentSelectedAddressId === addressId) {
          onSelectAddress(null); 
        }
      } catch (error) {
        console.error('Error deleting address:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSelect = (address) => {
    onSelectAddress(address);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="address-modal-overlay">
      <div className="address-modal-content">
        <button className="address-modal-close" onClick={onClose}>×</button>
        <h2>Quản lý Địa chỉ Giao hàng</h2>

        {loading && <div className="modal-loading">Đang tải...</div>}

        <div className="address-form-section">
          <h3>{isEditing ? 'Chỉnh sửa Địa chỉ' : 'Thêm Địa chỉ mới'}</h3>
          <form onSubmit={handleSaveAddress}>
            <div className="form-group">
              <label>Họ và tên:</label>
              <input
                type="text"
                name="fullName"
                value={currentAddress.fullName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Số điện thoại:</label>
              <input
                type="tel"
                name="phoneNumber" 
                value={currentAddress.phoneNumber}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Địa chỉ chi tiết:</label>
              <input
                type="text"
                name="address"
                value={currentAddress.address}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {isEditing ? 'Cập nhật' : 'Thêm mới'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setIsEditing(false);
                    setCurrentAddress({ id: null, fullName: '', phoneNumber: '', address: '' });
                  }}
                  disabled={loading}
                >
                  Hủy
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="address-list-section">
          <h3>Địa chỉ của bạn</h3>
          {addresses.length === 0 && !loading ? (
            <p className="no-address-message">Bạn chưa có địa chỉ nào được lưu.</p>
          ) : (
            <ul className="address-list">
              {addresses.map(address => (
                <li key={address.id} className={`address-item ${currentSelectedAddressId === address.id ? 'selected' : ''}`}>
                  <div>
                    <strong>{address.fullName}</strong> ({address.phoneNumber})
                    <p>{address.address}</p>
                  </div>
                  <div className="item-actions">
                    <button
                      className="btn-select"
                      onClick={() => handleSelect(address)}
                      disabled={currentSelectedAddressId === address.id}
                    >
                      {currentSelectedAddressId === address.id ? 'Đang chọn' : 'Chọn'}
                    </button>
                    <button className="btn-edit" onClick={() => handleEditClick(address)}>Sửa</button>
                    <button className="btn-delete" onClick={() => handleDeleteClick(address.id)}>Xóa</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressModal;