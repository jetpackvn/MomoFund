// Format tiền VNĐ
export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('vi-VN') + ' ₫';
};

// Format ngày giờ
export const formatDate = (date: any): string => {
  if (!date) return '';
  const d = date?.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const formatDateTime = (date: any): string => {
  if (!date) return '';
  const d = date?.toDate ? date.toDate() : new Date(date);
  return d.toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

// Format thời gian tương đối (vd: "2 giờ trước")
export const formatRelativeTime = (date: any): string => {
  if (!date) return '';
  const d = date?.toDate ? date.toDate() : new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return formatDate(date);
};

// Tạo mã quỹ ngẫu nhiên 6 ký tự
export const generateFundCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Validate email
export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Validate mật khẩu — trả về object để hiển thị lỗi chi tiết
export interface PasswordValidation {
  valid: boolean;
  minLength: boolean;    // ít nhất 8 ký tự
  hasUppercase: boolean; // ít nhất 1 chữ hoa
  hasNumber: boolean;    // ít nhất 1 chữ số
}

export const validatePassword = (password: string): PasswordValidation => {
  const minLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return { valid: minLength && hasUppercase && hasNumber, minLength, hasUppercase, hasNumber };
};

// Lấy chữ cái đầu để làm avatar
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(w => w.charAt(0))
    .slice(-2)
    .join('')
    .toUpperCase();
};

// Parse lỗi Firebase Auth sang tiếng Việt
export const parseFirebaseError = (error: any): string => {
  const code = error?.code || '';
  const map: Record<string, string> = {
    'auth/email-already-in-use': 'Email này đã được đăng ký cho tài khoản khác',
    'auth/invalid-email': 'Địa chỉ email không hợp lệ',
    'auth/weak-password': 'Mật khẩu quá yếu',
    'auth/user-not-found': 'Không tìm thấy tài khoản với email này',
    'auth/wrong-password': 'Mật khẩu không đúng',
    'auth/invalid-credential': 'Email hoặc mật khẩu không đúng',
    'auth/too-many-requests': 'Quá nhiều lần thử sai, vui lòng thử lại sau',
    'auth/network-request-failed': 'Lỗi kết nối mạng, kiểm tra internet và thử lại',
    'auth/user-disabled': 'Tài khoản đã bị vô hiệu hoá',
  };
  return map[code] || error?.message || 'Đã có lỗi xảy ra';
};
