export interface Usuario {
  id: number;
  email: string;
  nombre_completo: string;
  rol?: string;
  activo: boolean;
  creado_en: string;
  perfil?: Perfil;
}

export interface Perfil {
  id?: number;
  usuario_id?: number;
  provincia: string;
  ciudad: string;
  modalidad_preferida: string;
  medio_transporte: string;
  latitud_origen?: number | null;
  longitud_origen?: number | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in_seconds: number;
  usuario: Usuario;
}

export interface HealthResponse {
  status: string;
  service?: string;
  version?: string;
  commit?: string;
  commit_full?: string;
  server: {
    status: string;
    name: string;
    version: string;
    commit?: string;
    port: number;
    environment: string;
  };
  database: {
    connected: boolean;
    status: string;
    message: string;
    database_name: string;
  };
  timestamp: string;
  modules: Record<string, string>;
}

export interface PreguntaVocacional {
  id: number;
  area: string;
  pregunta: string;
  contexto?: string;
  ejemplo?: string;
  area_num?: number;
  enfoque?: string;
  orden_presentacion?: number;
  pagina?: number;
}

export interface OpcionLikert {
  valor: number;
  etiqueta: string;
  descripcion?: string;
}

export interface CuestionarioResponse {
  instrucciones: string;
  areas: string[];
  total_areas: number;
  preguntas: PreguntaVocacional[];
  opciones: OpcionLikert[];
  total_preguntas: number;
  escala_descripcion?: Record<string, string>;
}

export interface CarreraOferta {
  id: number;
  nombre: string;
  area_vocacional: string;
  institucion: string;
  siglas: string;
  campus: string;
  provincia: string;
  ciudad: string;
  modalidad: string;
  duracion_semestres: number;
  puntaje_referencial: number;
  puntaje_fuente: string;
  puntaje_es_simulado: boolean;
  nivelacion_estado: string;
  nivelacion_fuente: string;
  nivelacion_es_demo: boolean;
  enlace_oficial: string;
  lat: number;
  lon: number;
  descripcion: string;
  facultad?: string;
  respaldo_facultad?: string;
  canton?: string;
  titulo_otorga?: string;
  codigo_oferta?: string;
  campo_conocimiento_ces?: string;
  areas_vocacionales?: string[];
  lugar_ejecucion?: string;
  referencia_puntaje?: string;
  tipo_referencia?: string;
  periodo_puntaje?: string;
  pagina_web?: string;
  estado_verificacion?: string;
  nivel_formacion?: string;
  nivel_academico?: string;
  es_tercer_nivel?: boolean;
  es_posgrado?: boolean;
  estado?: string;
  es_vigente?: boolean;
  universidad_id?: number;
  sedes?: string[];
  fuente?: string;
  periodo_verificacion?: string;
  modificado_por?: string;
  fecha_modificacion?: string;
  afinidad_vocacional?: number;
  distancia_km?: number;
  tiempo_traslado?: string;
  es_misma_provincia?: boolean;
  explicacion?: string;
}

export type Carrera = CarreraOferta;

export const isSameOffer = (a: CarreraOferta, b: CarreraOferta): boolean => {
  if (a.codigo_oferta && b.codigo_oferta) {
    return a.codigo_oferta === b.codigo_oferta;
  }
  return a.id === b.id;
};

export interface UniversidadPublica {
  id: string;
  nombre: string;
  siglas: string;
  tipo: string;
  provincia_matriz: string;
  ciudad_matriz: string;
  ubicaciones_ofertas?: string[];
  provincias?: string[];
  ciudades?: string[];
  total_carreras: number;
  estado_catalogo?: string;
  etiqueta_catalogo?: string;
  facultades?: string[];
  total_facultades?: number;
  sitio_web: string;
  descripcion?: string;
  fuente_verificacion?: string;
  fecha_verificacion?: string;
  lat?: number;
  lon?: number;
}

export interface EvaluacionResultado {
  id: number;
  usuario_id: number;
  creado_en: string;
  version_cuestionario?: string;
  max_puntos_por_area?: number;
  area_predominante: string;
  es_empate?: boolean;
  areas_empatadas?: string[];
  todas_cero?: boolean;
  mensaje_resultado?: string;
  nota_metodologica?: string;
  puntuaciones_areas: Record<string, number>;
  carreras_sugeridas: CarreraOferta[];
  recomendaciones: string[];
  provincia_origen?: string;
  ciudad_origen?: string;
  modalidad_preferida?: string;
}

