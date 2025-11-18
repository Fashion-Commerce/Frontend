import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Input,
  HStack,
  VStack,
  Badge,
  Spinner,
  IconButton,
} from "@chakra-ui/react";
import { toast } from "react-toastify";
import { useAuthStore } from "../stores/authStore";
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  type Address,
  type CreateAddressRequest,
  type UpdateAddressRequest,
} from "../api/address.api";
import { EditIcon, TrashIcon } from "./icons";

const AddressManagement: React.FC = () => {
  const { user } = useAuthStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    address_label: "",
    recipient_name: "",
    recipient_phone: "",
    address_line: "",
    ward: "",
    district: "",
    city: "",
    is_default: false,
  });

  useEffect(() => {
    if (user?.user_id) {
      loadAddresses();
    }
  }, [user?.user_id]);

  const loadAddresses = async () => {
    try {
      setIsLoading(true);
      const response = await getAddresses();
      if (response.info.success && response.info.addresses) {
        setAddresses(response.info.addresses);
      }
    } catch (error: any) {
      toast.error(error.message || "Không thể tải danh sách địa chỉ");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      address_label: "",
      recipient_name: "",
      recipient_phone: "",
      address_line: "",
      ward: "",
      district: "",
      city: "",
      is_default: false,
    });
    setEditingAddressId(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.user_id) return;

    // Validation
    if (
      !formData.recipient_name.trim() ||
      !formData.recipient_phone.trim() ||
      !formData.address_line.trim() ||
      !formData.ward.trim() ||
      !formData.district.trim() ||
      !formData.city.trim()
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      setIsSubmitting(true);

      if (editingAddressId) {
        // Update existing address
        const updateData: UpdateAddressRequest = {
          user_id: user.user_id,
          address_id: editingAddressId,
          ...formData,
        };
        const response = await updateAddress(editingAddressId, updateData);
        if (response.info.success) {
          toast.success("Cập nhật địa chỉ thành công!");
          await loadAddresses();
          resetForm();
        }
      } else {
        // Create new address
        const createData: CreateAddressRequest = {
          user_id: user.user_id,
          ...formData,
        };
        const response = await createAddress(createData);
        if (response.info.success) {
          toast.success("Thêm địa chỉ thành công!");
          await loadAddresses();
          resetForm();
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (address: Address) => {
    setFormData({
      address_label: address.address_label,
      recipient_name: address.recipient_name,
      recipient_phone: address.recipient_phone,
      address_line: address.address_line,
      ward: address.ward,
      district: address.district,
      city: address.city,
      is_default: address.is_default,
    });
    setEditingAddressId(address.id);
    setShowAddForm(true);
  };

  const handleDelete = async (addressId: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;

    try {
      const response = await deleteAddress(addressId);
      if (response.info.success) {
        toast.success("Xóa địa chỉ thành công!");
        await loadAddresses();
      }
    } catch (error: any) {
      toast.error(error.message || "Không thể xóa địa chỉ");
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const response = await setDefaultAddress(addressId);
      if (response.info.success) {
        toast.success("Đã đặt làm địa chỉ mặc định!");
        await loadAddresses();
      }
    } catch (error: any) {
      toast.error(error.message || "Không thể đặt địa chỉ mặc định");
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Địa chỉ giao hàng
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Quản lý địa chỉ giao hàng của bạn
          </p>
        </div>
        {!showAddForm && (
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition-all"
          >
            + Thêm địa chỉ mới
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-6 border-2 border-green-200 dark:border-green-800">
          <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
            {editingAddressId ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
          </h3>
          <form onSubmit={handleSubmit}>
            <VStack gap={4} align="stretch">
              {/* Address Label */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Nhãn địa chỉ (Nhà riêng, Văn phòng...)
                </label>
                <Input
                  value={formData.address_label}
                  onChange={(e) =>
                    setFormData({ ...formData, address_label: e.target.value })
                  }
                  placeholder="VD: Nhà riêng, Văn phòng"
                  className="border-2 border-gray-300 dark:border-slate-600"
                />
              </div>

              {/* Recipient Name & Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Tên người nhận <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.recipient_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        recipient_name: e.target.value,
                      })
                    }
                    placeholder="Nguyễn Văn A"
                    required
                    className="border-2 border-gray-300 dark:border-slate-600"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.recipient_phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        recipient_phone: e.target.value,
                      })
                    }
                    placeholder="0901234567"
                    required
                    minLength={10}
                    maxLength={11}
                    className="border-2 border-gray-300 dark:border-slate-600"
                  />
                </div>
              </div>

              {/* Address Line */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Địa chỉ <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.address_line}
                  onChange={(e) =>
                    setFormData({ ...formData, address_line: e.target.value })
                  }
                  placeholder="123 Đường ABC"
                  required
                  minLength={5}
                  className="border-2 border-gray-300 dark:border-slate-600"
                />
              </div>

              {/* Ward, District, City */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Phường/Xã <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.ward}
                    onChange={(e) =>
                      setFormData({ ...formData, ward: e.target.value })
                    }
                    placeholder="Phường 1"
                    required
                    className="border-2 border-gray-300 dark:border-slate-600"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Quận/Huyện <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.district}
                    onChange={(e) =>
                      setFormData({ ...formData, district: e.target.value })
                    }
                    placeholder="Quận 1"
                    required
                    className="border-2 border-gray-300 dark:border-slate-600"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Tỉnh/Thành phố <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    placeholder="TP. Hồ Chí Minh"
                    required
                    className="border-2 border-gray-300 dark:border-slate-600"
                  />
                </div>
              </div>

              {/* Is Default Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_default"
                  checked={formData.is_default}
                  onChange={(e) =>
                    setFormData({ ...formData, is_default: e.target.checked })
                  }
                  className="w-4 h-4 text-green-600"
                />
                <label
                  htmlFor="is_default"
                  className="text-sm text-gray-700 dark:text-gray-300"
                >
                  Đặt làm địa chỉ mặc định
                </label>
              </div>

              {/* Buttons */}
              <HStack gap={3}>
                <Button
                  type="submit"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded-lg"
                >
                  {editingAddressId ? "Cập nhật" : "Thêm địa chỉ"}
                </Button>
                <Button
                  type="button"
                  onClick={resetForm}
                  disabled={isSubmitting}
                  className="bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-medium px-6 py-2 rounded-lg"
                >
                  Hủy
                </Button>
              </HStack>
            </VStack>
          </form>
        </div>
      )}

      {/* Address List */}
      <div className="space-y-4">
        {addresses.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Chưa có địa chỉ nào. Thêm địa chỉ giao hàng đầu tiên của bạn!
          </div>
        ) : (
          addresses.map((address) => (
            <div
              key={address.id}
              className={`bg-white dark:bg-slate-800 rounded-lg p-5 border-2 transition-all ${
                address.is_default
                  ? "border-green-500 dark:border-green-600"
                  : "border-gray-200 dark:border-slate-700"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {address.address_label && (
                      <Badge
                        colorScheme="blue"
                        className="px-2 py-1 rounded text-xs"
                      >
                        {address.address_label}
                      </Badge>
                    )}
                    {address.is_default && (
                      <Badge
                        colorScheme="green"
                        className="px-2 py-1 rounded text-xs"
                      >
                        Mặc định
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {address.recipient_name} | {address.recipient_phone}
                    </div>
                    <div className="text-gray-700 dark:text-gray-300">
                      {address.address_line}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">
                      {address.ward}, {address.district}, {address.city}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!address.is_default && (
                    <Button
                      onClick={() => handleSetDefault(address.id)}
                      size="sm"
                      className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-3 py-1 rounded"
                    >
                      Đặt mặc định
                    </Button>
                  )}
                  <IconButton
                    aria-label="Chỉnh sửa"
                    onClick={() => handleEdit(address)}
                    size="sm"
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <EditIcon className="w-5 h-5" />
                  </IconButton>
                  <IconButton
                    aria-label="Xóa"
                    onClick={() => handleDelete(address.id)}
                    size="sm"
                    className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </IconButton>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AddressManagement;
