import React, { useState, useEffect } from "react";
import { Box, Card, Stack, Input, Button, Spinner } from "@chakra-ui/react";
import { User } from "../api/auth.api";

interface ProfileEditTabProps {
  user: User | null;
  isLoading: boolean;
  onUpdate: (data: { fullname?: string; phone?: string }) => Promise<void>;
}

const ProfileEditTab: React.FC<ProfileEditTabProps> = ({
  user,
  isLoading,
  onUpdate,
}) => {
  const [fullname, setFullname] = useState("");
  const [phone, setPhone] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setFullname(user.fullname || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsUpdating(true);
      await onUpdate({
        fullname: fullname.trim(),
        phone: phone.trim(),
      });
    } catch (error) {
      // Error is handled in parent component
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <Box p={8} textAlign="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Card.Root p={6} mt={4}>
      <Card.Body>
        <form onSubmit={handleSubmit}>
          <Stack gap={4}>
            <Box>
              <label
                htmlFor="fullname"
                className="block text-sm font-medium mb-2"
              >
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <Input
                id="fullname"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                placeholder="Nhập họ và tên"
                disabled={isUpdating}
              />
            </Box>

            <Box>
              <label htmlFor="phone" className="block text-sm font-medium mb-2">
                Số điện thoại
              </label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Nhập số điện thoại"
                disabled={isUpdating}
              />
            </Box>

            <Box>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <Input id="email" value={user?.email || ""} disabled />
              <p className="text-sm text-gray-500 mt-1">
                Email không thể thay đổi
              </p>
            </Box>

            <Button
              type="submit"
              colorScheme="blue"
              loading={isUpdating}
              disabled={!fullname.trim() || isUpdating}
            >
              Cập nhật thông tin
            </Button>
          </Stack>
        </form>
      </Card.Body>
    </Card.Root>
  );
};

export default ProfileEditTab;