export interface EvaluacionHistorialItem {
  id: number;
  creado_en: string;
  version_cuestionario?: string;
  max_puntos_por_area?: number;
  area_predominante: string;
  es_empate?: boolean;
  areas_empatadas?: string[];
  puntuaciones_areas: Record<string, number>;
  carrera_top?: CarreraOferta;
  total_carreras: number;
}

export interface EmailResponse {
  ok: boolean;
  simulado?: boolean;
  email: string;
  mensaje: string;
  evaluacion_id: number;
  archivo_adjunto?: string;
  aclaracion?: string;
}

const rawBase = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8002/api/v1').replace(/\/+$/, '');
const API_BASE_URL = rawBase.endsWith('/api/v1') ? rawBase : `${rawBase}/api/v1`;

export function getStoredToken(): string | null {
  return localStorage.getItem('nexora_token');
}

export function setStoredToken(token: string): void {
  localStorage.setItem('nexora_token', token);
}

export function removeStoredToken(): void {
  localStorage.removeItem('nexora_token');
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  onUnauthorized?: () => void
): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  let response: Response;

  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch {
    throw new Error('No se pudo establecer conexión con el servidor de Nexora en el puerto 8002.');
  }

  if (response.status === 401) {
    removeStoredToken();
    if (onUnauthorized) {
      onUnauthorized();
    }
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail || 'Sesión expirada. Por favor inicie sesión nuevamente.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.detail || `Error en la solicitud (Código ${response.status})`;
    throw new Error(message);
  }

  return response.json();
}

export const authService = {
  async register(data: {
    nombre_completo: string;
    email: string;
    password: string;
    provincia?: string;
    ciudad?: string;
    modalidad_preferida?: string;
    medio_transporte?: string;
  }): Promise<AuthResponse> {
    const res = await apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setStoredToken(res.access_token);
    return res;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setStoredToken(res.access_token);
    return res;
  },

  async getMe(onUnauthorized?: () => void): Promise<Usuario> {
    return apiRequest<Usuario>('/auth/me', { method: 'GET' }, onUnauthorized);
  },

  logout(): void {
    removeStoredToken();
  },
};

export const profileService = {
  async getProfile(): Promise<Perfil> {
    return apiRequest<Perfil>('/perfiles/mi-perfil', { method: 'GET' });
  },

  async updateProfile(perfil: Partial<Perfil>): Promise<Perfil> {
    return apiRequest<Perfil>('/perfiles/mi-perfil', {
      method: 'PUT',
      body: JSON.stringify(perfil),
    });
  },
};

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const apiCache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutos de retención en memoria

export function clearCatalogoCache(): void {
  apiCache.clear();
}

export const catalogoService = {
  clearCache(): void {
    clearCatalogoCache();
  },

  async getCarreras(filtros?: {
    area?: string;
    provincia?: string;
    modalidad?: string;
    search?: string;
    nivel?: string;
    siglas?: string;
    institucion?: string;
  }, forceRefresh: boolean = false): Promise<CarreraOferta[]> {
    const params = new URLSearchParams();
    if (filtros?.area) params.append('area', filtros.area);
    if (filtros?.provincia) params.append('provincia', filtros.provincia);
    if (filtros?.modalidad) params.append('modalidad', filtros.modalidad);
    if (filtros?.search) params.append('search', filtros.search);
    if (filtros?.siglas) params.append('siglas', filtros.siglas);
    if (filtros?.institucion) params.append('institucion', filtros.institucion);
    if (filtros?.nivel && filtros.nivel !== 'Todos') {
      params.append('nivel', filtros.nivel.includes('Posgrado') ? 'posgrado' : 'tercer_nivel');
    }
    const qs = params.toString() ? `?${params.toString()}` : '';
    const cacheKey = `carreras:${qs}`;

    if (!forceRefresh) {
      const cached = apiCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
        return cached.data as CarreraOferta[];
      }
    }

    const data = await apiRequest<CarreraOferta[]>(`/catalogo/carreras${qs}`, { method: 'GET' });
    apiCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  },

  async getUniversidades(filtros?: {
    search?: string;
    provincia?: string;
    ciudad?: string;
  }, forceRefresh: boolean = false): Promise<UniversidadPublica[]> {
    const params = new URLSearchParams();
    if (filtros?.search) params.append('search', filtros.search);
    if (filtros?.provincia) params.append('provincia', filtros.provincia);
    if (filtros?.ciudad) params.append('ciudad', filtros.ciudad);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const cacheKey = `universidades:${qs}`;

    if (!forceRefresh) {
      const cached = apiCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
        return cached.data as UniversidadPublica[];
      }
    }

    const data = await apiRequest<UniversidadPublica[]>(`/catalogo/universidades${qs}`, { method: 'GET' });
    apiCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  },

  async getUniversidadDetalle(siglasOId: string): Promise<UniversidadPublica> {
    const cacheKey = `universidad:${siglasOId.trim().toUpperCase()}`;
    const cached = apiCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      return cached.data as UniversidadPublica;
    }
    const data = await apiRequest<UniversidadPublica>(`/catalogo/universidades/${encodeURIComponent(siglasOId)}`, { method: 'GET' });
    apiCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  },
};

