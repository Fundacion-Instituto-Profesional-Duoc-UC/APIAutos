// api.js

let carsDatabase = [
    { id: 1, marca: 'Toyota', modelo: 'Corolla', anio: 2022, color: 'Rojo' },
    { id: 2, marca: 'Ford', modelo: 'F-150', anio: 2021, color: 'Negro' },
    { id: 3, marca: 'Tesla', modelo: 'Model 3', anio: 2023, color: 'Blanco' }
];
let nextId = 4; // Para simular la auto-generación de IDs

// Simula una latencia de red para que las funciones sean asíncronas (Promises)
const simulateLatency = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * SIMULACIÓN DEL ENDPOINT GET /autos
 * @returns Promise<Array> Lista de todos los autos.
 */
export async function getAllCars() {
    await simulateLatency();
    return carsDatabase;
}

/**
 * SIMULACIÓN DEL ENDPOINT GET /autos/{id}
 * @param {number} id - ID del auto a obtener.
 * @returns Promise<Object> El auto encontrado.
 */
export async function getCarById(id) {
    await simulateLatency();
    const car = carsDatabase.find(c => c.id === id);
    if (!car) {
        throw new Error("Auto no encontrado");
    }
    return car;
}

/**
 * SIMULACIÓN DEL ENDPOINT POST /autos
 * @param {Object} newCarData - Datos del nuevo auto (sin ID).
 * @returns Promise<Object> El auto creado con su nuevo ID.
 */
export async function createCar(newCarData) {
    await simulateLatency();
    const newCar = {
        id: nextId++,
        ...newCarData
    };
    carsDatabase.push(newCar);
    return newCar;
}

/**
 * SIMULACIÓN DEL ENDPOINT PUT /autos/{id}
 * @param {number} id - ID del auto a actualizar.
 * @param {Object} updatedData - Nuevos datos del auto.
 * @returns Promise<Object> El auto actualizado.
 */
export async function updateCar(id, updatedData) {
    await simulateLatency();
    const index = carsDatabase.findIndex(c => c.id === id);
    if (index === -1) {
        throw new Error("Auto no encontrado para actualizar");
    }
    carsDatabase[index] = { ...carsDatabase[index], ...updatedData, id: id };
    return carsDatabase[index];
}

/**
 * SIMULACIÓN DEL ENDPOINT DELETE /autos/{id}
 * @param {number} id - ID del auto a eliminar.
 * @returns Promise<boolean> true si fue eliminado.
 */
export async function deleteCar(id) {
    await simulateLatency();
    const initialLength = carsDatabase.length;
    carsDatabase = carsDatabase.filter(c => c.id !== id);
    return carsDatabase.length < initialLength;
}
