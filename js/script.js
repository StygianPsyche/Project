// ---------- Utils ----------
const formContainer = document.getElementById('formContainer');
const requestTypeSelect = document.getElementById('requestTypeSelect');
const keyboard = document.getElementById('keyboard');
let currentInput = null;

function randRef() {
    // REF-YYYYMMDDHHMMSS-XXXX
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const ts = d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds());
    const rnd = Math.floor(1000 + Math.random() * 9000);
    return `REF-${ts}-${rnd}`;
}

function toUpperHandler(e) {
    // transform caret safe uppercase
    const start = e.target.selectionStart, end = e.target.selectionEnd;
    e.target.value = e.target.value.toUpperCase();
    try { e.target.setSelectionRange(start, end); } catch { }
}

// mark invalid UI
function markInvalid(el) {
    el.classList.add('is-required-invalid');
}
function unmarkInvalid(el) {
    el.classList.remove('is-required-invalid');
}

// find first invalid element and scroll/focus
function focusFirstInvalid(invalidElements) {
    if (!invalidElements || invalidElements.length === 0) return;
    const first = invalidElements[0];
    first.scrollIntoView({ behavior: 'smooth', block: 'center' });
    first.focus({ preventScroll: true });
}

// ---------- Templates ----------
// ---------- Templates ----------
function template_FORM1_COMMON(purposeLabel = 'PURPOSE:') {
    // shared among various Form 1 variants
    return `
        <div class="mb-3">
          <label class="form-label" for="purpose">${purposeLabel}</label>
          <input id="purpose" name="purpose" type="text" class="form-control" required>
        </div>
        <div class="mb-3">
          <label class="form-label" for="fullName">FULL NAME</label>
          <input id="fullName" name="fullName" type="text" class="form-control uppercase-required" placeholder="" required>
        </div>
        <div class="mb-3">
          <label class="form-label" for="address">ADDRESS</label>
          <input id="address" name="address" type="text" class="form-control uppercase-required" placeholder="" required>
        </div>
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label" for="date">DATE</label>
            <input id="date" name="date" type="date" class="form-control" required>
          </div>
          <div class="col-md-3 mb-3">
            <label class="form-label" for="age">AGE</label>
            <input id="age" name="age" type="number" min="0" max="150" class="form-control" placeholder="age" required>
          </div>
          <div class="col-md-3 mb-3">
            <label class="form-label" for="civilStatus">CIVIL STATUS</label>
            <select id="civilStatus" name="civilStatus" class="form-select" required>
              <option value="">-- choose --</option>
              <option>Single</option>
              <option>Married</option>
              <option>Divorced</option>
              <option>Widowed</option>
              <option>Civil Partnership</option>
            </select>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label" for="bday">B-DAY</label>
            <input id="bday" name="bday" type="date" class="form-control" required>
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">LENGTH OF STAY IN BRGY UGONG</label>
            <input id="lengthOfStay" name="lengthOfStay" type="text" class="form-control" required>
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label d-block">SEX</label>
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" name="sex" id="sexMale" value="Male" required>
            <label class="form-check-label" for="sexMale">Male</label>
          </div>
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" name="sex" id="sexFemale" value="Female" required>
            <label class="form-check-label" for="sexFemale">Female</label>
          </div>
        </div>

        <h6 class="fw-bold mt-3">FOR REPRESENTATIVE (OPTIONAL)</h6>
        <div class="mb-3">
          <label class="form-label" for="repName">NAME</label>
          <input id="repName" name="repName" type="text" class="form-control uppercase-optional" placeholder="optional">
        </div>
        <div class="mb-3">
          <label class="form-label" for="repRel">RELATIONSHIP TO APPLICANT</label>
          <input id="repRel" name="repRel" type="text" class="form-control uppercase-optional" placeholder="optional">
        </div>
      `;
}

function formHTML_FORM1(purposeLabelText = 'PURPOSE:') {
    return `
        
        <form id="activeForm" novalidate>
          ${template_FORM1_COMMON(purposeLabelText)}
          <div class="mt-3">
            <div id="formError" class="text-danger mb-2" style="display:none;">Fill required fields with valid data!</div>
            <button type="submit" class="btn btn-primary w-100 mt-2">Submit Request</button>
          </div>
        </form>
      `;
}

