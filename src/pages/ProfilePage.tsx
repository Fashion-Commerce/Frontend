import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Stack,
  Input,
  Button,
  Spinner,
  HStack,
  Badge,
} from "@chakra-ui/react";
import { toast } from "react-toastify";
import { useAuthStore } from "../stores/authStore";
import { authApi, User } from "../api/auth.api";
import AddressManagement from "../components/AddressManagement";

const ProfilePage: React.FC = () => {
  const { user: authUser } = useAuthStore();
  const updateAuthUser = useAuthStore((state) => state.user);
  const setAuthUser = useAuthStore.setState;
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Track if fields are modified
  const [isProfileModified, setIsProfileModified] = useState(false);

  // Form states
  const [fullname, setFullname] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (authUser?.user_id) {
      loadUserDetails();
    }
  }, [authUser?.user_id]);

  useEffect(() => {
    if (userDetails) {
      setFullname(userDetails.fullname || "");
      setPhone(userDetails.phone || "");
    }
  }, [userDetails]);

  // Check if profile data has changed
  useEffect(() => {
    if (userDetails) {
      const changed =
        fullname !== (userDetails.fullname || "") ||
        phone !== (userDetails.phone || "");
      setIsProfileModified(changed);
    }
  }, [fullname, phone, userDetails]);

  const loadUserDetails = async () => {
    if (!authUser?.user_id) return;

    try {
      setIsLoading(true);
      const response = await authApi.getUserDetails(authUser.user_id);
      setUserDetails(response.info.user);
    } catch (error: any) {
      toast.error(error.message || "Không thể tải thông tin người dùng");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    if (!authUser?.user_id || !fullname.trim()) return;

    try {
      setIsUpdatingProfile(true);
      const response = await authApi.updateProfile(authUser.user_id, {
        fullname: fullname.trim(),
        phone: phone.trim(),
      });
      if (response.info.success) {
        toast.success("Cập nhật thành công!");
        await loadUserDetails();
        setIsProfileModified(false);

        // Update authStore to reflect changes in header
        useAuthStore.setState({
          user: {
            ...authUser,
            fullname: fullname.trim(),
            phone: phone.trim(),
          },
        });
      }
    } catch (error: any) {
      toast.error(error.message || "Cập nhật thất bại");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleCancelProfileEdit = () => {
    setFullname(userDetails?.fullname || "");
    setPhone(userDetails?.phone || "");
    setIsProfileModified(false);
  };

  const handlePasswordChange = async () => {
    if (!authUser?.user_id) return;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      setIsUpdatingPassword(true);
      const response = await authApi.updatePassword(authUser.user_id, {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      if (response.info.success) {
        toast.success("Đổi mật khẩu thành công!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error: any) {
      toast.error(error.message || "Đổi mật khẩu thất bại");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!authUser) {
    return (
      <div className="p-8 ml-16">
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow p-8 text-center">
          <h2 className="text-xl font-semibold">
            Vui lòng đăng nhập để xem thông tin
          </h2>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8 ml-16">
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow p-8 text-center">
          <Spinner size="xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 ml-0 sm:ml-8 md:ml-16">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <h1
            className="text-2xl sm:text-3xl font-bold mb-2"
            style={{ fontFamily: "Montserrat, sans-serif", color: "#1A2A4E" }}
          >
            Tài khoản của tôi
          </h1>
          <p className="text-sm sm:text-base" style={{ color: "#666666" }}>
            Quản lý thông tin cá nhân và bảo mật
          </p>
        </div>

        {/* Thông tin cơ bản */}
        <div
          className="bg-white rounded-xl shadow-sm"
          style={{ border: "1px solid #E9ECEF" }}
        >
          <div
            className="px-4 sm:px-6 py-3 sm:py-4"
            style={{ borderBottom: "2px solid #C89B6D" }}
          >
            <h2
              className="text-base sm:text-lg font-semibold"
              style={{ fontFamily: "Montserrat, sans-serif", color: "#1A2A4E" }}
            >
              Thông tin cá nhân
            </h2>
          </div>

          <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
            {/* Họ tên - EDITABLE */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-start">
              <label
                htmlFor="fullname-input"
                className="text-xs sm:text-sm font-medium pt-0 sm:pt-2"
                style={{ color: "#333333" }}
              >
                Họ và tên
              </label>
              <div className="col-span-1 sm:col-span-2 relative">
                <Input
                  id="fullname-input"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  className="w-full"
                  size={{ base: "sm", sm: "md" }}
                  px={{ base: 3, sm: 4 }}
                  py={{ base: 2, sm: 2.5 }}
                  fontSize={{ base: "sm", sm: "md" }}
                  placeholder="Nhập họ và tên"
                  style={{ borderColor: "#E9ECEF" }}
                  _hover={{ borderColor: "#C89B6D" }}
                  _focus={{
                    borderColor: "#C89B6D",
                    boxShadow: "0 0 0 1px #C89B6D",
                  }}
                />
              </div>
            </div>

            {/* Email - READ ONLY */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-start">
              <label
                className="text-xs sm:text-sm font-medium pt-0 sm:pt-2"
                style={{ color: "#333333" }}
              >
                Email
              </label>
              <div className="col-span-1 sm:col-span-2">
                <div
                  className="py-2 sm:py-2.5 px-3 sm:px-4 rounded-md text-sm sm:text-base break-all"
                  style={{
                    backgroundColor: "#F4F6F8",
                    border: "1px solid #E9ECEF",
                    color: "#333333",
                  }}
                >
                  {userDetails?.email}
                </div>
                <p className="text-xs mt-1 italic" style={{ color: "#C89B6D" }}>
                  Email không được phép thay đổi
                </p>
              </div>
            </div>

            {/* Số điện thoại - EDITABLE */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-start">
              <label
                htmlFor="phone-input"
                className="text-xs sm:text-sm font-medium pt-0 sm:pt-2"
                style={{ color: "#333333" }}
              >
                Số điện thoại
              </label>
              <div className="col-span-1 sm:col-span-2 relative">
                <Input
                  id="phone-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Chưa cập nhật"
                  className="w-full"
                  size={{ base: "sm", sm: "md" }}
                  px={{ base: 3, sm: 4 }}
                  py={{ base: 2, sm: 2.5 }}
                  fontSize={{ base: "sm", sm: "md" }}
                  style={{ borderColor: "#E9ECEF" }}
                  _hover={{ borderColor: "#C89B6D" }}
                  _focus={{
                    borderColor: "#C89B6D",
                    boxShadow: "0 0 0 1px #C89B6D",
                  }}
                />
              </div>
            </div>

            {/* Loại tài khoản - READ ONLY */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-start">
              <label
                className="text-xs sm:text-sm font-medium pt-0 sm:pt-2"
                style={{ color: "#333333" }}
              >
                Loại tài khoản
              </label>
              <div className="col-span-1 sm:col-span-2 pt-0 sm:pt-2">
                <Badge
                  size="sm"
                  px={{ base: 2, sm: 3 }}
                  py={{ base: 0.5, sm: 1 }}
                  fontSize={{ base: "xs", sm: "sm" }}
                  className="rounded-md"
                  style={{
                    backgroundColor:
                      userDetails?.user_type === "admin"
                        ? "#C89B6D"
                        : "#1A2A4E",
                    color: "white",
                  }}
                >
                  {userDetails?.user_type === "admin" ? "Admin" : "Khách hàng"}
                </Badge>
              </div>
            </div>

            {/* Trạng thái - READ ONLY with dynamic color */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-start">
              <label
                className="text-xs sm:text-sm font-medium pt-0 sm:pt-2"
                style={{ color: "#333333" }}
              >
                Trạng thái
              </label>
              <div className="col-span-1 sm:col-span-2 pt-0 sm:pt-2">
                {userDetails?.is_active ? (
                  <span className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-md text-xs sm:text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 sm:mr-2 animate-pulse"></span>
                    Hoạt động
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-md text-xs sm:text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                    <span className="w-2 h-2 bg-gray-500 rounded-full mr-1.5 sm:mr-2"></span>
                    Không hoạt động
                  </span>
                )}
              </div>
            </div>

            {/* Ngày tạo - READ ONLY */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-start">
              <label
                className="text-xs sm:text-sm font-medium pt-0 sm:pt-2"
                style={{ color: "#333333" }}
              >
                Ngày tạo
              </label>
              <div
                className="col-span-1 sm:col-span-2 py-0 sm:py-2 text-sm sm:text-base"
                style={{ color: "#333333" }}
              >
                {userDetails && formatDate(userDetails.created_at)}
              </div>
            </div>

            {/* Cập nhật - READ ONLY */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-start">
              <label
                className="text-xs sm:text-sm font-medium pt-0 sm:pt-2"
                style={{ color: "#333333" }}
              >
                Cập nhật
              </label>
              <div
                className="col-span-1 sm:col-span-2 py-0 sm:py-2 text-sm sm:text-base"
                style={{ color: "#333333" }}
              >
                {userDetails && formatDate(userDetails.updated_at)}
              </div>
            </div>

            {/* Save/Cancel buttons - only show when modified */}
            {isProfileModified && (
              <div
                className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-start pt-3 sm:pt-4"
                style={{ borderTop: "1px solid #E9ECEF" }}
              >
                <div className="hidden sm:block"></div>
                <div className="col-span-1 sm:col-span-2">
                  <HStack gap={{ base: 2, sm: 3 }} flexWrap="wrap">
                    <Button
                      onClick={handleProfileUpdate}
                      loading={isUpdatingProfile}
                      disabled={!fullname.trim() || isUpdatingProfile}
                      className="text-white font-medium rounded-lg transition-all shadow-sm hover:shadow-md"
                      size={{ base: "sm", sm: "md" }}
                      px={{ base: 4, sm: 6 }}
                      py={{ base: 1.5, sm: 2 }}
                      fontSize={{ base: "sm", sm: "md" }}
                      style={{
                        backgroundColor: "#C89B6D",
                        fontFamily: "Montserrat, sans-serif",
                      }}
                      _hover={{ backgroundColor: "#B88A5D" }}
                    >
                      Lưu thay đổi
                    </Button>
                    <Button
                      onClick={handleCancelProfileEdit}
                      disabled={isUpdatingProfile}
                      className="bg-white font-medium rounded-lg transition-all"
                      size={{ base: "sm", sm: "md" }}
                      px={{ base: 4, sm: 6 }}
                      py={{ base: 1.5, sm: 2 }}
                      fontSize={{ base: "sm", sm: "md" }}
                      style={{ border: "1px solid #E9ECEF", color: "#333333" }}
                      _hover={{ backgroundColor: "#F4F6F8" }}
                    >
                      Hủy
                    </Button>
                  </HStack>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Đổi mật khẩu */}
        <div
          className="bg-white rounded-xl shadow-sm"
          style={{ border: "1px solid #E9ECEF" }}
        >
          <div
            className="px-4 sm:px-6 py-3 sm:py-4"
            style={{ borderBottom: "2px solid #C89B6D" }}
          >
            <h2
              className="text-base sm:text-lg font-semibold"
              style={{ fontFamily: "Montserrat, sans-serif", color: "#1A2A4E" }}
            >
              Đổi mật khẩu
            </h2>
          </div>

          <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
            {/* Mật khẩu hiện tại */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-start">
              <label
                htmlFor="current-password"
                className="text-xs sm:text-sm font-medium pt-0 sm:pt-2"
                style={{ color: "#333333" }}
              >
                Mật khẩu hiện tại
              </label>
              <div className="col-span-1 sm:col-span-2 relative">
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Nhập mật khẩu hiện tại"
                  size={{ base: "sm", sm: "md" }}
                  px={{ base: 3, sm: 4 }}
                  py={{ base: 2, sm: 2.5 }}
                  fontSize={{ base: "sm", sm: "md" }}
                  style={{ borderColor: "#E9ECEF" }}
                  _hover={{ borderColor: "#C89B6D" }}
                  _focus={{
                    borderColor: "#C89B6D",
                    boxShadow: "0 0 0 1px #C89B6D",
                  }}
                />
              </div>
            </div>

            {/* Mật khẩu mới */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-start">
              <label
                htmlFor="new-password"
                className="text-xs sm:text-sm font-medium pt-0 sm:pt-2"
                style={{ color: "#333333" }}
              >
                Mật khẩu mới
              </label>
              <div className="col-span-1 sm:col-span-2 relative">
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  size={{ base: "sm", sm: "md" }}
                  px={{ base: 3, sm: 4 }}
                  py={{ base: 2, sm: 2.5 }}
                  fontSize={{ base: "sm", sm: "md" }}
                  style={{ borderColor: "#E9ECEF" }}
                  _hover={{ borderColor: "#C89B6D" }}
                  _focus={{
                    borderColor: "#C89B6D",
                    boxShadow: "0 0 0 1px #C89B6D",
                  }}
                />
              </div>
            </div>

            {/* Xác nhận mật khẩu */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-start">
              <label
                htmlFor="confirm-password"
                className="text-xs sm:text-sm font-medium pt-0 sm:pt-2"
                style={{ color: "#333333" }}
              >
                Xác nhận mật khẩu
              </label>
              <div className="col-span-1 sm:col-span-2 relative">
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  size={{ base: "sm", sm: "md" }}
                  px={{ base: 3, sm: 4 }}
                  py={{ base: 2, sm: 2.5 }}
                  fontSize={{ base: "sm", sm: "md" }}
                  style={{ borderColor: "#E9ECEF" }}
                  _hover={{ borderColor: "#C89B6D" }}
                  _focus={{
                    borderColor: "#C89B6D",
                    boxShadow: "0 0 0 1px #C89B6D",
                  }}
                />
              </div>
            </div>

            {/* Button */}
            <div
              className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-start pt-3 sm:pt-4"
              style={{ borderTop: "1px solid #E9ECEF" }}
            >
              <div className="hidden sm:block"></div>
              <div className="col-span-1 sm:col-span-2">
                <Button
                  onClick={handlePasswordChange}
                  loading={isUpdatingPassword}
                  disabled={
                    !currentPassword ||
                    !newPassword ||
                    !confirmPassword ||
                    isUpdatingPassword
                  }
                  className="text-white font-medium rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  size={{ base: "sm", sm: "md" }}
                  px={{ base: 4, sm: 6 }}
                  py={{ base: 1.5, sm: 2 }}
                  fontSize={{ base: "sm", sm: "md" }}
                  style={{
                    backgroundColor: "#C89B6D",
                    fontFamily: "Montserrat, sans-serif",
                  }}
                  _hover={{ backgroundColor: "#B88A5D" }}
                >
                  Cập nhật mật khẩu
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Địa chỉ giao hàng */}
        <div
          className="bg-white rounded-xl shadow-sm"
          style={{ border: "1px solid #E9ECEF" }}
        >
          <div
            className="px-4 sm:px-6 py-3 sm:py-4"
            style={{ borderBottom: "2px solid #C89B6D" }}
          >
            <h2
              className="text-base sm:text-lg font-semibold"
              style={{ fontFamily: "Montserrat, sans-serif", color: "#1A2A4E" }}
            >
              Địa chỉ giao hàng
            </h2>
          </div>
          <div className="p-4 sm:p-6">
            <AddressManagement />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
