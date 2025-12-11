// script_autos.js
import { getAllCars, createCar, updateCar, deleteCar, getCarById } from './api.js';

// ------------------------------------
// 1. LÓGICA DEL LOGIN
// ------------------------------------

function handleLogin() {
    const loginForm = document.getElementById("loginForm");
    if (!loginForm) return; // Si no estamos en index.html, salimos

    loginForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const user = document.getElementById("username").value.trim();
        const pass = document.getElementById("password").value.trim();
        const errorMsg = document.getElementById("errorMsg");
        const loginBtn = document.getElementById("loginBtn");

        // Simulación de credenciales
        if (user === "duoc" && pass === "duoc123") {
            // Guardar token simulado y redirigir
            localStorage.setItem("access_token", "fake-jwt-token-12345");
            window.location.href = "mantenedor_autos.html";
        } else {
            errorMsg.style.display = "block";
            errorMsg.textContent = "Usuario o contraseña incorrectos.";
            // Opcional: limpiar campos
            document.getElementById("password").value = '';
        }
    });
}


// ------------------------------------
// 2. LÓGICA DEL MANTENEDOR DE AUTOS
// ------------------------------------

function handleMantenedor() {
    const carForm = document.getElementById("carForm");
    if (!carForm) return; // Si no estamos en mantenedor_autos.html, salimos

    // --- VERIFICACIÓN DE LOGIN ---
    const token = localStorage.getItem("access_token");
    if (!token) {
      // Si no hay token, redirigimos al login (esto es buena práctica)
      // window.location.href = "index.html";
      // return;
    }
    // --- FIN VERIFICACIÓN DE LOGIN ---
    
    const carsTableBody = document.getElementById("carsTableBody");
    const saveCarBtn = document.getElementById("saveCarBtn");
    const carIdInput = document.getElementById("carId");

    // RENDERIZADO Y CARGA DE DATOS
    async function renderTable() {
        try {
            const records = await getAllCars();
            carsTableBody.innerHTML = records.length > 0
                ? records.map(car => `
                    <tr>
                      <td>${car.id}</td>
                      <td>${car.marca}</td>
                      <td>${car.modelo}</td>
                      <td>${car.anio}</td>
                      <td>${car.color}</td>
                      <td>
                        <button class="btn btn-warning btn-sm edit-btn" data-id="${car.id}">Editar</button>
                        <button class="btn btn-danger btn-sm delete-btn" data-id="${car.id}">Eliminar</button>
                      </td>
                    </tr>
                  `).join("")
                : '<tr><td colspan="6" class="text-center">No hay autos registrados.</td></tr>';

            document.querySelectorAll(".delete-btn").forEach(button => {
                button.addEventListener("click", handleDelete);
            });
            document.querySelectorAll(".edit-btn").forEach(button => {
                button.addEventListener("click", handleEdit);
            });
        } catch (error) {
            console.error("Error al cargar los datos:", error);
            alert("Error al cargar los datos del inventario.");
        }
    }

    // MANEJO DE FORMULARIO (POST/PUT)
    carForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const marca = document.getElementById("marca").value;
        const modelo = document.getElementById("modelo").value;
        const anio = parseInt(document.getElementById("anio").value);
        const color = document.getElementById("color").value;

        const carData = { marca, modelo, anio, color };
        const carId = carIdInput.value;

        saveCarBtn.disabled = true;
        saveCarBtn.textContent = carId ? "Actualizando..." : "Guardando...";

        try {
            if (carId) {
                await updateCar(parseInt(carId), carData);
            } else {
                await createCar(carData);
            }
            
            carForm.reset();
            carIdInput.value = '';
            saveCarBtn.textContent = "Guardar Auto";
            
        } catch (error) {
            console.error("Error al guardar/actualizar el auto:", error);
            alert("Hubo un error al procesar la solicitud.");
        } finally {
            saveCarBtn.disabled = false;
            await renderTable();
        }
    });

    // ELIMINAR Y EDITAR
    async function handleDelete(e) {
        const carId = parseInt(e.target.dataset.id);
        if (!confirm(`¿Estás seguro de eliminar el auto con ID ${carId}?`)) return;

        e.target.disabled = true;
        e.target.textContent = 'Eliminando...';

        try {
            await deleteCar(carId);
        } catch (error) {
            console.error("Error al eliminar el auto:", error);
            alert("Error al eliminar el auto.");
        } finally {
            await renderTable();
        }
    }

    async function handleEdit(e) {
        const carId = parseInt(e.target.dataset.id);
        try {
            const carToEdit = await getCarById(carId);
            
            document.getElementById("marca").value = carToEdit.marca;
            document.getElementById("modelo").value = carToEdit.modelo;
            document.getElementById("anio").value = carToEdit.anio;
            document.getElementById("color").value = carToEdit.color;
            
            carIdInput.value = carId;
            saveCarBtn.textContent = "Actualizar Auto";

        } catch (error) {
            console.error("Error al cargar auto para edición:", error);
            alert("Auto no encontrado para edición.");
        }
    }

    // Carga inicial
    renderTable();
}


// ------------------------------------
// 3. INICIALIZACIÓN PRINCIPAL
// ------------------------------------

document.addEventListener("DOMContentLoaded", () => {
    // Si encuentra el formulario de login, ejecuta la lógica de login.
    if (document.getElementById("loginForm")) {
        handleLogin();
    } 
    // Si encuentra el formulario de mantenedor, ejecuta la lógica del mantenedor.
    else if (document.getElementById("carForm")) {
        handleMantenedor();
    }
});
