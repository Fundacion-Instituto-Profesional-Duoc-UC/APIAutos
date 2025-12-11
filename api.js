// api.js

const API_BASE_URL = 'https://mantistcy.cl/api_autos/autos';
const AUTH_TOKEN = 'Bearer serviciosDuoc2026';

/**
 * Función genérica para manejar peticiones Fetch con autenticación.
 */
async function apiFetch(method, url, data = null) {
    const options = {
        method: method,
        headers: {
            // El token es necesario para todas las operaciones (GET, POST, PUT, DELETE)
            'Authorization': AUTH_TOKEN, 
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
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                 // Intenta leer el mensaje de error del cuerpo
                 const errorData = await response.json();
                 throw new Error(`Error en la API (${response.status}): ${errorData.error || response.statusText}`);
            }
            throw new Error(`Error en la API (${response.status}): ${response.statusText}`);
        }

        // Si la respuesta es exitosa (200, 201, 204), pero no tiene contenido (como en DELETE/PUT si solo se envía un status)
        if (response.status === 204 || response.headers.get('content-length') === '0') {
            return true;
        }
        
        // Retornar el cuerpo de la respuesta (generalmente JSON)
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
