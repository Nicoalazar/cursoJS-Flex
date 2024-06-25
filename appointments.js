document.addEventListener('DOMContentLoaded', () => {
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            localStorage.setItem('doctors', JSON.stringify(data.doctors));
            populateSpecialtySelect(data.doctors);
            setupSearchForm(data.doctors);
            setupAppointmentForm(data.doctors);
        })
        .catch(error => console.error('Error fetching data:', error));
});

/**
 * Populates a select element with options for each unique specialty among the given doctors.
 *
 * @param {Array<Object>} doctors - An array of objects representing doctors, each with a 'especialidad' property.
 * @return {void} This function does not return anything.
 */
function populateSpecialtySelect(doctors) {
    const specialtySelect = document.getElementById("especialidad");
    const specialties = new Set(doctors.map(doctor => doctor.especialidad));
    const sortedSpecialties = Array.from(specialties).sort();

    sortedSpecialties.forEach(specialty => {
        const option = document.createElement('option');
        option.value = specialty;
        option.textContent = specialty;
        specialtySelect.appendChild(option);
    });
}

/**
 * Sets up the search form functionality, including event listener for form submission, filtering doctors based on specialty and coverage, and displaying available and not available doctors.
 *
 * @param {Array<Object>} doctors - An array of objects representing doctors with properties 'especialidad', 'os', 'available', 'id', and 'nombre'.
 * @return {void} This function does not return anything.
 */
function setupSearchForm(doctors) {
    document.getElementById("searchForm").addEventListener("submit", function(event) {
        event.preventDefault();

        const especialidad = document.getElementById("especialidad").value;
        const coverage = document.querySelector('input[name="coverage"]:checked').value;
        const user = "paciente"; 

        const filteredDoctors = doctors.filter(doctor => doctor.especialidad === especialidad && (coverage === "Si" ? doctor.os : !doctor.os));
        const availableDoctors = filteredDoctors.filter(doctor => doctor.available);
        const notAvailableDoctors = filteredDoctors.filter(doctor => !doctor.available);
        const resultContainer = document.getElementById("resultContainer");
        resultContainer.innerHTML = "";

        if (especialidad !== "default") {
            if (filteredDoctors.length === 0) {
                const noDoctor = document.createElement("p");
                noDoctor.textContent = `¡Disculpas estimado ${user}! Actualmente no hay médicos disponibles. Pruebe con otra cobertura.`;
                resultContainer.appendChild(noDoctor);

                const doctorSelect = document.getElementById("doctorSelect");
                doctorSelect.innerHTML = ""; 
                const selectAppointment = document.getElementById("selectAppointment");
                selectAppointment.style.display = "none"; 
                const list = document.getElementById("notAvailableMessage");
                list.innerHTML = ""; 
            } 
            else {
                if (availableDoctors.length !== 0) {
                    const title = document.createElement("p");
                    title.textContent = `Estimado ${user}, los médicos de ${especialidad} disponibles son: `;
                    resultContainer.appendChild(title);

                    const doctorSelect = document.getElementById("doctorSelect");
                    doctorSelect.innerHTML = ""; 
                    const selectAppointment = document.getElementById("selectAppointment");
                    selectAppointment.style.display = "none"; 
                    const list = document.getElementById("notAvailableMessage");
                    list.innerHTML = ""; 
                    
                    availableDoctors.forEach(doctor => {
                        const option = document.createElement("option");
                        option.value = doctor.id;
                        option.textContent = doctor.nombre;
                        doctorSelect.appendChild(option);
                    });

                    document.getElementById("selectAppointment").style.display = "block";
                } else {
                    const title = document.createElement("p");
                    title.textContent = `Estimado ${user}, lamentablemente los siguientes médicos de ${especialidad} tienen la agenda cerrada, intente en otro momento.`;
                    resultContainer.appendChild(title);

                    const doctorSelect = document.getElementById("doctorSelect");
                    doctorSelect.innerHTML = ""; 
                    const selectAppointment = document.getElementById("selectAppointment");
                    selectAppointment.style.display = "none"; 
                    const list = document.getElementById("notAvailableMessage");
                    list.innerHTML = ""; 

                    notAvailableDoctors.forEach(doctor => {
                        const li = document.createElement("li");
                        li.textContent = doctor.nombre;
                        document.getElementById("notAvailableMessage").appendChild(li);
                    });

                    document.getElementById("notAvailableMessage").style.display = "block";
                }
            } 
        } else {
            showErrorModal("Error", "Por favor, seleccione una especialidad.");
        }
    });
}

/**
 * Sets up the appointment form by adding an event listener to the submit event.
 *
 * @param {Array} doctors - An array of doctor objects.
 * @return {void} This function does not return anything.
 */
function setupAppointmentForm(doctors) {
    const appointmentForm = document.getElementById("selectAppointment");
    const dateInput = document.getElementById("time");

    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);

    appointmentForm.addEventListener("submit", handleAppointmentSubmit);
}

/**
 * Handles the submission of an appointment form, confirms the reservation, and adds the appointment to history.
 *
 * @param {Event} event - The event object triggered by the form submission.
 * @return {void} This function does not return anything.
 */
function handleAppointmentSubmit(event) {
    event.preventDefault();

    const doctorSelect = document.getElementById("doctorSelect");
    const doctorId = doctorSelect.value;
    const dateInput = document.getElementById("time");
    const date = dateInput.value;
    
    if (date) {
        Swal.fire({
            title: 'Confirmar Reserva',
            text: `¿Estás seguro de que quieres reservar una cita el ${date}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, reservar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire(
                    '¡Reservado!',
                    'Tu cita ha sido reservada.',
                    'success'
                );
                addAppointmentToHistory(doctorId, date);
            }
        });
    } else {
        Swal.fire(
            'Error',
            'Por favor, selecciona una fecha.',
            'error'
        );
    }
}

/**
 * Displays an error modal with the given title and message.
 *
 * @param {string} title - The title of the error modal.
 * @param {string} message - The error message to be displayed in the modal.
 * @return {void} This function does not return anything.
 */
function showErrorModal(title, message) {
    Swal.fire({
        title: title,
        text: message,
        icon: 'error',
        confirmButtonText: 'OK'
    });
}

/**
 * Adds an appointment to the appointment history.
 *
 * @param {string} doctorId - The ID of the doctor.
 * @param {string} date - The date of the appointment.
 * @return {void} This function does not return anything.
 */
function addAppointmentToHistory(doctorId, date) {
    const doctors = JSON.parse(localStorage.getItem('doctors'));
    const doctor = doctors.find(d => d.id == doctorId);
    
    const appointmentHistory = document.getElementById("appointment-history");
    const historyList = document.createElement("ul");
    const listItem = document.createElement("li");
    listItem.textContent = `Dr. ${doctor.nombre} - ${date}`;
    historyList.appendChild(listItem);
    appointmentHistory.appendChild(historyList);
    appointmentHistory.style.display = "block";
}

/**
 * Clears the coverage by resetting the result container, doctor select, select appointment, and not available message.
 *
 * @return {void} This function does not return anything.
 */
function clearCoverage() {
    const result = document.getElementById("resultContainer");
    result.innerHTML = ""; // Limpiar opciones anteriores
    const doctorSelect = document.getElementById("doctorSelect");
    doctorSelect.innerHTML = ""; // Limpiar opciones anteriores
    const selectAppointment = document.getElementById("selectAppointment");
    selectAppointment.style.display = "none"; // Ocultar formulario de reserva de turno
    const list = document.getElementById("notAvailableMessage");
    list.innerHTML = ""; // Limpiar opciones anteriores
}
