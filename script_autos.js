// script_autos.js
import { getAllCars, createCar, updateCar, deleteCar, getCarById } from './api.js';

// ------------------------------------
// 1. LÓGICA DEL LOGIN (Y LOGOUT)
// ------------------------------------

function handleLogin() {
    const loginForm = document.getElementById("loginForm");
    if (!loginForm) return;

    // ... (Lógica de login existente) ...
    loginForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const user = document.getElementById("username").value.trim();
        const pass = document.getElementById("password").value.trim();
        const errorMsg = document.getElementById("errorMsg");

        if (user === "duoc" && pass === "duoc123") {
            localStorage.setItem("access_token", "session-simulated-token-ok"); 
            window.location.href = "mantenedor_autos.html";
        } else {
            errorMsg.style.display = "block";
            errorMsg.textContent = "Usuario o contraseña incorrectos.";
        }
    });
}

function handleLogout() {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm("¿Estás seguro de que quieres cerrar la sesión?")) {
                localStorage.removeItem("access_token");
                window.location.href = "index.html";
            }
        });
    }
}


// ------------------------------------
// 2. LÓGICA DEL MANTENEDOR
// ------------------------------------

function handleMantenedor() {
    const carForm = document.getElementById("carForm");
    if (!carForm) return;

    // 🛑 BARRERA DE SEGURIDAD: Revisa el token antes de cargar
    const token = localStorage.getItem("access_token");
    if (!token) {
      window.location.href = "index.html";
      return;
    }

    // Inicializa el botón de Cerrar Sesión
    handleLogout();

    const carsTableBody = document.getElementById("carsTableBody");
    const saveCarBtn = document.getElementById("saveCarBtn");
    const carIdInput = document.getElementById("carId");

    // RENDERIZADO Y CARGA DE DATOS DESDE LA API
    async function renderTable() {
        carsTableBody.innerHTML = '<tr><td colspan="6" class="text-center"><i class="fas fa-spinner fa-spin"></i> Cargando datos...</td></tr>';
        try {
            const records = await getAllCars();
            
            carsTableBody.innerHTML = records.length > 0
                ? records.map(car => `
                    <tr>
                      <td>${car.id}</td>
                      <td>${car.modelo}</td>
                      <td>${car.anio}</td>
                      <td>$${car.precio ? car.precio.toLocaleString('es-CL') : 'N/A'}</td>
                      <td>${car.marca_id}</td>
                      <td>
                        <button class="btn btn-warning btn-sm edit-btn" data-id="${car.id}" title="Editar"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-danger btn-sm delete-btn" data-id="${car.id}" title="Eliminar"><i class="fas fa-trash-alt"></i></button>
                      </td>
                    </tr>
                  `).join("")
                : '<tr><td colspan="6" class="text-center text-muted">No hay autos registrados. Añade uno.</td></tr>';

            // Reasignar listeners
            document.querySelectorAll(".delete-btn").forEach(button => {
                button.addEventListener("click", handleDelete);
            });
            document.querySelectorAll(".edit-btn").forEach(button => {
                button.addEventListener("click", handleEdit);
            });

        } catch (error) {
            console.error("Error al cargar los datos:", error);
            alert(`Error de conexión con la API: ${error.message}`);
            carsTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Fallo al conectar o Error de la API.</td></tr>';
        }
    }

    // MANEJO DE FORMULARIO (POST/PUT)
    carForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // 1. Recolección de los nuevos campos
        const modelo = document.getElementById("modelo").value;
        const anio = parseInt(document.getElementById("anio").value);
        const precio = parseFloat(document.getElementById("precio").value); 
        const marca_id = parseInt(document.getElementById("marca_id").value); 

        const carData = { modelo, anio, precio, marca_id };
        const carId = carIdInput.value;

        saveCarBtn.disabled = true;
        saveCarBtn.innerHTML = carId ? '<i class="fas fa-sync fa-spin"></i> Actualizando...' : '<i class="fas fa-spinner fa-spin"></i> Guardando...';

        try {
            if (carId) {
                await updateCar(parseInt(carId), carData);
                alert("Auto actualizado con éxito!");
            } else {
                await createCar(carData);
                alert("Auto creado con éxito!");
            }
            
            carForm.reset();
            carIdInput.value = '';
            saveCarBtn.innerHTML = '<i class="fas fa-save"></i> Guardar Auto';
            
        } catch (error) {
            console.error("Error en operación POST/PUT:", error);
            alert(`Error al procesar la solicitud: ${error.message}`);
        } finally {
            saveCarBtn.disabled = false;
            await renderTable();
        }
    });

    // ELIMINAR Y EDITAR
    async function handleDelete(e) {
        // ... (Lógica de eliminación existente, utiliza el token) ...
        const carId = parseInt(e.target.dataset.id);
        if (!confirm(`¿Estás seguro de eliminar el auto con ID ${carId}? Esta acción es permanente en la API.`)) return;

        e.target.disabled = true;
        e.target.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

        try {
            await deleteCar(carId);
            alert("Auto eliminado con éxito!");
        } catch (error) {
            console.error("Error al eliminar el auto:", error);
            alert(`Error al eliminar el auto: ${error.message}`);
        } finally {
            await renderTable();
        }
    }

    async function handleEdit(e) {
        // ... (Lógica de edición existente, utiliza el token) ...
        const carId = parseInt(e.target.dataset.id);
        
        const originalIcon = e.target.innerHTML;
        e.target.innerHTML = '<i class="fas fa-sync fa-spin"></i>';
        e.target.disabled = true;

        try {
            const carToEdit = await getCarById(carId);
            
            // Llenar el formulario con los datos de la API
            document.getElementById("modelo").value = carToEdit.modelo;
            document.getElementById("anio").value = carToEdit.anio;
            document.getElementById("precio").value = carToEdit.precio;
            document.getElementById("marca_id").value = carToEdit.marca_id;
            
            carIdInput.value = carId;
            saveCarBtn.innerHTML = '<i class="fas fa-arrow-alt-circle-up"></i> Actualizar Auto';

        } catch (error) {
            console.error("Error al cargar auto para edición:", error);
            alert(`Auto no encontrado para edición: ${error.message}`);
        } finally {
            e.target.innerHTML = originalIcon;
            e.target.disabled = false;
        }
    }

    // Carga inicial de datos
    renderTable();
}


// ------------------------------------
// 3. INICIALIZACIÓN PRINCIPAL (Router)
// ------------------------------------

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("loginForm")) {
        handleLogin();
    } else if (document.getElementById("carForm")) {
        handleMantenedor();
    }
});
