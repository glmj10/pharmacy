import React, { useState } from 'react';
import { CButton, CCard, CCardBody, CCardHeader, CCol, CRow, CAlert } from '@coreui/react';
import { useToast } from '../../hooks/useToast';
import { globalLogoutHandler } from '../../utils/globalLogout';
import { authService } from '../../services';
import { tokenUtils } from '../../utils/token';
import axios from 'axios';

const ToastDemo = () => {
  const toast = useToast();
  const [testResults, setTestResults] = useState([]);

  const addTestResult = (test, success, message, data = null) => {
    setTestResults(prev => [...prev, {
      id: Date.now(),
      test,
      success,
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const testTokenInfo = () => {
    const token = tokenUtils.getAccessToken();
    if (token) {
      const decoded = tokenUtils.decodeToken(token);
      addTestResult(
        'Token Info',
        true,
        'Token information retrieved',
        {
          expired: tokenUtils.isTokenExpired(token),
          userId: decoded?.id,
          email: decoded?.email,
          exp: decoded?.exp ? new Date(decoded.exp * 1000).toLocaleString() : 'N/A'
        }
      );
      toast.success('Token info logged - check results below');
    } else {
      addTestResult('Token Info', false, 'No token found');
      toast.error('No token found');
    }
  };

  const testRefreshToken = async () => {
    try {
      const currentToken = tokenUtils.getAccessToken();
      if (!currentToken) {
        addTestResult('Refresh Token', false, 'No token to refresh');
        toast.error('No token to refresh');
        return;
      }

      const response = await authService.refreshToken(currentToken);
      
      // Check if response is successful based on backend format
      if (response.status === 200 && response.data?.token) {
        addTestResult(
          'Refresh Token',
          true,
          'Token refreshed successfully',
          { 
            backendMessage: response.message,
            newTokenPrefix: response.data.token.substring(0, 50) + '...',
            fullResponse: response
          }
        );
        toast.success('Token refreshed successfully!');
      } else {
        addTestResult('Refresh Token', false, 'Invalid response format', response);
        toast.error('Invalid refresh response');
      }
    } catch (error) {
      addTestResult(
        'Refresh Token',
        false,
        error.message,
        { 
          status: error.response?.status, 
          backendMessage: error.response?.data?.message 
        }
      );
      toast.error(`Refresh failed: ${error.message}`);
    }
  };

  const testForce401 = async () => {
    try {
      // Make request with invalid token to trigger 401
      const invalidToken = 'invalid-token-123';
      const originalToken = tokenUtils.getAccessToken();
      
      // Temporarily set invalid token
      tokenUtils.setTokens(invalidToken);
      
      addTestResult('Force 401', true, 'Sending request with invalid token...');
      
      // This should trigger 401 and automatic refresh
      await axios.get('/api/v1/users', {
        headers: { Authorization: `Bearer ${invalidToken}` }
      });
      
    } catch (error) {
      addTestResult(
        'Force 401',
        false,
        'Expected 401 error occurred',
        { status: error.response?.status }
      );
      toast.info('401 error triggered - should attempt token refresh');
    }
  };

  const testSessionExpired = () => {
    // Simulate session expired
    globalLogoutHandler.triggerLogout('session_expired');
  };

  const testTokenRefreshFailed = () => {
    // Simulate token refresh failed
    globalLogoutHandler.triggerLogout('token_refresh_failed');
  };

  const testUnauthorized = () => {
    // Simulate unauthorized access
    globalLogoutHandler.triggerLogout('unauthorized');
  };

  const clearResults = () => {
    setTestResults([]);
    toast.info('Test results cleared');
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Test Token Refresh & Toast Notifications</strong>
          </CCardHeader>
          <CCardBody>
            <h6>Token Management Tests:</h6>
            <div className="d-grid gap-2 d-md-flex mb-3">
              <CButton
                color="primary"
                onClick={testTokenInfo}
              >
                Check Token Info
              </CButton>
              
              <CButton
                color="success"
                onClick={testRefreshToken}
              >
                Test Refresh Token
              </CButton>
              
              <CButton
                color="warning"
                onClick={testForce401}
              >
                Force 401 Error
              </CButton>
              
              <CButton
                color="secondary"
                onClick={clearResults}
              >
                Clear Results
              </CButton>
            </div>

            <hr />
            
            <h6>Toast Notifications:</h6>
            <div className="d-grid gap-2 d-md-flex mb-3">
              <CButton
                color="success"
                onClick={() => toast.success('Thao tác thành công!')}
              >
                Success Toast
              </CButton>
              
              <CButton
                color="danger"
                onClick={() => toast.error('Có lỗi xảy ra!')}
              >
                Error Toast
              </CButton>
              
              <CButton
                color="warning"
                onClick={() => toast.warning('Cảnh báo!')}
              >
                Warning Toast
              </CButton>
              
              <CButton
                color="info"
                onClick={() => toast.info('Thông tin!')}
              >
                Info Toast
              </CButton>
            </div>
            
            <hr />
            
            <h6>Logout Scenarios (Warning: Will log you out!):</h6>
            <div className="d-grid gap-2 d-md-flex mb-3">
              <CButton
                color="dark"
                onClick={testSessionExpired}
              >
                Test Session Expired
              </CButton>
              
              <CButton
                color="dark"
                onClick={testTokenRefreshFailed}
              >
                Test Token Refresh Failed
              </CButton>
              
              <CButton
                color="dark"
                onClick={testUnauthorized}
              >
                Test Unauthorized
              </CButton>
            </div>
            
            <div className="mt-3">
              <small className="text-muted">
                <strong>Lưu ý:</strong> Các test "Logout Scenarios" sẽ đăng xuất bạn khỏi hệ thống và chuyển về trang đăng nhập.
              </small>
            </div>

            {/* Test Results */}
            {testResults.length > 0 && (
              <>
                <hr />
                <h6>Test Results:</h6>
                {testResults.map((result) => (
                  <CAlert 
                    key={result.id} 
                    color={result.success ? 'success' : 'danger'}
                    className="mb-2"
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <strong>[{result.timestamp}] {result.test}</strong>: {result.message}
                        {result.data && (
                          <details className="mt-2">
                            <summary className="text-muted small">View Details</summary>
                            <pre className="mt-2 p-2 bg-light border rounded small">
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </CAlert>
                ))}
              </>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default ToastDemo;
