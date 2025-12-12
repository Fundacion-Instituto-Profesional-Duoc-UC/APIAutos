import { getAllCars, createCar, updateCar, deleteCar, getCarById } from './api.js';

// ------------------------------------
// 1. LÓGICA DEL LOGIN Y LOGOUT
// ------------------------------------
function handleLogin() {
    const loginForm = document.getElementById("loginForm");
    if (!loginForm) return;

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
        logoutBtn.onclick = () => { // Usamos onclick para evitar duplicados
            if (confirm("¿Estás seguro de que quieres cerrar la sesión?")) {
                localStorage.removeItem("access_token");
                window.location.href = "index.html";
            }
        };
    }
}

// ------------------------------------
// 2. LÓGICA DEL MANTENEDOR (CRUD)
// ------------------------------------
function handleMantenedor() {
    const carForm = document.getElementById("carForm");
    if (!carForm) return;

    const token = localStorage.getItem("access_token");
    if (!token) {
        window.location.href = "index.html";
        return;
    }

    handleLogout();

    const carsTableBody = document.getElementById("carsTableBody");
    const saveCarBtn = document.getElementById("saveCarBtn");
    const carIdInput = document.getElementById("carId");

    async function renderTable() {
        carsTableBody.innerHTML = '<tr><td colspan="6" class="text-center"><i class="fas fa-spinner fa-spin"></i> Cargando datos...</td></tr>';
        try {
            const records = await getAllCars();
            
            if (records.length > 0) {
                carsTableBody.innerHTML = records.map(car => `
                    <tr>
                      <td>${car.id}</td>
                      <td>${car.modelo}</td>
                      <td>${car.anio}</td>
                      <td>$${car.precio ? parseFloat(car.precio).toLocaleString('es-CL') : 'N/A'}</td>
                      <td>${car.marca_id}</td>
                      <td>
                        <button class="btn btn-warning btn-sm edit-btn" data-id="${car.id}" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm delete-btn" data-id="${car.id}" title="Eliminar">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                      </td>
                    </tr>
                `).join("");

                // IMPORTANTE: Re-asignar eventos usando currentTarget
                document.querySelectorAll(".delete-btn").forEach(btn => btn.onclick = handleDelete);
                document.querySelectorAll(".edit-btn").forEach(btn => btn.onclick = handleEdit);
            } else {
                carsTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No hay autos registrados.</td></tr>';
            }
        } catch (error) {
            carsTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error al conectar con el servidor.</td></tr>';
        }
    }

    carForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const modelo = document.getElementById("modelo").value;
        const anio = parseInt(document.getElementById("anio").value);
        const precio = parseFloat(document.getElementById("precio").value); 
        const marca_id = parseInt(document.getElementById("marca_id").value); 
        const carId = carIdInput.value; // El ID real de la DB

        const carData = { modelo, anio, precio, marca_id };
        saveCarBtn.disabled = true;

        try {
            if (carId) {
                await updateCar(carId, carData);
                alert("¡Auto actualizado!");
            } else {
                await createCar(carData);
                alert("¡Auto creado!");
            }
            carForm.reset();
            carIdInput.value = '';
            saveCarBtn.innerHTML = '<i class="fas fa-save"></i> Guardar Auto';
            await renderTable();
        } catch (error) {
            alert("Error: " + error.message);
        } finally {
            saveCarBtn.disabled = false;
        }
    });

    async function handleDelete(e) {
        // currentTarget asegura obtener el botón aunque se haga clic en el icono
        const carId = e.currentTarget.getAttribute("data-id");
        if (!confirm(`¿Eliminar auto con ID ${carId}?`)) return;

        try {
            await deleteCar(carId);
            await renderTable();
        } catch (error) {
            alert("Error al eliminar");
        }
    }

    async function handleEdit(e) {
        const carId = e.currentTarget.getAttribute("data-id");
        
        try {
            const result = await getCarById(carId);
            const carToEdit = Array.isArray(result) ? result[0] : result;

            if (carToEdit) {
                document.getElementById("modelo").value = carToEdit.modelo;
                document.getElementById("anio").value = carToEdit.anio;
                document.getElementById("precio").value = carToEdit.precio;
                document.getElementById("marca_id").value = carToEdit.marca_id;
                carIdInput.value = carToEdit.id; // Guardamos el ID real en el hidden input
                saveCarBtn.innerHTML = '<i class="fas fa-sync"></i> Actualizar Auto';
                window.scrollTo(0, 0); // Sube el scroll para que el usuario vea el formulario
            }
        } catch (error) {
            alert("Error al obtener datos");
        }
    }

    renderTable();
}

// ------------------------------------
// 3. INICIALIZACIÓN PRINCIPAL
// ------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("loginForm")) {
        handleLogin();
    } else if (document.getElementById("carForm")) { 
        handleMantenedor();
    }
});
