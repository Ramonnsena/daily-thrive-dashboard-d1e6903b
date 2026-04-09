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

// 🔥 Função auxiliar para tratar JSON com segurança
async function safeJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
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

  const responseData = await safeJson(response);

  console.log("📥 Login response status:", response.status);
  console.log("📥 Login response data:", responseData);

  // ❌ erro HTTP (500, 502, etc)
  if (!response.ok) {
    throw new Error(
      responseData?.message || `Erro ao fazer login. Código: ${response.status}`
    );
  }

  // ❌ resposta vazia
  if (!responseData) {
    throw new Error("Resposta da API vazia ou inválida");
  }

  // ❌ sucesso false
  if (!responseData.success) {
    throw new Error(responseData.message || "Falha no login");
  }

  // ❌ token ausente
  if (!responseData.data || !responseData.data.token) {
    throw new Error("Token não encontrado na resposta");
  }

  return responseData as LoginResponse;
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

  const responseData = await safeJson(response);

  console.log("📥 Register response status:", response.status);
  console.log("📥 Register response data:", responseData);

  if (!response.ok) {
    if (responseData) {
      throw new Error(
        typeof responseData === "string"
          ? responseData
          : JSON.stringify(responseData)
      );
    }
    throw new Error(`Erro ao cadastrar. Código: ${response.status}`);
  }

  return responseData;
}
