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
    <div className="p-8 ml-16">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Tài khoản của tôi
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Quản lý thông tin cá nhân và bảo mật
          </p>
        </div>

        {/* Thông tin cơ bản */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="border-b border-gray-200 dark:border-slate-700 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Thông tin cá nhân
            </h2>
          </div>

          <div className="p-6 space-y-5">
            {/* Họ tên - EDITABLE */}
            <div className="grid grid-cols-3 gap-4 items-start">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 pt-2">
                Họ và tên
              </label>
              <div className="col-span-2 relative">
                <Input
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  className="w-full border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 focus:border-blue-500 dark:focus:border-blue-500 transition-colors px-4 py-2.5"
                  size="md"
                  placeholder="Nhập họ và tên"
                />
              </div>
            </div>

            {/* Email - READ ONLY */}
            <div className="grid grid-cols-3 gap-4 items-start">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 pt-2">
                Email
              </label>
              <div className="col-span-2">
                <div className="text-gray-900 dark:text-gray-100 py-2.5 px-4 bg-gray-50 dark:bg-slate-900 rounded-md border border-gray-200 dark:border-slate-700">
                  {userDetails?.email}
                </div>
                <p className="text-xs text-red-500 mt-1 italic">
                  Email không được phép thay đổi
                </p>
              </div>
            </div>

            {/* Số điện thoại - EDITABLE */}
            <div className="grid grid-cols-3 gap-4 items-start">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 pt-2">
                Số điện thoại
              </label>
              <div className="col-span-2 relative">
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Chưa cập nhật"
                  className="w-full border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 focus:border-blue-500 dark:focus:border-blue-500 transition-colors px-4 py-2.5"
                  size="md"
                />
              </div>
            </div>

            {/* Loại tài khoản - READ ONLY */}
            <div className="grid grid-cols-3 gap-4 items-start">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 pt-2">
                Loại tài khoản
              </label>
              <div className="col-span-2 pt-2">
                <Badge
                  colorScheme={
                    userDetails?.user_type === "admin" ? "red" : "blue"
                  }
                  size="sm"
                  px={3}
                  py={1}
                  className="rounded-md"
                >
                  {userDetails?.user_type === "admin" ? "Admin" : "Khách hàng"}
                </Badge>
              </div>
            </div>

            {/* Trạng thái - READ ONLY with dynamic color */}
            <div className="grid grid-cols-3 gap-4 items-start">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 pt-2">
                Trạng thái
              </label>
              <div className="col-span-2 pt-2">
                {userDetails?.is_active ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                    Hoạt động
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                    <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
                    Không hoạt động
                  </span>
                )}
              </div>
            </div>

            {/* Ngày tạo - READ ONLY */}
            <div className="grid grid-cols-3 gap-4 items-start">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 pt-2">
                Ngày tạo
              </label>
              <div className="col-span-2 text-gray-900 dark:text-gray-100 py-2">
                {userDetails && formatDate(userDetails.created_at)}
              </div>
            </div>

            {/* Cập nhật - READ ONLY */}
            <div className="grid grid-cols-3 gap-4 items-start">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 pt-2">
                Cập nhật
              </label>
              <div className="col-span-2 text-gray-900 dark:text-gray-100 py-2">
                {userDetails && formatDate(userDetails.updated_at)}
              </div>
            </div>

            {/* Save/Cancel buttons - only show when modified */}
            {isProfileModified && (
              <div className="grid grid-cols-3 gap-4 items-start pt-4 border-t border-gray-200 dark:border-slate-700">
                <div></div>
                <div className="col-span-2">
                  <HStack gap={3}>
                    <Button
                      onClick={handleProfileUpdate}
                      loading={isUpdatingProfile}
                      disabled={!fullname.trim() || isUpdatingProfile}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg border-2 border-blue-600 hover:border-blue-700 transition-all shadow-sm hover:shadow-md"
                    >
                      Lưu thay đổi
                    </Button>
                    <Button
                      onClick={handleCancelProfileEdit}
                      disabled={isUpdatingProfile}
                      className="bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-medium px-6 py-2 rounded-lg border-2 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 transition-all"
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
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="border-b border-gray-200 dark:border-slate-700 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Đổi mật khẩu
            </h2>
          </div>

          <div className="p-6 space-y-5">
            {/* Mật khẩu hiện tại */}
            <div className="grid grid-cols-3 gap-4 items-start">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 pt-2">
                Mật khẩu hiện tại
              </label>
              <div className="col-span-2 relative">
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Nhập mật khẩu hiện tại"
                  size="md"
                  className="border-2 border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 focus:border-purple-500 dark:focus:border-purple-500 transition-colors px-4 py-2.5"
                />
              </div>
            </div>

            {/* Mật khẩu mới */}
            <div className="grid grid-cols-3 gap-4 items-start">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 pt-2">
                Mật khẩu mới
              </label>
              <div className="col-span-2 relative">
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  size="md"
                  className="border-2 border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 focus:border-purple-500 dark:focus:border-purple-500 transition-colors px-4 py-2.5"
                />
              </div>
            </div>

            {/* Xác nhận mật khẩu */}
            <div className="grid grid-cols-3 gap-4 items-start">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 pt-2">
                Xác nhận mật khẩu
              </label>
              <div className="col-span-2 relative">
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  size="md"
                  className="border-2 border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 focus:border-purple-500 dark:focus:border-purple-500 transition-colors px-4 py-2.5"
                />
              </div>
            </div>

            {/* Button */}
            <div className="grid grid-cols-3 gap-4 items-start pt-4 border-t border-gray-200 dark:border-slate-700">
              <div></div>
              <div className="col-span-2">
                <Button
                  onClick={handlePasswordChange}
                  loading={isUpdatingPassword}
                  disabled={
                    !currentPassword ||
                    !newPassword ||
                    !confirmPassword ||
                    isUpdatingPassword
                  }
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-2 rounded-lg border-2 border-purple-600 hover:border-purple-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cập nhật mật khẩu
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
