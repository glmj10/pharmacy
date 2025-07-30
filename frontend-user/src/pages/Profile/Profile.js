import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { profileService } from '../../services/profileService';
import { userService } from '../../services/userService';
import { ProfileTransform, UserTransform, ErrorTransform } from '../../utils/dataTransform';
import { ApiUtils } from '../../utils/apiUtils';
import { toast } from 'react-toastify';
import { 
  FaUser, 
  FaEdit, 
  FaTrash, 
  FaPlus, 
  FaSave, 
  FaTimes, 
  FaCamera,
  FaLock,
  FaMapMarkerAlt,
  FaPhone
} from 'react-icons/fa';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [profilePicLoading, setProfilePicLoading] = useState(false);
  const fileInputRef = useRef(null);


  const [personalInfo, setPersonalInfo] = useState({
    username: '',
    email: '',
    profilePic: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [profiles, setProfiles] = useState([]);
  const [editingProfile, setEditingProfile] = useState(null);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    phoneNumber: '',
    address: ''
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [setPasswordErrors] = useState({});
  const [setProfileErrors] = useState({});

  const clearFieldError = (fieldName, errorType = 'validationErrors') => {
    const setErrorState = {
      validationErrors: setValidationErrors,
      passwordErrors: setPasswordErrors,
      profileErrors: setProfileErrors
    }[errorType];

    if (setErrorState) {
      setErrorState(prev => ({
        ...prev,
        [fieldName]: undefined
      }));
    }
  };

  useEffect(() => {
    if (user) {
      setPersonalInfo({
        username: user.username || '',
        email: user.email || '',
        profilePic: user.profilePic || ''
      });
    }
  }, [user]);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const response = await profileService.getUserProfiles();
      if (response?.data) {
        setProfiles(response.data);
      } else if (Array.isArray(response)) {
        setProfiles(response);
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdatePersonalInfo = async () => {
    if (!personalInfo.username || personalInfo.username.trim() === '') {
      toast.error('Tên đăng nhập không được để trống');
      return;
    }

    if (personalInfo.username.length < 3) {
      toast.error('Tên đăng nhập phải có ít nhất 3 ký tự');
      return;
    }

    try {
      setLoading(true);
      const response = await userService.updateUser({ 
        username: personalInfo.username.trim(),
        email: personalInfo.email
      });
      
      if (response?.data) {
        await updateUser(response.data);
        toast.success('Cập nhật thông tin thành công!');
      }
    } catch (error) {
      console.error('Error updating personal info:', error);
      
      const fieldErrors = ErrorTransform.transformValidationErrors(error);
      
      if (Object.keys(fieldErrors).length > 0) {
        setValidationErrors(fieldErrors);
        toast.error('Vui lòng kiểm tra lại thông tin đã nhập');
      } else {
        const errorMessage = ErrorTransform.transformErrorMessage(error);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle profile picture upload
  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File không được lớn hơn 5MB');
      return;
    }

    try {
      setProfilePicLoading(true);
      
      const response = await userService.updateProfilePicture(file);
      
      // Backend returns ApiResponse<UserResponse>
      if (response?.data) {
        setPersonalInfo(prev => ({
          ...prev,
          profilePic: response.data.profilePic
        }));
        
        await updateUser({
          ...user,
          profilePic: response.data.profilePic
        });
        
        toast.success('Cập nhật ảnh đại diện thành công!');
      }
    } catch (error) {
      // Enhanced error handling
      const errorMessage = error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật ảnh đại diện';
      toast.error(errorMessage);
      console.error('Error updating profile picture:', error);
    } finally {
      setProfilePicLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdatePassword = async () => {
    const validation = UserTransform.validatePasswordForm(passwordData);
    
    if (!validation.isValid) {
      validation.errors.forEach(error => toast.error(error));
      return;
    }

    try {
      setLoading(true);
      const response = await userService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      toast.success('Đổi mật khẩu thành công!');
    } catch (error) {
      console.error('Error changing password:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle profile form
  const handleProfileFormChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddProfile = () => {
    setProfileForm({
      fullName: '',
      phoneNumber: '',
      address: ''
    });
    setEditingProfile(null);
    setShowProfileForm(true);
  };

  const handleEditProfile = (profile) => {
    setProfileForm({
      fullName: profile.fullName || '',
      phoneNumber: profile.phoneNumber || '',
      address: profile.address || ''
    });
    setEditingProfile(profile);
    setShowProfileForm(true);
  };

  const handleSaveProfile = async () => {
    // Use validation from utils
    const validation = ProfileTransform.validateProfileForm(profileForm);
    
    if (!validation.isValid) {
      validation.errors.forEach(error => console.error(error));
      return;
    }

    try {
      setLoading(true);
      
      if (editingProfile) {
        // Update existing profile
        const response = await profileService.updateProfile(editingProfile.id, profileForm);
        if (response?.data || response?.status === 200) {
          toast.success('Cập nhật địa chỉ thành công!');
        }
      } else {
        // Create new profile
        const response = await profileService.createProfile(profileForm);
        if (response?.data || response?.status === 201) {
          toast.success('Thêm địa chỉ mới thành công!');
        }
      }
      
      await fetchProfiles();
      setShowProfileForm(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfile = async (profileId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await profileService.deleteProfile(profileId);
      // Backend returns ApiResponse<Void> với status 200
      if (response?.status === 200 || response) {
        await fetchProfiles();
        toast.success('Xóa địa chỉ thành công!');
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Thông tin cá nhân', icon: FaUser },
    { id: 'addresses', label: 'Địa chỉ giao hàng', icon: FaMapMarkerAlt },
    { id: 'password', label: 'Đổi mật khẩu', icon: FaLock }
  ];

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <h1>Tài khoản của tôi</h1>
          <p>Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
        </div>

        <div className="profile-content">
          {/* Sidebar */}
          <div className="profile-sidebar">
            <div className="user-avatar">
              <div className="avatar-container">
                <img 
                  src={personalInfo.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(personalInfo.username || 'User')}&background=667eea&color=fff&size=120`} 
                  alt="Avatar"
                  className="avatar-img"
                />
                <button 
                  className="avatar-edit-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={profilePicLoading}
                >
                  <FaCamera />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePicChange}
                  style={{ display: 'none' }}
                />
              </div>
              <div className="user-info">
                <h3>{personalInfo.username || 'Người dùng'}</h3>
                <p>{personalInfo.email}</p>
              </div>
            </div>

            <nav className="profile-nav">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <tab.icon />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="profile-main">
            {activeTab === 'personal' && (
              <div className="tab-content">
                <div className="tab-header">
                  <h2>Thông tin cá nhân</h2>
                  <p>Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
                </div>

                <div className="form-group">
                  <label>Tên đăng nhập</label>
                  <input
                    type="text"
                    name="username"
                    value={personalInfo.username}
                    onChange={(e) => {
                      handlePersonalInfoChange(e);
                      clearFieldError('username');
                    }}
                    placeholder="Nhập tên đăng nhập"
                    minLength="3"
                    className={ErrorTransform.hasFieldError(validationErrors, 'username') ? 'error' : ''}
                    required
                  />
                  {ErrorTransform.hasFieldError(validationErrors, 'username') ? (
                    <div className="error-message">
                      {ErrorTransform.getFirstFieldError(validationErrors, 'username')}
                    </div>
                  ) : (
                    <small>Tên đăng nhập phải có ít nhất 3 ký tự</small>
                  )}
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={personalInfo.email}
                    disabled
                    className="disabled"
                  />
                  <small>Email không thể thay đổi</small>
                </div>

                <button 
                  className="btn btn-primary"
                  onClick={handleUpdatePersonalInfo}
                  disabled={loading}
                >
                  {loading ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
                </button>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="tab-content">
                <div className="tab-header">
                  <h2>Địa chỉ giao hàng</h2>
                  <button 
                    className="btn btn-primary"
                    onClick={handleAddProfile}
                  >
                    <FaPlus /> Thêm địa chỉ mới
                  </button>
                </div>

                {showProfileForm && (
                  <div className="profile-form">
                    <h3>{editingProfile ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}</h3>
                    
                    <div className="form-group">
                      <label>Họ và tên *</label>
                      <input
                        type="text"
                        name="fullName"
                        value={profileForm.fullName}
                        onChange={handleProfileFormChange}
                        placeholder="Nhập họ và tên"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Số điện thoại *</label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={profileForm.phoneNumber}
                        onChange={handleProfileFormChange}
                        placeholder="Nhập số điện thoại (10-15 số)"
                        pattern="[0-9+\-\s\(\)]{10,15}"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Địa chỉ *</label>
                      <textarea
                        name="address"
                        value={profileForm.address}
                        onChange={handleProfileFormChange}
                        placeholder="Nhập địa chỉ chi tiết"
                        rows="3"
                        required
                      />
                    </div>

                    <div className="form-actions">
                      <button 
                        className="btn btn-primary"
                        onClick={handleSaveProfile}
                        disabled={loading}
                      >
                        <FaSave /> {loading ? 'Đang lưu...' : 'Lưu'}
                      </button>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => setShowProfileForm(false)}
                      >
                        <FaTimes /> Hủy
                      </button>
                    </div>
                  </div>
                )}

                <div className="profiles-list">
                  {profiles.length === 0 ? (
                    <div className="empty-state">
                      <FaMapMarkerAlt />
                      <h3>Chưa có địa chỉ giao hàng</h3>
                      <p>Thêm địa chỉ giao hàng để dễ dàng đặt hàng</p>
                    </div>
                  ) : (
                    profiles.map(profile => (
                      <div key={profile.id} className="profile-card">
                        <div className="profile-info">
                          <h4>{profile.fullName}</h4>
                          <p><FaPhone /> {profile.phoneNumber}</p>
                          <p><FaMapMarkerAlt /> {profile.address}</p>
                        </div>
                        <div className="profile-actions">
                          <button 
                            className="btn btn-outline"
                            onClick={() => handleEditProfile(profile)}
                          >
                            <FaEdit /> Sửa
                          </button>
                          <button 
                            className="btn btn-danger"
                            onClick={() => handleDeleteProfile(profile.id)}
                          >
                            <FaTrash /> Xóa
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'password' && (
              <div className="tab-content">
                <div className="tab-header">
                  <h2>Đổi mật khẩu</h2>
                  <p>Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác</p>
                </div>

                <div className="form-group">
                  <label>Mật khẩu hiện tại *</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Nhập mật khẩu hiện tại"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Mật khẩu mới *</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                    minLength="6"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Xác nhận mật khẩu mới *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Nhập lại mật khẩu mới"
                    minLength="6"
                    required
                  />
                </div>

                <button 
                  className="btn btn-primary"
                  onClick={handleUpdatePassword}
                  disabled={loading}
                >
                  {loading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
