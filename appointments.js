let appointments = [];

/**
 * Handles the submission of the appointment form.
 *
 * @param {Event} event - The event object representing the form submission.
 * @return {void} This function does not return anything.
 */
function handleAppointmentSubmit(event) {
    event.preventDefault();
    try {
        const doctorId = document.getElementById('doctorSelect').value;
        const time = document.getElementById('time').value;
        
        if (!doctorId || !time) throw new Error('Todos los campos son obligatorios');
        
        if (time < new Date().toISOString().split('T')[0]) {
            showErrorModal('Error','La fecha debe ser mayor a la fecha actual');
            time.innerHTML = ""; // Limpiar opciones anteriores para que cambie la fecha
            return; 
        }else{
            const appointment = {
                id: Date.now(),
                doctorId: parseInt(doctorId),
                time
            };
            appointments.push(appointment);
            updateAppointmentHistory();
            showModal('Exito','Cita reservada con éxito');
        }
    } catch (error) {
        console.error('Error reservando la cita:', error);
        showErrorModal('Error','Hubo un error al reservar la cita. Por favor, inténtelo más tarde.');
    }
}

/**
 * Updates the appointment history section on the webpage with the list of appointments.
 *
 * @return {void} This function does not return anything.
 */
function updateAppointmentHistory() {

    const historySection = document.getElementById('appointment-history');
    historySection.innerHTML = '<h2>Historial de Citas</h2>';

    if (appointments.length > 0) {
        historySection.style.display = 'block';
    }

    appointments.forEach(appointment => {
        const doctor = getDoctorById(appointment.doctorId);
        if (doctor) {
            const appointmentDiv = document.createElement('div');
            appointmentDiv.classList.add('appointment');
            appointmentDiv.innerHTML = `
                <p>Cita <br>#${appointment.id}</p>
                <p>Doctor: ${doctor.nombre}</p>
                <p>Especialidad: ${doctor.especialidad}</p>
                <p>Fecha y hora: ${new Date(appointment.time).toLocaleString()}</p>
            `;
            historySection.appendChild(appointmentDiv);
        }
    });
}

/**
 * Retrieves a doctor object from the local storage based on the provided doctor ID.
 *
 * @param {number} doctorId - The ID of the doctor to retrieve.
 * @return {Object|undefined} The doctor object with the matching ID, or undefined if not found.
 */
function getDoctorById(doctorId) {
    const doctors = JSON.parse(localStorage.getItem('doctors'));
    return doctors.find(doctor => doctor.id === doctorId);
}
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