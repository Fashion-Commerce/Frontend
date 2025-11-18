import http2 from "@/lib/http2";

// ========== ADDRESS TYPES ==========
export interface Address {
  id: string;
  user_id: string;
  address_label: string;
  recipient_name: string;
  recipient_phone: string;
  address_line: string;
  ward: string;
  district: string;
  city: string;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAddressRequest {
  user_id: string;
  address_label: string;
  recipient_name: string;
  recipient_phone: string;
  address_line: string;
  ward: string;
  district: string;
  city: string;
  is_default: boolean;
}

export interface UpdateAddressRequest {
  user_id: string;
  address_id: string;
  address_label: string;
  recipient_name: string;
  recipient_phone: string;
  address_line: string;
  ward: string;
  district: string;
  city: string;
  is_default: boolean;
}

export interface AddressResponse {
  message: string;
  info: {
    success: boolean;
    message: string;
    address_id?: string;
    addresses?: Address[];
  };
}

// ========== ADDRESS API FUNCTIONS ==========

/**
 * Create a new delivery address for the authenticated user
 */
export const createAddress = async (
  data: CreateAddressRequest
): Promise<AddressResponse> => {
  const response = await http2.post<AddressResponse>("v1/addresses", data);
  return response;
};

/**
 * Get all addresses for authenticated user, or specific address by ID
 */
export const getAddresses = async (
  address_id?: string
): Promise<AddressResponse> => {
  const params = address_id ? { address_id } : {};
  const response = await http2.get<AddressResponse>("v1/addresses", { params });
  return response;
};

/**
 * Update an existing delivery address for the authenticated user
 */
export const updateAddress = async (
  address_id: string,
  data: UpdateAddressRequest
): Promise<AddressResponse> => {
  const response = await http2.put<AddressResponse>(
    `v1/addresses/${address_id}`,
    data
  );
  return response;
};

/**
 * Delete a delivery address for the authenticated user
 */
export const deleteAddress = async (
  address_id: string
): Promise<AddressResponse> => {
  const response = await http2.delete<AddressResponse>(
    `v1/addresses/${address_id}`
  );
  return response;
};

/**
 * Set a delivery address as the default address for the authenticated user
 */
export const setDefaultAddress = async (
  address_id: string
): Promise<AddressResponse> => {
  const response = await http2.put<AddressResponse>(
    `v1/addresses/${address_id}/set-default`
  );
  return response;
};