export const cuestionarioService = {
  async getPreguntas(): Promise<CuestionarioResponse> {
    return apiRequest<CuestionarioResponse>('/cuestionario/preguntas', { method: 'GET' });
  },
};

export const evaluacionesService = {
  async submitEvaluacion(respuestas: Record<string, number>): Promise<EvaluacionResultado> {
    return apiRequest<EvaluacionResultado>('/evaluaciones/', {
      method: 'POST',
      body: JSON.stringify({ respuestas }),
    });
  },

  async getHistorial(): Promise<EvaluacionHistorialItem[]> {
    return apiRequest<EvaluacionHistorialItem[]>('/evaluaciones/', { method: 'GET' });
  },

  async getDetalle(id: number): Promise<EvaluacionResultado> {
    return apiRequest<EvaluacionResultado>(`/evaluaciones/${id}`, { method: 'GET' });
  },

  async getUltima(): Promise<EvaluacionResultado | null> {
    return apiRequest<EvaluacionResultado | null>('/evaluaciones/ultima', { method: 'GET' });
  },
};

export const informesService = {
  async downloadPdf(evaluacionId: number): Promise<Blob> {
    const token = getStoredToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/informes/${evaluacionId}/pdf`, {
      method: 'GET',
      headers,
    });
    if (!res.ok) {
      throw new Error('No se pudo generar el documento PDF.');
    }
    return res.blob();
  },

  async sendEmail(evaluacionId: number): Promise<EmailResponse> {
    return apiRequest<EmailResponse>(`/informes/${evaluacionId}/enviar-correo`, {
      method: 'POST',
    });
  },
};

export const healthService = {
  async getHealth(): Promise<HealthResponse> {
    return apiRequest<HealthResponse>('/health', { method: 'GET' });
  },
};

export interface FavoritoItem {
  id: number;
  usuario_id: number;
  carrera_id: number;
  creado_en: string;
  carrera: CarreraOferta;
}

export interface ToggleFavoritoResponse {
  favorito: boolean;
  mensaje: string;
  carrera_id: number;
}

export interface GestorResumen {
  total_universidades: number;
  total_carreras_unicas: number;
  total_ofertas_activas: number;
  total_carreras_inactivas?: number;
  carreras_inactivas?: number;
  total_pendientes_verificacion?: number;
  pendientes_verificar?: number;
  verificadas_vigentes?: number;
}

export interface GestorCarreraFiltros {
  search?: string;
  universidad_id?: number;
  facultad?: string;
  modalidad?: string;
  solo_activas?: boolean;
}

export interface CarreraGestorCreate {
  nombre: string;
  universidad_id: number;
  facultad: string;
  modalidad: string;
  sedes?: string[];
  duracion_semestres: number;
  campo_amplio?: string;
  campo_especifico?: string;
  enlace_oficial?: string;
  fuente?: string;
  periodo_verificacion?: string;
  es_vigente?: boolean;
}

export interface CarreraGestorUpdate extends Partial<CarreraGestorCreate> {}

export interface FacultadItem {
  siglas: string;
  institucion: string;
  facultad: string;
  total_carreras: number;
  universidad_id?: number;
  universidad_siglas?: string;
  universidad_nombre?: string;
}

export interface AdminUsuario {
  id: number;
  email: string;
  nombre_completo: string;
  rol: string;
  activo: boolean;
  creado_en: string;
}

export interface AdminCrearUsuarioRequest {
  email: string;
  password: string;
  nombre_completo: string;
  rol: string;
}

export const favoritosService = {
  async getFavoritos(): Promise<FavoritoItem[]> {
    return apiRequest<FavoritoItem[]>('/favoritos/', { method: 'GET' });
  },

  async getFavoritosIds(): Promise<number[]> {
    const data = await apiRequest<{ favoritos_ids: number[] }>('/favoritos/ids', { method: 'GET' });
    return data.favoritos_ids || [];
  },

  async toggleFavorito(carreraId: number, isCurrentlyFavorite: boolean): Promise<ToggleFavoritoResponse> {
    if (isCurrentlyFavorite) {
      const res = await apiRequest<{ message: string; carrera_id: number; favorito: boolean }>(`/favoritos/${carreraId}`, { method: 'DELETE' });
      return { favorito: false, mensaje: res.message || 'Eliminada de favoritas', carrera_id: carreraId };
    } else {
      return apiRequest<ToggleFavoritoResponse>(`/favoritos/${carreraId}`, { method: 'POST' });
    }
  },

  async addFavorito(carreraId: number): Promise<ToggleFavoritoResponse> {
    return apiRequest<ToggleFavoritoResponse>(`/favoritos/${carreraId}`, { method: 'POST' });
  },

  async removeFavorito(carreraId: number): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/favoritos/${carreraId}`, { method: 'DELETE' });
  },
};

