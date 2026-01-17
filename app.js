// Time Tracker Pro - Main Application Logic

class TimeTracker {
    constructor() {
        this.persons = this.loadFromStorage('persons') || [];
        this.records = this.loadFromStorage('records') || [];
        this.timers = {};
        this.isAdmin = false;
        this.adminPassword = 'adminMm'; // Admin password

        this.initializeElements();
        this.bindEvents();
        this.render();
        this.startTimerUpdates();
        this.setDefaultDates();
    }

    // Initialize DOM elements
    initializeElements() {
        this.personNameInput = document.getElementById('personName');
        this.addPersonBtn = document.getElementById('addPersonBtn');
        this.personsGrid = document.getElementById('personsGrid');
        this.emptyState = document.getElementById('emptyState');
        this.activeCount = document.getElementById('activeCount');
        this.recordsBody = document.getElementById('recordsBody');
        this.emptyRecords = document.getElementById('emptyRecords');
        this.summaryCards = document.getElementById('summaryCards');
        this.exportPdfBtn = document.getElementById('exportPdfBtn');
        this.exportModal = document.getElementById('exportModal');
        this.closeModal = document.getElementById('closeModal');
        this.cancelExport = document.getElementById('cancelExport');
        this.confirmExport = document.getElementById('confirmExport');
        this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
        this.startDateInput = document.getElementById('startDate');
        this.endDateInput = document.getElementById('endDate');
        this.reportTitleInput = document.getElementById('reportTitle');

        // Admin elements
        this.adminToggleBtn = document.getElementById('adminToggleBtn');
        this.adminBtnText = document.getElementById('adminBtnText');
        this.adminModal = document.getElementById('adminModal');
        this.closeAdminModal = document.getElementById('closeAdminModal');
        this.cancelAdmin = document.getElementById('cancelAdmin');
        this.confirmAdmin = document.getElementById('confirmAdmin');
        this.adminPasswordInput = document.getElementById('adminPassword');

        // Edit modal elements
        this.editModal = document.getElementById('editModal');
        this.closeEditModal = document.getElementById('closeEditModal');
        this.cancelEdit = document.getElementById('cancelEdit');
        this.confirmEdit = document.getElementById('confirmEdit');
        this.editRecordId = document.getElementById('editRecordId');
        this.editPersonName = document.getElementById('editPersonName');
        this.editDate = document.getElementById('editDate');
        this.editClockIn = document.getElementById('editClockIn');
        this.editClockOut = document.getElementById('editClockOut');
    }

