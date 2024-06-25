document.addEventListener('DOMContentLoaded', () => {
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            localStorage.setItem('doctors', JSON.stringify(data.doctors)); // Guardar datos de doctores en localStorage
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
 * Sets up the search form event listener and performs the search based on the selected specialty and coverage.
 *
 * @param {Array<Object>} doctors - An array of objects representing doctors, each with properties 'especialidad', 'available', and 'os'.
 * @return {void} This function does not return anything.
 */
function setupSearchForm(doctors) {
    document.getElementById("searchForm").addEventListener("submit", function(event) {
        event.preventDefault();

        const especialidad = document.getElementById("especialidad").value;
        const coverage = document.querySelector('input[name="coverage"]:checked').value;
        const user = "paciente"; // A reemplazar con el nombre del usuario cuando se implemente la autenticación

        if (especialidad === "default") {
            showErrorModal("Error", "Por favor, seleccione una especialidad.");
            return;
        }

        const filteredDoctors = doctors.filter(doctor => doctor.especialidad === especialidad && (coverage === "Si" ? doctor.os : !doctor.os));
        const notCoverageDoctors = doctors.filter(doctor => doctor.especialidad === especialidad && (coverage === "No"));
        const availableDoctors = filteredDoctors.filter(doctor => doctor.available);
        const notAvailableDoctors = filteredDoctors.filter(doctor => !doctor.available);

        const resultContainer = document.getElementById("resultContainer");
        const doctorSelect = document.getElementById("doctorSelect");
        const selectAppointment = document.getElementById("selectAppointment");
        const list = document.getElementById("notAvailableMessage");

        resultContainer.innerHTML = "";
        doctorSelect.innerHTML = "";
        selectAppointment.style.display = "none";
        list.innerHTML = "";

        if (filteredDoctors.length === 0) {
            showNoDoctorsMessage(user, resultContainer);
        } else {
            if (availableDoctors.length !== 0) {
                showAvailableDoctors(user, especialidad, coverage, availableDoctors, notCoverageDoctors, resultContainer, doctorSelect);
                selectAppointment.style.display = "block";
            } else {
                showNotAvailableDoctors(user, especialidad, notAvailableDoctors, resultContainer, list);
            }
        }
    });
}

/**
 * Displays a message indicating that there are no doctors available for the given user.
 *
 * @param {string} user - The name of the user.
 * @param {HTMLElement} resultContainer - The container element where the message will be appended.
 * @return {void} This function does not return anything.
 */
function showNoDoctorsMessage(user, resultContainer) {
    const noDoctor = document.createElement("p");
    noDoctor.textContent = `¡Disculpas estimado ${user}! Actualmente no hay médicos disponibles. Pruebe con otra cobertura.`;
    resultContainer.appendChild(noDoctor);
}

/**
 * Displays the available doctors to the user based on their selection of specialty and coverage.
 *
 * @param {string} user - The name of the user.
 * @param {string} especialidad - The selected specialty.
 * @param {string} coverage - The selected coverage option.
 * @param {Array<Object>} availableDoctors - An array of available doctors.
 * @param {Array<Object>} notCoverageDoctors - An array of doctors without coverage.
 * @param {HTMLElement} resultContainer - The container element to display the result.
 * @param {HTMLSelectElement} doctorSelect - The select element to populate with the available doctors.
 * @return {void} This function does not return anything.
 */
function showAvailableDoctors(user, especialidad, coverage, availableDoctors, notCoverageDoctors, resultContainer, doctorSelect) {
    const title = document.createElement("p");
    title.textContent = `Estimado ${user}, los médicos de ${especialidad} disponibles son: `;
    resultContainer.appendChild(title);

    const doctorsToShow = coverage === "No" ? notCoverageDoctors : availableDoctors;
    doctorsToShow.forEach(doctor => {
        const option = document.createElement("option");
        option.value = doctor.id;
        option.textContent = doctor.nombre;
        doctorSelect.appendChild(option);
    });
}

/**
 * Displays a message indicating that there are no doctors available for the given user.
 *
 * @param {string} user - The name of the user.
 * @param {string} especialidad - The selected specialty.
 * @param {Array<Object>} notAvailableDoctors - An array of doctors with closed schedules.
 * @param {HTMLElement} resultContainer - The container element where the message will be appended.
 * @param {HTMLElement} list - The list element where the names of the doctors will be appended.
 * @return {void} This function does not return anything.
 */
function showNotAvailableDoctors(user, especialidad, notAvailableDoctors, resultContainer, list) {
    const title = document.createElement("p");
    title.textContent = `Estimado ${user}, lamentablemente los siguientes médicos de ${especialidad} tienen la agenda cerrada, intente en otro momento.`;
    resultContainer.appendChild(title);

    notAvailableDoctors.forEach(doctor => {
        const li = document.createElement("li");
        li.textContent = doctor.nombre;
        list.appendChild(li);
    });

    list.style.display = "block";
}

/**
 * Sets up the appointment form event listener and handles the submission of the form.
 *
 * @param {Array<Object>} doctors - An array of objects representing doctors, each with properties 'especialidad', 'available', and 'os'.
 * @return {void} This function does not return anything.
 */
function setupAppointmentForm(doctors) {
    document.getElementById("selectAppointment").addEventListener("submit", handleAppointmentSubmit);
}
