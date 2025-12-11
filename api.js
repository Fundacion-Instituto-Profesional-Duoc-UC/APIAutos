// api.js

const API_BASE_URL = 'https://mantistcy.cl/api_autos/autos';
const AUTH_TOKEN = 'Bearer serviciosDuoc2026'; // El token proporcionado

/**
 * Función genérica para manejar peticiones Fetch con autenticación.
 * @param {string} method - Método HTTP (GET, POST, PUT, DELETE).
 * @param {string} url - URL completa del endpoint.
 * @param {object | null} data - Datos a enviar en el cuerpo (para POST/PUT).
 */
async function apiFetch(method, url, data = null) {
    const options = {
        method: method,
        headers: {
            'Authorization': AUTH_TOKEN, // Se requiere para todas las operaciones
            'Content-Type': 'application/json',
        },
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, options);

        // Manejar errores HTTP (400, 500, etc.)
        if (!response.ok) {
            // Intenta leer el mensaje de error del cuerpo de la respuesta si está disponible
            const errorData = await response.json();
            throw new Error(`Error en la API (${response.status}): ${errorData.message || response.statusText}`);
        }

        // DELETE y PUT a menudo responden con 204 o 200 sin contenido en el body
        if (response.status === 204 || response.headers.get('content-length') === '0') {
            return true;
        }

        return response.json();

    } catch (error) {
        console.error("Error de red o de la API:", error);
        throw error;
    }
}

// ----------------------------------------------------
// IMPLEMENTACIÓN DE ENDPOINTS
// ----------------------------------------------------

// GET ALL: Obtener todos los autos
export async function getAllCars() {
    return apiFetch('GET', API_BASE_URL);
}

// GET by ID: Obtener auto por ID
export async function getCarById(id) {
    const url = `${API_BASE_URL}/${id}`;
    return apiFetch('GET', url);
}

// POST: Crear nuevo auto
export async function createCar(newCarData) {
    return apiFetch('POST', API_BASE_URL, newCarData);
}

// PUT: Actualizar auto
export async function updateCar(id, updatedData) {
    const url = `${API_BASE_URL}/${id}`;
    return apiFetch('PUT', url, updatedData);
}

// DELETE: Eliminar auto
export async function deleteCar(id) {
    const url = `${API_BASE_URL}/${id}`;
    return apiFetch('DELETE', url);
}
