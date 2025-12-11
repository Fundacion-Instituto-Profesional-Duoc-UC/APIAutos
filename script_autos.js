// script_autos.js
import { getAllCars, createCar, updateCar, deleteCar, getCarById } from './api.js';

document.addEventListener("DOMContentLoaded", () => {
  // Simulación de verificación de login (redirigido a index.html si no hay token)
  const token = localStorage.getItem("access_token");
  if (!token && window.location.pathname.includes("mantenedor_autos.html")) {
    // window.location.href = "index.html";
    // Si no tienes un index.html con login, puedes saltar esta parte por ahora
  }

  const carForm = document.getElementById("carForm");
  const carsTableBody = document.getElementById("carsTableBody");
  const saveCarBtn = document.getElementById("saveCarBtn");
  const carIdInput = document.getElementById("carId");

  // ---------------------------
  // RENDERIZADO Y CARGA DE DATOS
  // ---------------------------

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

      // Reasignar listeners después de renderizar
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


  // ---------------------------
  // MANEJO DE FORMULARIO (POST/PUT)
  // ---------------------------

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
        // Modo Edición (PUT)
        await updateCar(parseInt(carId), carData);
      } else {
        // Modo Creación (POST)
        await createCar(carData);
      }
      
      carForm.reset();
      carIdInput.value = ''; // Limpiar el ID
      saveCarBtn.textContent = "Guardar Auto";
      
    } catch (error) {
      console.error("Error al guardar/actualizar el auto:", error);
      alert("Hubo un error al procesar la solicitud.");
    } finally {
      saveCarBtn.disabled = false;
      await renderTable(); // Recargar la tabla
    }
  });


  // ---------------------------
  // ELIMINAR Y EDITAR
  // ---------------------------

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
      await renderTable(); // Recargar la tabla
    }
  }

  async function handleEdit(e) {
    const carId = parseInt(e.target.dataset.id);
    try {
      const carToEdit = await getCarById(carId);
      
      // Llenar el formulario
      document.getElementById("marca").value = carToEdit.marca;
      document.getElementById("modelo").value = carToEdit.modelo;
      document.getElementById("anio").value = carToEdit.anio;
      document.getElementById("color").value = carToEdit.color;
      
      // Establecer el ID en el campo oculto y cambiar el botón
      carIdInput.value = carId;
      saveCarBtn.textContent = "Actualizar Auto";

    } catch (error) {
      console.error("Error al cargar auto para edición:", error);
      alert("Auto no encontrado para edición.");
    }
  }

  // Carga inicial de datos
  renderTable();
});