export const gestorService = {
  async getResumen(): Promise<GestorResumen> {
    return apiRequest<GestorResumen>('/gestor/resumen', { method: 'GET' });
  },

  async getCarreras(filtros?: GestorCarreraFiltros): Promise<CarreraOferta[]> {
    const params = new URLSearchParams();
    if (filtros?.search) params.append('search', filtros.search);
    if (filtros?.universidad_id) params.append('universidad_id', filtros.universidad_id.toString());
    if (filtros?.facultad) params.append('facultad', filtros.facultad);
    if (filtros?.modalidad) params.append('modalidad', filtros.modalidad);
    params.append('es_vigente', 'true');
    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await apiRequest<{ total: number; carreras: CarreraOferta[] } | CarreraOferta[]>(`/gestor/carreras${qs}`, { method: 'GET' });
    if (Array.isArray(res)) return res;
    return res.carreras || [];
  },

  async getCarreraDetalle(id: number): Promise<CarreraOferta> {
    return apiRequest<CarreraOferta>(`/gestor/carreras/${id}`, { method: 'GET' });
  },

  async crearCarrera(data: CarreraGestorCreate): Promise<CarreraOferta> {
    clearCatalogoCache();
    return apiRequest<CarreraOferta>('/gestor/carreras', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async actualizarCarrera(id: number, data: CarreraGestorUpdate): Promise<CarreraOferta> {
    clearCatalogoCache();
    return apiRequest<CarreraOferta>(`/gestor/carreras/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async cambiarEstadoCarrera(id: number, esVigente: boolean): Promise<CarreraOferta> {
    clearCatalogoCache();
    return apiRequest<CarreraOferta>(`/gestor/carreras/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ es_vigente: esVigente }),
    });
  },

  async getFacultades(siglas?: string): Promise<FacultadItem[]> {
    const qs = siglas ? `?siglas=${encodeURIComponent(siglas)}` : '';
    return apiRequest<FacultadItem[]>(`/gestor/facultades${qs}`, { method: 'GET' });
  },

  async renombrarFacultad(siglas: string, facultadAntigua: string, facultadNueva: string): Promise<{ affected_carreras: number; message: string }> {
    clearCatalogoCache();
    return apiRequest<{ affected_carreras: number; message: string }>('/gestor/facultades/renombrar', {
      method: 'PUT',
      body: JSON.stringify({
        siglas,
        facultad_antigua: facultadAntigua,
        facultad_nueva: facultadNueva,
      }),
    });
  },
};

export const adminUsuariosService = {
  async getUsuarios(rol?: string): Promise<AdminUsuario[]> {
    const qs = rol ? `?rol=${rol}` : '';
    return apiRequest<AdminUsuario[]>(`/admin/usuarios/${qs}`, { method: 'GET' });
  },

  async crearUsuario(data: AdminCrearUsuarioRequest): Promise<AdminUsuario> {
    return apiRequest<AdminUsuario>('/admin/usuarios/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async actualizarRol(usuarioId: number, nuevoRol: string): Promise<AdminUsuario> {
    return apiRequest<AdminUsuario>(`/admin/usuarios/${usuarioId}/rol`, {
      method: 'PATCH',
      body: JSON.stringify({ nuevo_rol: nuevoRol }),
    });
  },

  async actualizarEstado(usuarioId: number, activo: boolean): Promise<AdminUsuario> {
    return apiRequest<AdminUsuario>(`/admin/usuarios/${usuarioId}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ activo }),
    });
  },
};