function formHTML_FORM2_CONSTRUCTION() {
    return `
       
        <form id="activeForm" novalidate>
          <div class="mb-3">
            <label class="form-label" for="date2">DATE</label>
            <input id="date2" name="date" type="date" class="form-control" required>
          </div>

          <div class="mb-3">
            <label class="form-label" for="ownerName">NAME OF OWNER</label>
            <input id="ownerName" name="ownerName" type="text" class="form-control uppercase-required" required>
          </div>

          <div class="mb-3">
            <label class="form-label" for="ownerAddress">ADDRESS</label>
            <input id="ownerAddress" name="ownerAddress" type="text" class="form-control uppercase-required" required>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label" for="repName2">NAME OF REPRESENTATIVE</label>
              <input id="repName2" name="repName2" type="text" class="form-control uppercase-required" required>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label" for="position">POSITION</label>
              <input id="position" name="position" type="text" class="form-control uppercase-required" required>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label" for="contactNum">CONTACT#</label>
            <input id="contactNum" name="contactNum" type="tel" inputmode="numeric" pattern="[0-9]*" class="form-control" placeholder="numbers only" required>
          </div>

          <div class="mb-3">
            <label class="form-label">TYPE OF CONSTRUCTION <small class="text-muted">(select at least one)</small></label>
            <div id="constructionTypes">
              <div class="form-check mb-2">
                <input class="form-check-input cons-check" type="checkbox" id="consNew" name="consType" value="New">
                <label class="form-check-label" for="consNew">NEW CONSTRUCTION</label>
                <input id="consNewSpec" class="form-control mt-2 cons-spec" placeholder="Please specify (if applicable)" disabled>
              </div>

              <div class="form-check mb-2">
                <input class="form-check-input cons-check" type="checkbox" id="consRen" name="consType" value="Renovation">
                <label class="form-check-label" for="consRen">RENOVATION</label>
                <input id="consRenSpec" class="form-control mt-2 cons-spec" placeholder="Please specify (if applicable)" disabled>
              </div>

              <div class="form-check mb-2">
                <input class="form-check-input cons-check" type="checkbox" id="consDem" name="consType" value="Demolition">
                <label class="form-check-label" for="consDem">DEMOLITION</label>
                <input id="consDemSpec" class="form-control mt-2 cons-spec" placeholder="Please specify (if applicable)" disabled>
              </div>

              <div class="form-check mb-2">
                <input class="form-check-input cons-check" type="checkbox" id="consExc" name="consType" value="Excavation">
                <label class="form-check-label" for="consExc">EXCAVATION</label>
                <input id="consExcSpec" class="form-control mt-2 cons-spec" placeholder="Please specify (if applicable)" disabled>
              </div>

              <div class="form-check mb-2">
                <input class="form-check-input cons-check" type="checkbox" id="consOther" name="consType" value="Others">
                <label class="form-check-label" for="consOther">OTHERS</label>
                <input id="consOtherSpec" class="form-control mt-2 cons-spec" placeholder="Please specify" disabled>
              </div>
            </div>
          </div>

          <div class="mt-3">
            <div id="formError" class="text-danger mb-2" style="display:none;">Fill required fields with valid data!</div>
            <button type="submit" class="btn btn-primary w-100 mt-2">Submit Request</button>
          </div>
        </form>
      `;
}

function formHTML_FORM2_FACILITIES() {
    // simpler facility usage form (Form 2 variant)
    return `
      
        <form id="activeForm" novalidate>
          <div class="mb-3">
            <label class="form-label" for="dateF">DATE</label>
            <input id="dateF" name="date" type="date" class="form-control" required>
          </div>
          <div class="mb-3">
            <label class="form-label" for="nameOwnerF">NAME OF REQUESTOR</label>
            <input id="nameOwnerF" name="nameOwnerF" type="text" class="form-control uppercase-required" required>
          </div>
          <div class="mb-3">
            <label class="form-label" for="addressF">ADDRESS</label>
            <input id="addressF" name="addressF" type="text" class="form-control uppercase-required" required>
          </div>
          <div class="mb-3">
            <label class="form-label" for="facilityType">FACILITY / PROPERTY TO USE</label>
            <input id="facilityType" name="facilityType" type="text" class="form-control" required>
          </div>

          <div class="mt-3">
            <div id="formError" class="text-danger mb-2" style="display:none;">Fill required fields with valid data!</div>
            <button type="submit" class="btn btn-primary w-100 mt-2">Submit Request</button>
          </div>
        </form>
      `;
}