    // Bind event listeners
    bindEvents() {
        this.addPersonBtn.addEventListener('click', () => this.addPerson());
        this.personNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addPerson();
        });

        this.exportPdfBtn.addEventListener('click', () => this.openExportModal());
        this.closeModal.addEventListener('click', () => this.closeExportModal());
        this.cancelExport.addEventListener('click', () => this.closeExportModal());
        this.confirmExport.addEventListener('click', () => this.exportToPdf());

        this.clearHistoryBtn.addEventListener('click', () => this.clearAllRecords());

        // Close modal on overlay click
        this.exportModal.addEventListener('click', (e) => {
            if (e.target === this.exportModal) this.closeExportModal();
        });

        // Admin modal events
        this.adminToggleBtn.addEventListener('click', () => this.toggleAdmin());
        this.closeAdminModal.addEventListener('click', () => this.closeAdminModalFn());
        this.cancelAdmin.addEventListener('click', () => this.closeAdminModalFn());
        this.confirmAdmin.addEventListener('click', () => this.loginAdmin());
        this.adminPasswordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.loginAdmin();
        });
        this.adminModal.addEventListener('click', (e) => {
            if (e.target === this.adminModal) this.closeAdminModalFn();
        });

        // Edit modal events
        this.closeEditModal.addEventListener('click', () => this.closeEditModalFn());
        this.cancelEdit.addEventListener('click', () => this.closeEditModalFn());
        this.confirmEdit.addEventListener('click', () => this.saveRecordEdit());
        this.editModal.addEventListener('click', (e) => {
            if (e.target === this.editModal) this.closeEditModalFn();
        });
    }

    // Set default dates for export
    setDefaultDates() {
        const today = new Date();
        const threeWeeksAgo = new Date(today);
        threeWeeksAgo.setDate(today.getDate() - 21);

        this.startDateInput.value = this.formatDateForInput(threeWeeksAgo);
        this.endDateInput.value = this.formatDateForInput(today);
    }

    // Format date for input field (using local timezone)
    formatDateForInput(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Add new person
    addPerson() {
        const name = this.personNameInput.value.trim();
        if (!name) return;

        // Check for duplicate
        if (this.persons.some(p => p.name.toLowerCase() === name.toLowerCase())) {
            alert('This person already exists!');
            return;
        }

        const person = {
            id: Date.now().toString(),
            name: name,
            isActive: false,
            clockInTime: null
        };

        this.persons.push(person);
        this.saveToStorage('persons', this.persons);
        this.personNameInput.value = '';
        this.render();
    }

    // Remove person
    removePerson(personId) {
        if (!confirm('Are you sure you want to remove this person? Their active session will be lost.')) return;

        // Clear timer if active
        if (this.timers[personId]) {
            clearInterval(this.timers[personId]);
            delete this.timers[personId];
        }

        this.persons = this.persons.filter(p => p.id !== personId);
        this.saveToStorage('persons', this.persons);
        this.render();
    }

    // Clock In
    clockIn(personId) {
        const person = this.persons.find(p => p.id === personId);
        if (!person || person.isActive) return;

        person.isActive = true;
        person.clockInTime = Date.now();
        this.saveToStorage('persons', this.persons);
        this.render();
    }

    // Clock Out
    clockOut(personId) {
        const person = this.persons.find(p => p.id === personId);
        if (!person || !person.isActive) return;

        const clockOutTime = Date.now();
        const duration = clockOutTime - person.clockInTime;

        // Create record
        const record = {
            id: Date.now().toString(),
            personId: person.id,
            personName: person.name,
            date: this.formatDate(person.clockInTime),
            clockIn: this.formatTime(person.clockInTime),
            clockOut: this.formatTime(clockOutTime),
            clockInTimestamp: person.clockInTime,
            clockOutTimestamp: clockOutTime,
            duration: duration,
            durationFormatted: this.formatDuration(duration)
        };

        this.records.unshift(record);
        this.saveToStorage('records', this.records);

        // Reset person state
        person.isActive = false;
        person.clockInTime = null;
        this.saveToStorage('persons', this.persons);

        this.render();
    }

    // Delete record
    deleteRecord(recordId) {
        if (!confirm('Are you sure you want to delete this record?')) return;

        this.records = this.records.filter(r => r.id !== recordId);
        this.saveToStorage('records', this.records);
        this.render();
    }

    // Clear all records
    clearAllRecords() {
        if (!confirm('Are you sure you want to clear ALL time records? This cannot be undone.')) return;

        this.records = [];
        this.saveToStorage('records', this.records);
        this.render();
    }

    // Format date
    formatDate(timestamp) {
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Format time
    formatTime(timestamp) {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }

    // Format duration
    formatDuration(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Format hours for summary
    formatHours(ms) {
        const hours = ms / (1000 * 60 * 60);
        return hours.toFixed(2);
    }

    // Get elapsed time for active session
    getElapsedTime(clockInTime) {
        return Date.now() - clockInTime;
    }

    // Start timer updates
    startTimerUpdates() {
        setInterval(() => {
            this.persons.forEach(person => {
                if (person.isActive) {
                    const timerElement = document.querySelector(`[data-timer="${person.id}"]`);
                    if (timerElement) {
                        timerElement.textContent = this.formatDuration(this.getElapsedTime(person.clockInTime));
                    }
                }
            });
            this.updateActiveCount();
        }, 1000);
    }

    // Update active count
    updateActiveCount() {
        const activePersons = this.persons.filter(p => p.isActive).length;
        this.activeCount.textContent = `${activePersons} Active`;
    }

    // Calculate summary
    calculateSummary() {
        const summary = {};

        this.records.forEach(record => {
            if (!summary[record.personId]) {
                summary[record.personId] = {
                    name: record.personName,
                    totalMs: 0
                };
            }
            summary[record.personId].totalMs += record.duration;
        });

        return Object.values(summary);
    }

    // Render all components
    render() {
        this.renderPersons();
        this.renderRecords();
        this.renderSummary();
        this.updateActiveCount();
    }

    // Render persons grid
    renderPersons() {
        if (this.persons.length === 0) {
            this.personsGrid.innerHTML = '';
            this.emptyState.classList.remove('hidden');
            return;
        }

        this.emptyState.classList.add('hidden');

        this.personsGrid.innerHTML = this.persons.map(person => `
            <div class="person-card ${person.isActive ? 'active' : ''}" data-person-id="${person.id}">
                <div class="person-header">
                    <div class="person-info">
                        <div class="person-avatar">${person.name.charAt(0)}</div>
                        <div>
                            <div class="person-name">${this.escapeHtml(person.name)}</div>
                            <div class="person-status">
                                <span class="status-dot ${person.isActive ? 'active' : ''}"></span>
                                ${person.isActive ? 'Working' : 'Not clocked in'}
                            </div>
                        </div>
                    </div>
                    <button class="remove-person" onclick="tracker.removePerson('${person.id}')" title="Remove person">✕</button>
                </div>
                <div class="timer-display">
                    <div class="timer-value" data-timer="${person.id}">
                        ${person.isActive ? this.formatDuration(this.getElapsedTime(person.clockInTime)) : '00:00:00'}
                    </div>
                    <div class="timer-label">${person.isActive ? 'Time Elapsed' : 'Ready to clock in'}</div>
                </div>
                <div class="person-actions">
                    ${person.isActive ? `
                        <button class="btn btn-danger btn-lg" onclick="tracker.clockOut('${person.id}')">
                            <span class="btn-icon">⏹️</span>
                            Clock OUT
                        </button>
                    ` : `
                        <button class="btn btn-success btn-lg" onclick="tracker.clockIn('${person.id}')">
                            <span class="btn-icon">▶️</span>
                            Clock IN
                        </button>
                    `}
                </div>
            </div>
        `).join('');
    }

    // Render records table
    renderRecords() {
        if (this.records.length === 0) {
            this.recordsBody.innerHTML = '';
            this.emptyRecords.classList.remove('hidden');
            document.querySelector('.records-table thead').style.display = 'none';
            return;
        }

        this.emptyRecords.classList.add('hidden');
        document.querySelector('.records-table thead').style.display = 'table-header-group';

        this.recordsBody.innerHTML = this.records.map(record => `
            <tr>
                <td><strong>${this.escapeHtml(record.personName)}</strong></td>
                <td>${record.date}</td>
                <td>${record.clockIn}</td>
                <td>${record.clockOut}</td>
                <td class="duration-cell">${record.durationFormatted}</td>
                <td>
                    ${this.isAdmin ? `
                        <button class="edit-record" onclick="tracker.openEditModal('${record.id}')" title="Edit record">
                            ✏️
                        </button>
                    ` : ''}
                    <button class="delete-record" onclick="tracker.deleteRecord('${record.id}')" title="Delete record">
                        🗑️
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // Render summary cards
    renderSummary() {
        const summary = this.calculateSummary();

        if (summary.length === 0) {
            this.summaryCards.innerHTML = '<p style="color: var(--text-muted); padding: 20px;">No data to summarize yet.</p>';
            return;
        }

        this.summaryCards.innerHTML = summary.map(item => `
            <div class="summary-card">
                <div class="summary-avatar">${item.name.charAt(0)}</div>
                <div class="summary-info">
                    <h4>${this.escapeHtml(item.name)}</h4>
                    <div class="summary-hours">
                        ${this.formatDuration(item.totalMs)}
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Open export modal
    openExportModal() {
        this.exportModal.classList.add('active');
    }

    // Close export modal
    closeExportModal() {
        this.exportModal.classList.remove('active');
    }

    // Toggle admin mode
    toggleAdmin() {
        if (this.isAdmin) {
            this.logoutAdmin();
        } else {
            this.openAdminModal();
        }
    }

    // Open admin modal
    openAdminModal() {
        this.adminPasswordInput.value = '';
        this.adminModal.classList.add('active');
        this.adminPasswordInput.focus();
    }

    // Close admin modal
    closeAdminModalFn() {
        this.adminModal.classList.remove('active');
    }

    // Login as admin
    loginAdmin() {
        const password = this.adminPasswordInput.value;
        if (password === this.adminPassword) {
            this.isAdmin = true;
            document.body.classList.add('admin-mode');
            this.adminBtnText.textContent = 'Logout Admin';
            this.adminToggleBtn.querySelector('.btn-icon').textContent = '🔓';
            this.closeAdminModalFn();
            this.render();
        } else {
            alert('Incorrect password!');
            this.adminPasswordInput.value = '';
            this.adminPasswordInput.focus();
        }
    }

    // Logout admin
    logoutAdmin() {
        this.isAdmin = false;
        document.body.classList.remove('admin-mode');
        this.adminBtnText.textContent = 'Admin Login';
        this.adminToggleBtn.querySelector('.btn-icon').textContent = '🔒';
        this.render();
    }

    // Open edit modal
    openEditModal(recordId) {
        const record = this.records.find(r => r.id === recordId);
        if (!record) return;

        this.editRecordId.value = recordId;
        this.editPersonName.value = record.personName;

        // Parse the date from the record
        const clockInDate = new Date(record.clockInTimestamp);
        this.editDate.value = this.formatDateForInput(clockInDate);

        // Format times for time inputs
        const clockIn = new Date(record.clockInTimestamp);
        const clockOut = new Date(record.clockOutTimestamp);
        this.editClockIn.value = `${String(clockIn.getHours()).padStart(2, '0')}:${String(clockIn.getMinutes()).padStart(2, '0')}`;
        this.editClockOut.value = `${String(clockOut.getHours()).padStart(2, '0')}:${String(clockOut.getMinutes()).padStart(2, '0')}`;

        this.editModal.classList.add('active');
    }

    // Close edit modal
    closeEditModalFn() {
        this.editModal.classList.remove('active');
    }

    // Save record edit
    saveRecordEdit() {
        const recordId = this.editRecordId.value;
        const record = this.records.find(r => r.id === recordId);
        if (!record) return;

        // Parse the new values
        const dateParts = this.editDate.value.split('-');
        const clockInParts = this.editClockIn.value.split(':');
        const clockOutParts = this.editClockOut.value.split(':');

        const newClockIn = new Date(
            parseInt(dateParts[0]),
            parseInt(dateParts[1]) - 1,
            parseInt(dateParts[2]),
            parseInt(clockInParts[0]),
            parseInt(clockInParts[1]),
            0, 0
        );

        const newClockOut = new Date(
            parseInt(dateParts[0]),
            parseInt(dateParts[1]) - 1,
            parseInt(dateParts[2]),
            parseInt(clockOutParts[0]),
            parseInt(clockOutParts[1]),
            0, 0
        );

        // Validate clock out is after clock in
        if (newClockOut <= newClockIn) {
            alert('Clock out time must be after clock in time!');
            return;
        }

        // Update record
        record.clockInTimestamp = newClockIn.getTime();
        record.clockOutTimestamp = newClockOut.getTime();
        record.date = this.formatDate(newClockIn.getTime());
        record.clockIn = this.formatTime(newClockIn.getTime());
        record.clockOut = this.formatTime(newClockOut.getTime());
        record.duration = newClockOut.getTime() - newClockIn.getTime();
        record.durationFormatted = this.formatDuration(record.duration);

        this.saveToStorage('records', this.records);
        this.closeEditModalFn();
        this.render();
        alert('Record updated successfully!');
    }

    // Export to PDF
    exportToPdf() {
        try {
            // Access jsPDF correctly from the global jspdf object
            const jsPDF = window.jspdf.jsPDF;

            // Parse dates as LOCAL dates (not UTC)
            const startParts = this.startDateInput.value.split('-');
            const endParts = this.endDateInput.value.split('-');

            const startDate = new Date(
                parseInt(startParts[0]),
                parseInt(startParts[1]) - 1,
                parseInt(startParts[2]),
                0, 0, 0, 0
            );
            const endDate = new Date(
                parseInt(endParts[0]),
                parseInt(endParts[1]) - 1,
                parseInt(endParts[2]),
                23, 59, 59, 999
            );

            const reportTitle = this.reportTitleInput.value || 'Time Tracking Report';

            // Filter records by date range
            const filteredRecords = this.records.filter(record => {
                const recordDate = new Date(record.clockInTimestamp);
                return recordDate >= startDate && recordDate <= endDate;
            });

            // Calculate summary for filtered records
            const summary = {};
            filteredRecords.forEach(record => {
                if (!summary[record.personId]) {
                    summary[record.personId] = {
                        name: record.personName,
                        totalMs: 0,
                        sessions: 0
                    };
                }
                summary[record.personId].totalMs += record.duration;
                summary[record.personId].sessions++;
            });

            // Create PDF
            const doc = new jsPDF();
            let yPos = 20;

            // Header
            doc.setFontSize(22);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(99, 102, 241);
            doc.text(reportTitle, 105, yPos, { align: 'center' });
            yPos += 12;

            // Date range
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 100);
            const dateRangeText = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
            doc.text(dateRangeText, 105, yPos, { align: 'center' });
            yPos += 8;

            // Generated date
            doc.setFontSize(9);
            doc.text(`Generated: ${new Date().toLocaleString()}`, 105, yPos, { align: 'center' });
            yPos += 15;

            // Divider line
            doc.setDrawColor(200, 200, 200);
            doc.line(14, yPos, 196, yPos);
            yPos += 10;

            // Summary section title
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(40, 40, 40);
            doc.text('HOURS SUMMARY BY PERSON', 14, yPos);
            yPos += 10;

            // Summary table header
            doc.setFillColor(99, 102, 241);
            doc.rect(14, yPos, 182, 8, 'F');
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(255, 255, 255);
            doc.text('Name', 18, yPos + 6);
            doc.text('Sessions', 80, yPos + 6);
            doc.text('Total Hours', 120, yPos + 6);
            doc.text('Duration', 160, yPos + 6);
            yPos += 10;

            // Summary rows
            doc.setFont('helvetica', 'normal');
            const summaryItems = Object.values(summary);
            let totalMs = 0;
            let totalSessions = 0;

            summaryItems.forEach((item, index) => {
                // Alternate row colors
                if (index % 2 === 0) {
                    doc.setFillColor(245, 245, 250);
                    doc.rect(14, yPos - 1, 182, 8, 'F');
                }

                doc.setTextColor(40, 40, 40);
                doc.text(item.name, 18, yPos + 5);
                doc.text(item.sessions.toString(), 80, yPos + 5);
                doc.text(this.formatHours(item.totalMs) + ' hrs', 120, yPos + 5);
                doc.text(this.formatDuration(item.totalMs), 160, yPos + 5);

                totalMs += item.totalMs;
                totalSessions += item.sessions;
                yPos += 8;
            });

            // Total row
            doc.setFillColor(16, 185, 129);
            doc.rect(14, yPos - 1, 182, 8, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(255, 255, 255);
            doc.text('TOTAL', 18, yPos + 5);
            doc.text(totalSessions.toString(), 80, yPos + 5);
            doc.text(this.formatHours(totalMs) + ' hrs', 120, yPos + 5);
            doc.text(this.formatDuration(totalMs), 160, yPos + 5);
            yPos += 15;

            // Detailed records section
            if (yPos > 220) {
                doc.addPage();
                yPos = 20;
            }

            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(40, 40, 40);
            doc.text('DETAILED TIME RECORDS', 14, yPos);
            yPos += 10;

            // Records table header
            doc.setFillColor(99, 102, 241);
            doc.rect(14, yPos, 182, 8, 'F');
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(255, 255, 255);
            doc.text('Name', 18, yPos + 6);
            doc.text('Date', 60, yPos + 6);
            doc.text('Clock In', 100, yPos + 6);
            doc.text('Clock Out', 135, yPos + 6);
            doc.text('Duration', 170, yPos + 6);
            yPos += 10;

            // Record rows
            doc.setFont('helvetica', 'normal');

            if (filteredRecords.length === 0) {
                doc.setTextColor(100, 100, 100);
                doc.text('No records found for the selected date range.', 18, yPos + 5);
            } else {
                filteredRecords.forEach((record, index) => {
                    // Check if we need a new page
                    if (yPos > 270) {
                        doc.addPage();
                        yPos = 20;

                        // Re-draw header on new page
                        doc.setFillColor(99, 102, 241);
                        doc.rect(14, yPos, 182, 8, 'F');
                        doc.setFontSize(9);
                        doc.setFont('helvetica', 'bold');
                        doc.setTextColor(255, 255, 255);
                        doc.text('Name', 18, yPos + 6);
                        doc.text('Date', 60, yPos + 6);
                        doc.text('Clock In', 100, yPos + 6);
                        doc.text('Clock Out', 135, yPos + 6);
                        doc.text('Duration', 170, yPos + 6);
                        yPos += 10;
                        doc.setFont('helvetica', 'normal');
                    }

                    // Alternate row colors
                    if (index % 2 === 0) {
                        doc.setFillColor(245, 245, 250);
                        doc.rect(14, yPos - 1, 182, 8, 'F');
                    }

                    doc.setTextColor(40, 40, 40);
                    doc.text(record.personName.substring(0, 15), 18, yPos + 5);
                    doc.text(record.date, 60, yPos + 5);
                    doc.text(record.clockIn, 100, yPos + 5);
                    doc.text(record.clockOut, 135, yPos + 5);
                    doc.setTextColor(99, 102, 241);
                    doc.text(record.durationFormatted, 170, yPos + 5);
                    yPos += 8;
                });
            }

            // Footer on each page
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                doc.text('Time Tracker Pro', 14, 287);
                doc.text(`Page ${i} of ${pageCount}`, 196, 287, { align: 'right' });
            }

            // Save PDF with simple filename
            const fileName = 'TimeReport.pdf';
            doc.save(fileName);

            this.closeExportModal();
            alert('PDF exported successfully!');

        } catch (error) {
            console.error('PDF Export Error:', error);
            alert('Error exporting PDF: ' + error.message);
        }
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Save to localStorage
    saveToStorage(key, data) {
        try {
            localStorage.setItem(`timeTracker_${key}`, JSON.stringify(data));
        } catch (e) {
            console.error('Error saving to localStorage:', e);
        }
    }

    // Load from localStorage
    loadFromStorage(key) {
        try {
            const data = localStorage.getItem(`timeTracker_${key}`);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error loading from localStorage:', e);
            return null;
        }
    }
}

// Initialize the app
const tracker = new TimeTracker();
