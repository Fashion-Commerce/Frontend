import React, { useState } from "react";
import { Box, Card, Stack, Input, Button } from "@chakra-ui/react";

interface PasswordChangeTabProps {
  onPasswordChange: (data: {
    current_password: string;
    new_password: string;
    confirm_password: string;
  }) => Promise<void>;
}

const PasswordChangeTab: React.FC<PasswordChangeTabProps> = ({
  onPasswordChange,
}) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới và xác nhận mật khẩu không khớp");
      return;
    }

    try {
      setIsUpdating(true);
      await onPasswordChange({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      // Reset form on success
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      // Error is handled in parent component
      setError(error.message || "Đổi mật khẩu thất bại");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card.Root p={6} mt={4}>
      <Card.Body>
        <form onSubmit={handleSubmit}>
          <Stack gap={4}>
            <Box>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium mb-2"
              >
                Mật khẩu hiện tại <span className="text-red-500">*</span>
              </label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Nhập mật khẩu hiện tại"
                disabled={isUpdating}
              />
            </Box>

            <Box>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium mb-2"
              >
                Mật khẩu mới <span className="text-red-500">*</span>
              </label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                disabled={isUpdating}
              />
            </Box>

            <Box>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium mb-2"
              >
                Xác nhận mật khẩu mới <span className="text-red-500">*</span>
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                disabled={isUpdating}
              />
            </Box>

            {error && (
              <Box p={3} bg="red.50" borderRadius="md" color="red.600">
                {error}
              </Box>
            )}

            <Button
              type="submit"
              colorScheme="blue"
              loading={isUpdating}
              disabled={
                !currentPassword ||
                !newPassword ||
                !confirmPassword ||
                isUpdating
              }
            >
              Đổi mật khẩu
            </Button>
          </Stack>
        </form>
      </Card.Body>
    </Card.Root>
  );
};

export default PasswordChangeTab;