function formHTML_FORM3_KATAR() {
    return `
       
        <form id="activeForm" novalidate>
          <div class="mb-3">
            <label class="form-label" for="complainantName">Complainant Complete Name</label>
            <input id="complainantName" name="complainantName" type="text" class="form-control uppercase-required" required>
          </div>
          <div class="mb-3">
            <label class="form-label" for="complainantAddress">Complainant Complete Address</label>
            <input id="complainantAddress" name="complainantAddress" type="text" class="form-control uppercase-required" required>
          </div>
          <div class="mb-3">
            <label class="form-label" for="respondentName">Respondent Name</label>
            <input id="respondentName" name="respondentName" type="text" class="form-control uppercase-required" required>
          </div>
          <div class="mb-3">
            <label class="form-label" for="respondentAddress">Respondent Complete Address</label>
            <input id="respondentAddress" name="respondentAddress" type="text" class="form-control uppercase-required" required>
          </div>
          <div class="mb-3">
            <label class="form-label" for="complaintType">Type of Complaint</label>
            <input id="complaintType" name="complaintType" type="text" class="form-control" required>
          </div>
          <div class="mb-3">
            <label class="form-label" for="complaintBody">The Complaint Body</label>
            <textarea id="complaintBody" name="complaintBody" rows="4" class="form-control" required></textarea>
          </div>

          <div class="mt-3">
            <div id="formError" class="text-danger mb-2" style="display:none;">Fill required fields with valid data!</div>
            <button type="submit" class="btn btn-primary w-100 mt-2">Submit Request</button>
          </div>
        </form>
      `;
}

function formHTML_FORM3_FILEACTION() {
    // Certificate to File Action (Form 3)
    return `
       
        <form id="activeForm" novalidate>
          <div class="mb-3">
            <label class="form-label" for="ctfaName">Complainant Complete Name</label>
            <input id="ctfaName" name="ctfaName" type="text" class="form-control uppercase-required" required>
          </div>
          <div class="mb-3">
            <label class="form-label" for="ctfaAddress">Complainant Address</label>
            <input id="ctfaAddress" name="ctfaAddress" type="text" class="form-control uppercase-required" required>
          </div>
          <div class="mb-3">
            <label class="form-label" for="ctfaReason">Reason / Details</label>
            <textarea id="ctfaReason" name="ctfaReason" rows="4" class="form-control" required></textarea>
          </div>

          <div class="mt-3">
            <div id="formError" class="text-danger mb-2" style="display:none;">Fill required fields with valid data!</div>
            <button type="submit" class="btn btn-primary w-100 mt-2">Submit Request</button>
          </div>
        </form>
      `;
}

function formHTML_FORM3_BPO() {
    // Barangay Protection Order
    return `
       
        <form id="activeForm" novalidate>
          <div class="mb-3">
            <label class="form-label" for="bpoName">Requestor Full Name</label>
            <input id="bpoName" name="bpoName" type="text" class="form-control uppercase-required" required>
          </div>
          <div class="mb-3">
            <label class="form-label" for="bpoAddress">Requestor Address</label>
            <input id="bpoAddress" name="bpoAddress" type="text" class="form-control uppercase-required" required>
          </div>
          <div class="mb-3">
            <label class="form-label" for="bpoDetails">Details / Reason</label>
            <textarea id="bpoDetails" name="bpoDetails" rows="4" class="form-control" required></textarea>
          </div>

          <div class="mt-3">
            <div id="formError" class="text-danger mb-2" style="display:none;">Fill required fields with valid data!</div>
            <button type="submit" class="btn btn-primary w-100 mt-2">Submit Request</button>
          </div>
        </form>
      `;
}

