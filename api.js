// api.js

const API_BASE_URL = 'https://mantistcy.cl/api_autos/autos';
const AUTH_TOKEN = 'Bearer serviciosDuoc2026'; // El token proporcionado

/**
 * Función genérica para manejar peticiones Fetch con autenticación.
 */
async function apiFetch(method, url, data = null) {
    const options = {
        method: method,
        headers: {
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
            // Intenta leer el mensaje de error si el cuerpo no está vacío
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                 const errorData = await response.json();
                 throw new Error(`Error en la API (${response.status}): ${errorData.error || response.statusText}`);
            }
            throw new Error(`Error en la API (${response.status}): ${response.statusText}`);
        }

        // Si la respuesta es exitosa (200, 201, 204), pero no tiene contenido (como a veces en DELETE/PUT)
        if (response.status === 204 || response.headers.get('content-length') === '0') {
            return true; // Éxito
        }
        
        // Retornar el JSON que tu PHP envía {"status": "created"}, {"status": "updated"}, etc.
        return response.json();

    } catch (error) {
        console.error("Error de red o de la API:", error);
        throw error;
    }
}

// ... (El resto de las funciones de exportación: getAllCars, createCar, etc., permanecen iguales) ...
export async function getAllCars() {
    return apiFetch('GET', API_BASE_URL);
}
// ...
