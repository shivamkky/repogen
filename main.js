// Toast Notification Function
function showToast(title, description) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.innerHTML = `
        <div class="toast-title">${title}</div>
        <div class="toast-description">${description}</div>
    `;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/* -------------------------
   Local Storage Helpers
   ------------------------- */
const REPORTS_KEY = 'communityfix_reports';

function getStoredReports() {
    try {
        const raw = localStorage.getItem(REPORTS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (err) {
        console.error('Failed to read reports from localStorage', err);
        return [];
    }
}

function saveReportToStorage(report) {
    try {
        const reports = getStoredReports();
        reports.unshift(report); // newest first
        localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
    } catch (err) {
        console.error('Failed to save report to localStorage', err);
    }
}

/* -------------------------
   Auth Page - Tab Switching
   ------------------------- */
if (document.querySelector('.tabs')) {
    const tabTriggers = document.querySelectorAll('.tab-trigger');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const tabName = trigger.getAttribute('data-tab');
            
            // Remove active class from all triggers and contents
            tabTriggers.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked trigger and corresponding content
            trigger.classList.add('active');
            document.getElementById(tabName).classList.add('active');
        });
    });
}

/* -------------------------
   Auth Page - Login Form
   ------------------------- */
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = loginForm.querySelector('button[type="submit"]');
        btn.classList.add('loading');
        btn.disabled = true;
        
        // Basic validation (non-empty)
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value.trim();
        if (!email || !password) {
            showToast('Validation error', 'Please enter email and password');
            btn.classList.remove('loading');
            btn.disabled = false;
            return;
        }

        setTimeout(() => {
            showToast('Welcome back!', "You've successfully logged in.");
            window.location.href = 'dashboard.html';
        }, 600);
    });
}

/* -------------------------
   Auth Page - Register Form
   ------------------------- */
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = registerForm.querySelector('button[type="submit"]');
        btn.classList.add('loading');
        btn.disabled = true;
        
        // Basic validation (non-empty)
        const username = document.getElementById('register-username').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value.trim();
        if (!username || !email || !password) {
            showToast('Validation error', 'Please fill all fields');
            btn.classList.remove('loading');
            btn.disabled = false;
            return;
        }

        setTimeout(() => {
            showToast('Account created!', 'Welcome to CommunityFix. You can now start reporting issues.');
            window.location.href = 'dashboard.html';
        }, 700);
    });
}

/* -------------------------
   Dropdown Toggle
   ------------------------- */
const dropdownTriggers = document.querySelectorAll('.dropdown-trigger');
dropdownTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const dropdown = trigger.closest('.dropdown');
        dropdown.classList.toggle('active');
    });
});

// Close dropdown when clicking outside
document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown').forEach(dropdown => {
        dropdown.classList.remove('active');
    });
});

/* -------------------------
   Dashboard - File Upload Functionality
   ------------------------- */
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const filesContainer = document.getElementById('filesContainer');
const filesGrid = document.getElementById('filesGrid');
const fileCount = document.getElementById('fileCount');
const clearAllBtn = document.getElementById('clearAllBtn');
const submitBtn = document.getElementById('submitBtn');

let selectedFiles = [];

if (uploadArea && fileInput) {
    // Click to upload
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    // Drag and drop events
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragging');
    });
    
    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragging');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragging');
        
        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    });
    
    // File input change
    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        handleFiles(files);
        // Reset input so same file can be re-selected if needed
        fileInput.value = '';
    });
    
    // Clear all button
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', () => {
            selectedFiles = [];
            updateFilesDisplay();
        });
    }
    
    // Submit button
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            if (selectedFiles.length === 0) {
                showToast('No files selected', 'Please select at least one image to upload');
                return;
            }
            
            showToast('Report submitted!', `${selectedFiles.length} image(s) uploaded successfully`);
            
            // Reset after submission
            setTimeout(() => {
                selectedFiles = [];
                updateFilesDisplay();
            }, 1000);
        });
    }
}

function handleFiles(files) {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
        showToast('Invalid files detected', 'Only image files are allowed');
    }
    
    // Enforce per-file size limit: 10MB
    const tooLarge = imageFiles.some(f => f.size > 10 * 1024 * 1024);
    if (tooLarge) {
        showToast('File too large', 'One or more files exceed the 10MB limit');
        return;
    }

    selectedFiles = [...selectedFiles, ...imageFiles];
    updateFilesDisplay();
}