// ---------- Render & Init ----------
function renderSelectedForm() {
    const val = requestTypeSelect.value;
    let titleText = '';

    switch (val) {
        case 'form1_cert':
            titleText = 'Issuance of Barangay Certificate';
            formContainer.innerHTML = formHTML_FORM1('PURPOSE:');
            break;
        case 'form1_clear':
            titleText = 'Barangay Clearance';
            formContainer.innerHTML = formHTML_FORM1('PURPOSE:');
            break;
        case 'form1_bus':
            titleText = 'Barangay Business Clearance';
            formContainer.innerHTML = formHTML_FORM1('BUSINESS PURPOSE:');
            break;
        case 'form2_cons':
            titleText = 'Issuance of Construction, Work, Advertisement, Signage, and Events Clearance';
            formContainer.innerHTML = formHTML_FORM2_CONSTRUCTION();
            break;
        case 'form2_fac':
            titleText = 'Use of Barangay Facilities and Properties';
            formContainer.innerHTML = formHTML_FORM2_FACILITIES();
            break;
        case 'form3_katar':
            titleText = 'Katarungang Pambarangay';
            formContainer.innerHTML = formHTML_FORM3_KATAR();
            break;
        case 'form3_file':
            titleText = 'Certificate to File Action';
            formContainer.innerHTML = formHTML_FORM3_FILEACTION();
            break;
        case 'form3_bpo':
            titleText = 'Barangay Protection Order';
            formContainer.innerHTML = formHTML_FORM3_BPO();
            break;
        default:
            formContainer.innerHTML = '<div class="p-3">Select a request type.</div>';
            return;
    }

    // Insert the title above the form
    formContainer.insertAdjacentHTML('afterbegin', `<h3 class="text-center fw-bold mb-3">${titleText}</h3>`);

    // Reinitialize form behaviors
    initFormBehaviors();
}

// Attach behaviors to form fields (uppercase, numeric constraints, dynamic construction checks, submit handling)
function initFormBehaviors() {
    const activeForm = document.getElementById('activeForm');
    if (!activeForm) return;

    // uppercase for elements with class uppercase-required or uppercase-optional
    document.querySelectorAll('.uppercase-required, .uppercase-optional').forEach(inp => {
        inp.removeEventListener('input', toUpperHandler);
        inp.addEventListener('input', toUpperHandler);
    });

    // Handle form field focus and keyboard interactions
    const inputFields = document.querySelectorAll('input, textarea');

    // Show keyboard when an input field is focused
    inputFields.forEach(input => {
        input.addEventListener('focus', function () {
            currentInput = input;
            keyboard.style.display = 'block'; // Show keyboard
        });
    });

    // Hide keyboard when clicking outside the input fields
    document.addEventListener('click', function (e) {
        if (!keyboard.contains(e.target) && !Array.from(inputFields).includes(e.target)) {
            keyboard.style.display = 'none'; // Hide keyboard
        }
    });

    // Handle key clicks for on-screen keyboard
    document.querySelectorAll('.key').forEach(button => {
        button.addEventListener('click', function () {
            const key = this.getAttribute('data-key');

            if (key === 'Space') {
                currentInput.value += ' ';
            } else if (key === 'Delete') {
                currentInput.value = currentInput.value.slice(0, -1);
            } else {
                currentInput.value += key;
            }
        });
    });

    // numeric only for contact input: pattern and inputmode exist; also strip letters on input
    const contact = activeForm.querySelector('input[name="contactNum"]');
    if (contact) {
        contact.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });
    }

    // handle form submit
    activeForm.addEventListener('submit', (ev) => {
        ev.preventDefault();
        handleFormSubmit(activeForm);
    });

    // clean previous invalid highlights
    activeForm.querySelectorAll('.is-required-invalid').forEach(el => el.classList.remove('is-required-invalid'));
}

