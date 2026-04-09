const API_BASE_URL = "";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
  } | null;
}

export interface RegisterRequest {
  firstname: string;
  surname: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterResponse {
  message?: string;
  errors?: Record<string, string[]> | string[];
  [key: string]: unknown;
}

// 🔥 LOGIN
export async function loginUser(data: LoginRequest): Promise<LoginResponse> {
  const payload = { email: data.email, password: data.password };

  console.log("📤 Login request payload:", payload);

  const response = await fetch(`${API_BASE_URL}/DailyFitness/Users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  console.log("📥 Status:", response.status);

  // 🔥 pega resposta crua
  const text = await response.text();
  console.log("📥 RAW response:", text);

  let responseData: LoginResponse | null = null;

  try {
    responseData = JSON.parse(text);
  } catch (err) {
    console.error("❌ Não é JSON válido:", err);
  }

  // ❌ erro HTTP
  if (!response.ok) {
    throw new Error(
      responseData?.message || `Erro ao fazer login. Código: ${response.status}`
    );
  }

  // ❌ resposta inválida
  if (!responseData) {
    throw new Error("Resposta da API não é JSON válido");
  }

  // ❌ falha lógica
  if (!responseData.success) {
    throw new Error(responseData.message || "Falha no login");
  }

  // ❌ token não veio
  if (!responseData.data?.token) {
    throw new Error("Token não encontrado na resposta");
  }

  return responseData;
}

// 🔥 REGISTER
export async function registerUser(
  data: RegisterRequest
): Promise<RegisterResponse> {
  console.log("📤 Register payload:", data);

  const response = await fetch(`${API_BASE_URL}/DailyFitness/Users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  console.log("📥 Status register:", response.status);

  const text = await response.text();
  console.log("📥 RAW register response:", text);

  let responseData: RegisterResponse | null = null;

  try {
    responseData = JSON.parse(text);
  } catch (err) {
    console.error("❌ Register não é JSON válido:", err);
  }

  if (!response.ok) {
    throw new Error(
      responseData
        ? JSON.stringify(responseData)
        : `Erro ao cadastrar. Código: ${response.status}`
    );
  }

  return responseData || {};
}
