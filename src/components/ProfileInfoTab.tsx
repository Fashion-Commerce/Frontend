import React from "react";
import {
  Box,
  Card,
  Stack,
  Text,
  Spinner,
  HStack,
  Badge,
} from "@chakra-ui/react";
import { User } from "../api/auth.api";

interface ProfileInfoTabProps {
  user: User | null;
  isLoading: boolean;
}

const ProfileInfoTab: React.FC<ProfileInfoTabProps> = ({ user, isLoading }) => {
  if (isLoading) {
    return (
      <Box p={8} textAlign="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box p={8} textAlign="center">
        <Text>Không thể tải thông tin người dùng</Text>
      </Box>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  return (
    <Card.Root p={6} mt={4}>
      <Card.Body>
        <Stack gap={4}>
          <HStack justify="space-between">
            <Text fontWeight="semibold" fontSize="lg">
              Họ và tên:
            </Text>
            <Text fontSize="lg">{user.fullname}</Text>
          </HStack>

          <HStack justify="space-between">
            <Text fontWeight="semibold" fontSize="lg">
              Email:
            </Text>
            <Text fontSize="lg">{user.email}</Text>
          </HStack>

          <HStack justify="space-between">
            <Text fontWeight="semibold" fontSize="lg">
              Số điện thoại:
            </Text>
            <Text fontSize="lg">{user.phone || "Chưa cập nhật"}</Text>
          </HStack>

          <HStack justify="space-between">
            <Text fontWeight="semibold" fontSize="lg">
              Loại tài khoản:
            </Text>
            <Badge colorScheme={user.user_type === "admin" ? "red" : "blue"}>
              {user.user_type === "admin" ? "Quản trị viên" : "Khách hàng"}
            </Badge>
          </HStack>

          <HStack justify="space-between">
            <Text fontWeight="semibold" fontSize="lg">
              Trạng thái:
            </Text>
            <Badge colorScheme={user.is_active ? "green" : "gray"}>
              {user.is_active ? "Đang hoạt động" : "Ngừng hoạt động"}
            </Badge>
          </HStack>

          <HStack justify="space-between">
            <Text fontWeight="semibold" fontSize="lg">
              Ngày tạo:
            </Text>
            <Text fontSize="lg">{formatDate(user.created_at)}</Text>
          </HStack>

          <HStack justify="space-between">
            <Text fontWeight="semibold" fontSize="lg">
              Cập nhật lần cuối:
            </Text>
            <Text fontSize="lg">{formatDate(user.updated_at)}</Text>
          </HStack>

          {user.last_login && (
            <HStack justify="space-between">
              <Text fontWeight="semibold" fontSize="lg">
                Đăng nhập lần cuối:
              </Text>
              <Text fontSize="lg">{formatDate(user.last_login)}</Text>
            </HStack>
          )}
        </Stack>
      </Card.Body>
    </Card.Root>
  );
};

export default ProfileInfoTab;
