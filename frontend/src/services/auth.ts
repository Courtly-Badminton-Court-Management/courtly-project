import api from "@/lib/api";
import { RegisterPayload, RegisterResponse } from "@/types/auth";

export async function registerUser(payload: RegisterPayload) {
  const { data } = await api.post<RegisterResponse>("/api/auth/register/", {
    ...payload,
    first_name: payload.firstname, // map to DRF if serializer expects snake_case
    last_name: payload.lastname,
  });
  return data;
}