function updateFilesDisplay() {
    if (!filesGrid || !filesContainer) return;
    
    if (selectedFiles.length === 0) {
        filesContainer.style.display = 'none';
        return;
    }
    
    filesContainer.style.display = 'block';
    fileCount.textContent = selectedFiles.length;
    
    filesGrid.innerHTML = '';
    
    selectedFiles.forEach((file, index) => {
        const fileURL = URL.createObjectURL(file);
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <img src="${fileURL}" alt="Preview ${index + 1}" class="file-image">
            <button class="file-remove" data-index="${index}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
            <div class="file-info">
                <p class="file-name">${file.name}</p>
            </div>
        `;
        
        filesGrid.appendChild(fileItem);
        
        // Add remove functionality
        const removeBtn = fileItem.querySelector('.file-remove');
        removeBtn.addEventListener('click', () => {
            // Remove by index value current snapshot
            selectedFiles.splice(index, 1);
            updateFilesDisplay();
        });
    });
}

/* -------------------------
   Support Page - Accordion
   ------------------------- */
const accordionTriggers = document.querySelectorAll('.accordion-trigger');
accordionTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
        const item = trigger.closest('.accordion-item');
        const isActive = item.classList.contains('active');
        
        // Close all accordion items
        document.querySelectorAll('.accordion-item').forEach(i => {
            i.classList.remove('active');
        });
        
        // Toggle current item
        if (!isActive) {
            item.classList.add('active');
        }
    });
});

/* -------------------------
   Manual Complaint Form Logic
   ------------------------- */
const manualForm = document.getElementById('manualForm');
if (manualForm) {
    const departmentSelect = document.getElementById('department');
    const otherDeptGroup = document.getElementById('otherDeptGroup');
    const otherDeptInput = document.getElementById('otherDept');

    // Show/hide "other department" input when 'Others' selected
    departmentSelect.addEventListener('change', () => {
        if (departmentSelect.value === 'others') {
            otherDeptGroup.style.display = 'block';
            otherDeptInput.required = true;
        } else {
            otherDeptGroup.style.display = 'none';
            otherDeptInput.required = false;
            otherDeptInput.value = '';
        }
    });

    manualForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = manualForm.querySelector('button[type="submit"]');
        btn.classList.add('loading');
        btn.disabled = true;

        const problem = document.getElementById('problem').value.trim();
        const department = departmentSelect.value;
        const otherDept = otherDeptInput.value.trim();
        const locationText = document.getElementById('locationText').value.trim();

        // Basic validation
        if (!problem) {
            showToast('Validation error', 'Please describe the problem');
            btn.classList.remove('loading');
            btn.disabled = false;
            return;
        }
        if (!department) {
            showToast('Validation error', 'Please choose a department');
            btn.classList.remove('loading');
            btn.disabled = false;
            return;
        }
        if (department === 'others' && !otherDept) {
            showToast('Validation error', 'Please specify the department under "Others"');
            btn.classList.remove('loading');
            btn.disabled = false;
            return;
        }
        if (!locationText) {
            showToast('Validation error', 'Please enter a location');
            btn.classList.remove('loading');
            btn.disabled = false;
            return;
        }

        // Build report object
        const report = {
            id: 'rpt_' + Date.now(),
            type: 'manual',
            problem: problem,
            department: department === 'others' ? otherDept : department,
            rawDepartmentValue: department,
            location: locationText,
            date: new Date().toISOString(),
            status: 'Submitted'
        };

        // Save to localStorage
        saveReportToStorage(report);

        // Show confirmation and redirect to My Reports so user can see it
        setTimeout(() => {
            showToast('Report submitted!', 'Your manual complaint was submitted successfully.');
            manualForm.reset();
            otherDeptGroup.style.display = 'none';
            btn.classList.remove('loading');
            btn.disabled = false;

            // Redirect to My Reports page to view saved report
            setTimeout(() => {
                window.location.href = 'my-reports.html';
            }, 600);
        }, 600);
    });
}
