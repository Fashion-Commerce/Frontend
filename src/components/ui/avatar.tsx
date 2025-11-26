import * as React from "react";
import { Avatar as ChakraAvatar } from "@chakra-ui/react";

export interface AvatarProps {
  name?: string;
  src?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  [key: string]: any;
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ name, src, size = "md", ...rest }, ref) => {
    const getInitials = (name: string) => {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    };

    const sizeMap = {
      xs: "24px",
      sm: "32px",
      md: "40px",
      lg: "48px",
      xl: "56px",
      "2xl": "64px",
    };

    return (
      <ChakraAvatar.Root ref={ref} size={sizeMap[size]} {...rest}>
        {src ? (
          <ChakraAvatar.Image src={src} alt={name} />
        ) : name ? (
          <ChakraAvatar.Fallback bg="blue.500" color="white">
            {getInitials(name)}
          </ChakraAvatar.Fallback>
        ) : (
          <ChakraAvatar.Fallback bg="gray.400" color="white">
            ?
          </ChakraAvatar.Fallback>
        )}
      </ChakraAvatar.Root>
    );
  }
);

Avatar.displayName = "Avatar";