// ---------- Form Submit Validation ----------
function handleFormSubmit(formEl) {
    const errorNode = formEl.querySelector('#formError');
    if (errorNode) errorNode.style.display = 'none';

    // validation: required fields (HTML5 required coverage) + extra rules
    const elements = Array.from(formEl.elements).filter(el => el.name);
    const invalids = [];

    // 1) basic required check
    elements.forEach(el => {
        unmarkInvalid(el);
        const required = el.hasAttribute('required');
        const value = (el.type === 'checkbox' || el.type === 'radio') ? (el.checked ? (el.value || true) : '') : (el.value ?? '').toString().trim();

        if (required) {
            if ((el.type === 'radio')) {
                const radios = formEl.querySelectorAll(`input[name="${el.name}"]`);
                if (radios.length && !Array.from(radios).some(r => r.checked)) {
                    invalids.push(radios[0]);
                    radios.forEach(r => markInvalid(r));
                }
            } else if (el.type === 'checkbox') {
                if (!el.checked && required) {
                    invalids.push(el);
                    markInvalid(el);
                }
            } else {
                if (!value) {
                    invalids.push(el);
                    markInvalid(el);
                }
            }
        }
    });

    // 2) Checkboxes validation and other specific validation

    if (invalids.length) {
        if (errorNode) errorNode.style.display = 'block';
        focusFirstInvalid(invalids);
        return;
    }

    // If passes validation: show confirmation modal
    const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
    confirmModal.show();

    const confirmNo = document.getElementById('confirmNo');
    const confirmYes = document.getElementById('confirmYes');

    // remove old listeners by cloning
    confirmNo.replaceWith(confirmNo.cloneNode(true));
    confirmYes.replaceWith(confirmYes.cloneNode(true));

    const newConfirmNo = document.getElementById('confirmNo');
    const newConfirmYes = document.getElementById('confirmYes');

    newConfirmNo.addEventListener('click', () => {
        confirmModal.hide();
        focusFirstInvalid(invalids);  // Revalidate to focus on first invalid field if any
    });

    newConfirmYes.addEventListener('click', () => {
        confirmModal.hide();
        showSummary(formEl);
    });
}

// ---------- Summary / Print Modal ----------
function showSummary(formEl) {
    const ref = randRef();
    const summaryBody = document.getElementById('summaryBody');
    const entries = {};

    // Collect form data for the summary
    Array.from(formEl.elements).forEach(el => {
        if (!el.name) return;
        if (el.type === 'checkbox') {
            if (!entries[el.name]) entries[el.name] = [];
            if (el.checked) entries[el.name].push(el.value || 'Yes');
        } else if (el.type === 'radio') {
            if (el.checked) entries[el.name] = el.value;
            else if (!entries[el.name]) entries[el.name] = '';
        } else {
            entries[el.name] = el.value ?? '';
        }
    });

    const selectedRequestText = requestTypeSelect.options[requestTypeSelect.selectedIndex].text;

    let html = `<p><strong>Request Type:</strong> ${selectedRequestText}</p>
              <p><strong>Reference Number:</strong> ${ref}</p><hr>`;

    for (const [k, v] of Object.entries(entries)) {
        let displayVal = Array.isArray(v) ? v.join(', ') : v;
        if (displayVal === '') displayVal = '<em>(blank)</em>';
        html += `<div class="col-md-6 mb-2"><strong>${k}:</strong> ${displayVal}</div>`;
    }

    summaryBody.innerHTML = html;

    const summaryModal = new bootstrap.Modal(document.getElementById('summaryModal'));
    summaryModal.show();

    const printBtn = document.getElementById('printReceiptBtn');
    const newPrint = printBtn.cloneNode(true);
    printBtn.replaceWith(newPrint);

    newPrint.addEventListener('click', () => {
        document.getElementById('printingOverlay').style.display = 'flex';
        setTimeout(() => {
            document.getElementById('printingOverlay').style.display = 'none';
            summaryModal.hide();
            formEl.reset();
            console.log('Submission printed. Reference:', ref);
        }, 3000);
    });
}

// ---------- startup ----------
requestTypeSelect.addEventListener('change', renderSelectedForm);
document.getElementById('backBtn').addEventListener('click', () => {
    window.location.href = 'index.html';
});

// initial render
renderSelectedForm();
