// ---------- Utils ----------
const formContainer = document.getElementById('formContainer');
const requestTypeSelect = document.getElementById('requestTypeSelect');
const keyboard = document.getElementById('keyboard');
let currentInput = null;

let _bdayChangeHandler = null;
let _ageInputHandler = null;

// --- Helper utilities (kept from your original) ---
function randRef() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const ts = d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds());
  const rnd = Math.floor(1000 + Math.random() * 9000);
  return `REF-${ts}-${rnd}`;
}

function toUpperHandler(e) {
  // transform caret-safe uppercase
  const start = e.target.selectionStart, end = e.target.selectionEnd;
  e.target.value = e.target.value.toUpperCase();
  try { e.target.setSelectionRange(start, end); } catch { }
}

// mark invalid UI
function markInvalid(el) { el.classList.add('is-required-invalid'); }
function unmarkInvalid(el) { el.classList.remove('is-required-invalid'); }

function focusFirstInvalid(invalidElements) {
  if (!invalidElements || invalidElements.length === 0) return;
  const first = invalidElements[0];
  first.scrollIntoView({ behavior: 'smooth', block: 'center' });
  try { first.focus({ preventScroll: true }); } catch { first.focus(); }
}

document.addEventListener("DOMContentLoaded", function () {
  // Initialize the date picker after the DOM is ready
  initializeDatePickers();
});

function initializeDatePickers() {
  flatpickr("input[type='date']", {
    static: true,   // Makes the calendar appear as a static popup instead of a dropdown
    locale: "en",   // Set the locale if needed (optional)
    dateFormat: "m/d/Y", // Set your date format (e.g., mm/dd/yyyy)
    position: "auto", // Position the calendar popup automatically

    // onReady is called after the calendar is initialized
    onReady: function (selectedDates, dateStr, instance) {
      const calendar = instance.calendarContainer; // Get the calendar container
      const dateInput = instance.input;  // Get the input field that triggered the calendar

      // Custom style for the calendar popup
      calendar.style.width = "400px";  // Set calendar popup width
      calendar.style.height = "450px"; // Set calendar popup height
      calendar.style.overflow = "hidden"; // Prevent overflow and ensure it fits the container

      // Adjust the width of the date input field
      dateInput.style.width = "400px"; // Set your desired width here

      // Ensure the internal elements (month, year, and days) adjust accordingly
      const monthNav = calendar.querySelector('.flatpickr-month'); // Navigation bar for month/year
      const daysContainer = calendar.querySelector('.flatpickr-days'); // Container for the days grid
      const dayCells = daysContainer.querySelectorAll('.flatpickr-day'); // Day cells

      // Adjust the font size of the month and year display
      if (monthNav) {
        monthNav.style.fontSize = "25px"; // Adjust the font size of month/year text
        monthNav.style.height = "60px"; // Set a fixed height to match day cells
        monthNav.style.lineHeight = "60px"; // Vertically center the month text
        monthNav.style.padding = "0 10px"; // Add some horizontal padding to prevent cutoff

        // Use Flexbox to center the month/year horizontally
        monthNav.style.display = "flex";
        monthNav.style.justifyContent = "center";  // Centers the content horizontally
        monthNav.style.alignItems = "center";  // Centers the content vertically

        // Hide the year input box (up/down arrows)
        const yearElement = monthNav.querySelector('.flatpickr-year');
        if (yearElement) {
          yearElement.style.display = "none";  // Hide the native year input field
        }

        // Add event listener to year to display a list of years when clicked
        const yearLabel = monthNav.querySelector('.flatpickr-current-month');
        yearLabel.addEventListener('click', function() {
          showYearDropdown(instance, yearLabel);  // Show the year dropdown when the year is clicked
        });

        // Hide the arrow buttons (if you don't need them)
        const arrowButtons = monthNav.querySelectorAll('.flatpickr-prev-month, .flatpickr-next-month');
        arrowButtons.forEach(button => button.style.display = 'none');
      }

      // Adjust the size of the days container and cells to fit the new calendar size
      daysContainer.style.fontSize = "25px"; // Adjust text size of days
      daysContainer.style.gridTemplateColumns = "repeat(7, 1fr)"; // Make sure the days grid fits well in 400px width

      // Adjust the size of the individual day cells
      dayCells.forEach(day => {
        day.style.fontSize = "18px"; // Set the font size of the days inside the calendar
        day.style.height = "60px"; // Set a fixed height for day cells
        day.style.width = "60px";  // Set a fixed width for day cells
        day.style.lineHeight = "60px"; // Vertically center the text inside day cells
        day.style.textAlign = "center"; // Center the text horizontally inside each day cell
      });

      // Ensure the calendar stays open while interacting with it
      dateInput.addEventListener('focus', function () {
        calendar.style.display = "block";  // Ensure the calendar stays open on focus
      });

      // Prevent calendar from closing when interacting with input (e.g., selecting date)
      dateInput.addEventListener('click', function (event) {
        event.stopPropagation();  // Prevent calendar from closing when clicking on input
      });

      // Prevent calendar from closing when selecting a date on the calendar (if necessary)
      calendar.addEventListener('click', function (event) {
        event.stopPropagation();  // Prevent the calendar from closing on date selection
      });
    }
  });
}

// Function to display a list of years
function showYearDropdown(instance, yearElement) {
  const calendar = instance.calendarContainer;
  const yearList = document.createElement('div');
  yearList.classList.add('year-list');

  // Get the current year and ensure we calculate a range around it
  const currentYear = new Date().getFullYear();

  // Add the year items to the dropdown
  for (let i = currentYear - 120; i <= currentYear + 5; i++) {
    const yearItem = document.createElement('div');
    yearItem.classList.add('year-item');
    yearItem.textContent = i;

    // Highlight the current year
    if (i === currentYear) {
      yearItem.classList.add('current-year');  // Add a class to highlight the current year
    }

    // Add click event to set the selected year
    yearItem.addEventListener('click', function () {
      // Set the new date with the selected year, maintaining the current month and day
      const selectedDate = instance.selectedDates[0] || new Date(); // Get the current selected date or use the current date
      const selectedMonth = selectedDate.getMonth(); // Preserve the current month (0-based)
      const selectedDay = selectedDate.getDate(); // Preserve the current day

      // Create a new Date object with the selected year and the current month and day
      const newDate = new Date(i, selectedMonth, selectedDay); // Create a new date with the selected year

      // Update the selected year and close the dropdown
      instance.setDate(newDate, true); // Set the new date while maintaining the current month and day
      yearList.style.display = 'none'; // Hide the year list after selection

      // Reapply the `current-year` style to the selected year
      updateCurrentYearHighlight(yearList, i);
    });

    yearList.appendChild(yearItem);
  }

  // Position the year dropdown just below the year element
  yearList.style.position = 'absolute';
  yearList.style.top = `${yearElement.offsetTop + yearElement.offsetHeight}px`;
  yearList.style.left = `${yearElement.offsetLeft}px`;
  yearList.style.width = `${yearElement.offsetWidth}px`;
  calendar.appendChild(yearList);

  // Close the dropdown when clicking outside
  document.addEventListener('click', function (event) {
    if (!yearList.contains(event.target) && event.target !== yearElement) {
      yearList.style.display = 'none';
    }
  });

  yearList.style.display = 'block'; // Show the year dropdown

  // Reapply the current-year class to the selected year after clicking
  updateCurrentYearHighlight(yearList, currentYear);
}

// Update current-year highlight when a year is selected
function updateCurrentYearHighlight(yearList, currentYear) {
  const yearItems = yearList.querySelectorAll('.year-item');
  yearItems.forEach(item => {
    if (item.textContent == currentYear) {
      item.classList.add('current-year'); // Ensure the current year is highlighted
    } else {
      item.classList.remove('current-year'); // Remove highlight from other years
    }
  });
}



// ---------- Templates ----------
function template_FORM1_COMMON(purposeLabel = 'PURPOSE') {
  // shared among various Form 1 variants
  return `
        <div class="mb-3">
          <label class="form-label" for="purpose">${purposeLabel}</label>
          <input id="purpose" name="purpose" type="text" class="form-control" autocomplete="off"required>
        </div>
        <div class="mb-3">
          <label class="form-label" for="fullName">FULL NAME</label>
          <input id="fullName" name="fullName" type="text" class="form-control uppercase-required" placeholder="" autocomplete="off" required>
        </div>
        <div class="mb-3">
          <label class="form-label" for="address">ADDRESS</label>
          <input id="address" name="address" type="text" class="form-control uppercase-required" placeholder="" autocomplete="off" required>
        </div>
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label" for="date">DATE</label>
            <input id="date" name="date" type="date" class="form-control" autocomplete="off" required>
          </div>
          <div class="col-md-3 mb-3">
            <label class="form-label" for="age">AGE</label>
            <input id="age" name="age" type="text" inputmode="numeric" pattern="[0-9]*" class="form-control" placeholder="age" autocomplete="off" required>
          </div>
          <div class="col-md-3 mb-3">
            <label class="form-label" for="civilStatus">CIVIL STATUS</label>
            <select id="civilStatus" name="civilStatus" class="form-select" autocomplete="off" required>
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
            <input id="bday" name="bday" type="date" class="form-control" autocomplete="off" required>
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">LENGTH OF STAY IN BRGY UGONG</label>
            <input id="lengthOfStay" name="lengthOfStay" type="text" class="form-control" autocomplete="off" required>
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label d-block">SEX</label>
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" name="sex" id="sexMale" value="Male" autocomplete="off" required>
            <label class="form-check-label" for="sexMale">Male</label>
          </div>
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" name="sex" id="sexFemale" value="Female" autocomplete="off" required>
            <label class="form-check-label" for="sexFemale">Female</label>
          </div>
        </div>

        <h6 class="fw-bold mt-3">FOR REPRESENTATIVE (OPTIONAL)</h6>
        <div class="mb-3">
          <label class="form-label" for="repName">NAME</label>
          <input id="repName" name="repName" type="text" class="form-control uppercase-optional" placeholder="optional" autocomplete="off">
        </div>
        <div class="mb-3">
          <label class="form-label" for="repRel">RELATIONSHIP TO APPLICANT</label>
          <input id="repRel" name="repRel" type="text" class="form-control uppercase-optional" placeholder="optional" autocomplete="off">
        </div>
      `;
}

function formHTML_FORM1(purposeLabelText = 'PURPOSE') {
  return `
        
        <form id="activeForm" novalidate>
          ${template_FORM1_COMMON(purposeLabelText)}
          <div class="mt-3">
            <div id="formError" class="text-danger mb-2" style="display:none;">Fill autocomplete="off" required fields with valid data!</div>
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
            <input id="date2" name="date" type="date" class="form-control"autocomplete="off" required>
          </div>

          <div class="mb-3">
            <label class="form-label" for="ownerName">NAME OF OWNER</label>
            <input id="ownerName" name="ownerName" type="text" class="form-control uppercase-required" autocomplete="off" required>
          </div>

          <div class="mb-3">
            <label class="form-label" for="ownerAddress">ADDRESS</label>
            <input id="ownerAddress" name="ownerAddress" type="text" class="form-control uppercase-required" autocomplete="off" required>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label" for="repName2">NAME OF REPRESENTATIVE</label>
              <input id="repName2" name="repName2" type="text" class="form-control uppercase-required" autocomplete="off" required>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label" for="position">POSITION</label>
              <input id="position" name="position" type="text" class="form-control uppercase-required" autocomplete="off" required>
            </div>
          </div>

          <div class="mb-3">
  <label class="form-label" for="contactNum">CONTACT#</label>
  <div class="input-group">
    <span class="input-group-text">+63</span>
    <input id="contactNum" name="contactNum" type="text" inputmode="numeric" pattern="[0-9]*" class="form-control" placeholder="912 452 1234" autocomplete="off" required autocomplete="off
    " maxlength="12">
  </div>
  <div class="form-text">Enter 10 digits only (mobile format). Spaces will be added automatically.</div>
</div>

          <div class="mb-3">
            <label class="form-label">TYPE OF CONSTRUCTION <small class="text-muted">(select at least one)</small></label>
            <div id="constructionTypes">
              <div class="form-check mb-2">
                <input class="form-check-input cons-check" type="checkbox" id="consNew" name="consType" value="New" autocomplete="off">
                <label class="form-check-label" for="consNew">NEW CONSTRUCTION</label>
                <input id="consNewSpec" class="form-control mt-2 cons-spec" placeholder="Please specify (if applicable)" autocomplete="off" disabled>
              </div>

              <div class="form-check mb-2">
                <input class="form-check-input cons-check" type="checkbox" id="consRen" name="consType" value="Renovation" autocomplete="off">
                <label class="form-check-label" for="consRen">RENOVATION</label>
                <input id="consRenSpec" class="form-control mt-2 cons-spec" placeholder="Please specify (if applicable)" autocomplete="off" disabled>
              </div>

              <div class="form-check mb-2">
                <input class="form-check-input cons-check" type="checkbox" id="consDem" name="consType" autocomplete="off" value="Demolition">
                <label class="form-check-label" for="consDem">DEMOLITION</label>
                <input id="consDemSpec" class="form-control mt-2 cons-spec" placeholder="Please specify (if applicable)" autocomplete="off" disabled>
              </div>

              <div class="form-check mb-2">
                <input class="form-check-input cons-check" type="checkbox" id="consExc" name="consType" autocomplete="off" value="Excavation">
                <label class="form-check-label" for="consExc">EXCAVATION</label>
                <input id="consExcSpec" class="form-control mt-2 cons-spec" placeholder="Please specify (if applicable)" autocomplete="off" disabled>
              </div>

              <div class="form-check mb-2">
                <input class="form-check-input cons-check" type="checkbox" id="consOther" name="consType" autocomplete="off" value="Others">
                <label class="form-check-label" for="consOther">OTHERS</label>
                <input id="consOtherSpec" class="form-control mt-2 cons-spec" placeholder="Please specify" autocomplete="off" disabled>
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
            <input id="dateF" name="date" type="date" class="form-control" autocomplete="off" required>
          </div>
          <div class="mb-3">
            <label class="form-label" for="nameOwnerF">NAME OF REQUESTOR</label>
            <input id="nameOwnerF" name="nameOwnerF" type="text" class="form-control uppercase-required" autocomplete="off" required>
          </div>
          <div class="mb-3">
            <label class="form-label" for="addressF">ADDRESS</label>
            <input id="addressF" name="addressF" type="text" class="form-control uppercase-required" autocomplete="off" required>
          </div>
          <div class="mb-3">
            <label class="form-label" for="facilityType">FACILITY / PROPERTY TO USE</label>
            <input id="facilityType" name="facilityType" type="text" class="form-control" autocomplete="off" required>
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
            <input id="complainantName" name="complainantName" type="text" class="form-control uppercase-required" autocomplete="off" required>
          </div>
          <div class="mb-3">
            <label class="form-label" for="complainantAddress">Complainant Complete Address</label>
            <input id="complainantAddress" name="complainantAddress" type="text" class="form-control uppercase-required" autocomplete="off" required>
          </div>
          <div class="mb-3">
            <label class="form-label" for="respondentName">Respondent Name</label>
            <input id="respondentName" name="respondentName" type="text" class="form-control uppercase-required" autocomplete="off" required>
          </div>
          <div class="mb-3">
            <label class="form-label" for="respondentAddress">Respondent Complete Address</label>
            <input id="respondentAddress" name="respondentAddress" type="text" class="form-control uppercase-required" autocomplete="off" required>
          </div>
          <div class="mb-3">
            <label class="form-label" for="complaintType">Type of Complaint</label>
            <input id="complaintType" name="complaintType" type="text" class="form-control" autocomplete="off" required>
          </div>
          <div class="mb-3">
            <label class="form-label" for="complaintBody">The Complaint Body</label>
            <textarea id="complaintBody" name="complaintBody" rows="4" class="form-control" autocomplete="off" required></textarea>
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
            <input id="ctfaName" name="ctfaName" type="text" class="form-control uppercase-required" autocomplete="off" required>
          </div>
          <div class="mb-3">
            <label class="form-label" for="ctfaAddress">Complainant Address</label>
            <input id="ctfaAddress" name="ctfaAddress" type="text" class="form-control uppercase-required" autocomplete="off" required>
          </div>
          <div class="mb-3">
            <label class="form-label" for="ctfaReason">Reason / Details</label>
            <textarea id="ctfaReason" name="ctfaReason" rows="4" class="form-control" autocomplete="off" required></textarea>
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
            <input id="bpoName" name="bpoName" type="text" class="form-control uppercase-required" autocomplete="off" required>
          </div>
          <div class="mb-3">
            <label class="form-label" for="bpoAddress">Requestor Address</label>
            <input id="bpoAddress" name="bpoAddress" type="text" class="form-control uppercase-required" autocomplete="off" required>
          </div>
          <div class="mb-3">
            <label class="form-label" for="bpoDetails">Details / Reason</label>
            <textarea id="bpoDetails" name="bpoDetails" rows="4" class="form-control" autocomplete="off" required></textarea>
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
      formContainer.innerHTML = formHTML_FORM1('PURPOSE');
      break;
    case 'form1_clear':
      titleText = 'Barangay Clearance';
      formContainer.innerHTML = formHTML_FORM1('PURPOSE');
      break;
    case 'form1_bus':
      titleText = 'Barangay Business Clearance';
      formContainer.innerHTML = formHTML_FORM1('BUSINESS PURPOSE');
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
  initializeDatePickers();
}



// ---------- Auto-age calculation from birthday ----------
function computeAgeFromDOB(dobString) {
  if (!dobString) return '';
  const dob = new Date(dobString);
  if (isNaN(dob)) return '';
  const today = new Date();
  // use only date portion to avoid timezone issues
  const y = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  const d = today.getDate() - dob.getDate();
  let age = y;
  if (m < 0 || (m === 0 && d < 0)) age = y - 1;
  if (age < 0) return ''; // future date -> empty
  return age;
}

// call this function to wire up the bday -> age behavior
function wireAutoAge() {
  const bday = document.getElementById('bday');
  const age = document.getElementById('age');
  if (!bday || !age) return;

  // keep age editable
  age.readOnly = false;

  // compute on load if bday exists
  if (bday.value) {
    const a = computeAgeFromDOB(bday.value);
    if (a !== '' && (age.value === '' || Number(age.value) !== a)) {
      age.value = String(a);
    }
  }

  // remove previous handlers if any
  if (_bdayChangeHandler) {
    bday.removeEventListener('change', _bdayChangeHandler);
    bday.removeEventListener('input', _bdayChangeHandler);
  }
  if (_ageInputHandler) {
    age.removeEventListener('input', _ageInputHandler);
  }

  // When birthday changes — always correct the age to computed value.
  _bdayChangeHandler = function () {
    const computed = computeAgeFromDOB(bday.value);
    if (computed === '') return; // ignore invalid / future date

    // if the typed age differs (or empty) — overwrite with computed value
    if (age.value === '' || Number(age.value) !== computed) {
      age.value = String(computed);

      // subtle visual feedback: flash light green briefly
      const origBg = age.style.backgroundColor || '';
      age.style.transition = 'background-color 0.22s';
      age.style.backgroundColor = '#d4edda'; // success-ish flash
      setTimeout(() => {
        age.style.backgroundColor = origBg;
      }, 450);
      // remove any 'invalid' highlight if present
      unmarkInvalid(age);
    }
  };

  // When user types into age: allow editing but show a warning if it doesn't match the currently entered birthday
  _ageInputHandler = function () {
    // if no birthday, nothing to validate against
    if (!bday.value) {
      age.classList.remove('is-required-invalid');
      return;
    }
    const computed = computeAgeFromDOB(bday.value);
    if (computed === '') {
      age.classList.remove('is-required-invalid');
      return;
    }

    const typed = Number(age.value);
    if (!Number.isFinite(typed) || typed !== computed) {
      // indicate mismatch but do not overwrite here
      // use your existing invalid style to make it noticeable
      markInvalid(age);
    } else {
      unmarkInvalid(age);
    }
  };

  // attach listeners
  bday.addEventListener('change', _bdayChangeHandler);
  bday.addEventListener('input', _bdayChangeHandler);
  age.addEventListener('input', _ageInputHandler);
}

// format raw digits (10) into "xxx xxx xxxx"
function formatPHNumber(digits) {
  // remove non-digits just in case
  const d = (digits || '').replace(/\D/g, '').slice(0, 10);
  if (!d) return '';
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
}


// ---------- Form Behaviors (fixed) ----------
let _globalDocClickHandler = null;
let _keyboardKeyHandler = null;
let _focusInHandler = null;
let _focusOutHandler = null;

function initFormBehaviors() {
  const activeForm = document.getElementById('activeForm');
  if (!activeForm) return;

  // Remove potential previous listeners before re-binding (idempotent)
  // remove document click handler if present
  if (_globalDocClickHandler) {
    document.removeEventListener('mousedown', _globalDocClickHandler);
    _globalDocClickHandler = null;
  }

  if (_keyboardKeyHandler) {
    // remove handlers from existing keys
    document.querySelectorAll('.key').forEach(btn => btn.removeEventListener('click', _keyboardKeyHandler));
    _keyboardKeyHandler = null;
  }
  if (_focusInHandler) {
    document.removeEventListener('focusin', _focusInHandler);
    _focusInHandler = null;
  }
  if (_focusOutHandler) {
    document.removeEventListener('focusout', _focusOutHandler);
    _focusOutHandler = null;
  }

  // uppercase for elements with class uppercase-required or uppercase-optional
  document.querySelectorAll('.uppercase-required, .uppercase-optional').forEach(inp => {
    inp.removeEventListener('input', toUpperHandler);
    inp.addEventListener('input', toUpperHandler);
  });

  // Use focusin/focusout (bubbles) to reliably detect focus across re-renders
  _focusInHandler = (e) => {
    const el = e.target;
    if (el.matches && (el.matches('input') || el.matches('textarea'))) {
      currentInput = el;
      // ensure keyboard visible
      keyboard.style.display = 'block';
    }
  };
  document.addEventListener('focusin', _focusInHandler);

  _focusOutHandler = (e) => {
    // If focus moves to an element inside the keyboard, keep it open.
    // We'll rely on the global doc click to hide the keyboard only when clicking outside both keyboard and form.
    // Do nothing here.
  };
  document.addEventListener('focusout', _focusOutHandler);

  // Global hide handler — use mousedown and check activeElement to avoid races/blinks
  _globalDocClickHandler = (e) => {
    const target = e.target;

    // keep keyboard open if interacting with keyboard or form
    if (keyboard.contains(target)) return;
    if (activeForm && activeForm.contains(target)) return;

    // If an input inside the form is currently focused, do not hide (avoids race when focus changes)
    const active = document.activeElement;
    if (active && activeForm && activeForm.contains(active) &&
      (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
      return;
    }

    // Otherwise hide keyboard
    keyboard.style.display = 'none';
    keyboard.setAttribute('aria-hidden', 'true');
    currentInput = null;
  };

  // listen on mousedown instead of click to avoid event-order races
  document.addEventListener('mousedown', _globalDocClickHandler);


  // Handle key clicks for on-screen keyboard (single attached handler reused)
  _keyboardKeyHandler = function (ev) {
    ev.preventDefault();
    if (!currentInput) {
      // optional: flash keyboard or focus first input
      return;
    }

    const key = this.getAttribute('data-key');
    // put caret at current selection end if possible
    try {
      currentInput.focus();
      const start = currentInput.selectionStart ?? currentInput.value.length;
      const end = currentInput.selectionEnd ?? start;
      if (key === 'Space') {
        // insert a space at caret
        const before = currentInput.value.slice(0, start);
        const after = currentInput.value.slice(end);
        currentInput.value = before + ' ' + after;
        const newPos = start + 1;
        currentInput.setSelectionRange(newPos, newPos);
      } else if (key === 'Delete') {
        // delete before caret
        if (start === end && start > 0) {
          const before = currentInput.value.slice(0, start - 1);
          const after = currentInput.value.slice(end);
          currentInput.value = before + after;
          const newPos = start - 1;
          currentInput.setSelectionRange(newPos, newPos);
        } else {
          // replace selected text
          const before = currentInput.value.slice(0, start);
          const after = currentInput.value.slice(end);
          currentInput.value = before + after;
          currentInput.setSelectionRange(start, start);
        }
      } else {
        const ch = key;
        const before = currentInput.value.slice(0, start);
        const after = currentInput.value.slice(end);
        currentInput.value = before + ch + after;
        const newPos = start + ch.length;
        currentInput.setSelectionRange(newPos, newPos);
      }

      // if input should be uppercase, trigger handler to normalize (keeps selection)
      if (currentInput.classList.contains('uppercase-required') || currentInput.classList.contains('uppercase-optional')) {
        // call toUpperHandler manually to preserve caret
        const fakeEvent = { target: currentInput };
        toUpperHandler(fakeEvent);
      }
      // ensure keyboard remains visible and input stays focused
      keyboard.style.display = 'block';
      currentInput.focus();
    } catch (err) {
      console.warn('Keyboard interaction error:', err);
    }
  };

  document.querySelectorAll('.key').forEach(button => {
    // remove previous listener just in case (safe)
    button.removeEventListener('click', _keyboardKeyHandler);
    button.addEventListener('click', _keyboardKeyHandler);
  });
  // mic button toggle (visual only - you can hook real recognition later)
  const mic = document.getElementById('micBtn');
  if (mic) {
    mic.removeEventListener('click', mic._handler);
    mic._handler = function () {
      mic.classList.toggle('active');
      // optional UI feedback: keep keyboard visible when mic active
      keyboard.style.display = 'block';
      // you can add actual speech-to-text start/stop here later
    };
    mic.addEventListener('click', mic._handler);
  }


  // numeric-only + auto-format for PH mobile number (10 digits, displayed as "xxx xxx xxxx")
  const contact = activeForm.querySelector('input[name="contactNum"]');
  if (contact) {
    // remove any previous handlers if present
    if (contact._phHandler) contact.removeEventListener('input', contact._phHandler);
    if (contact._pasteHandler) contact.removeEventListener('paste', contact._pasteHandler);

    contact._phHandler = function (e) {
      // keep only digits, max 10
      const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
      const formatted = formatPHNumber(raw);
      // set the formatted value and move caret to end (simple, robust)
      e.target.value = formatted;
    };
    contact.addEventListener('input', contact._phHandler);

    // optional: prevent paste from inserting non-digit content
    contact._pasteHandler = function (ev) {
      ev.preventDefault();
      const txt = (ev.clipboardData || window.clipboardData).getData('text') || '';
      const digits = txt.replace(/\D/g, '').slice(0, 10);
      contact.value = formatPHNumber(digits);
    };
    contact.addEventListener('paste', contact._pasteHandler);
  }

  // ---------- construction spec toggle (enable spec input when checkbox checked) ----------
  const consChecks = activeForm.querySelectorAll('.cons-check');
  consChecks.forEach(cb => {
    const formCheckBlock = cb.closest('.form-check');
    const spec = formCheckBlock ? formCheckBlock.querySelector('.cons-spec') : null;
    if (!spec) return;

    // initial state
    spec.disabled = !cb.checked;
    if (!cb.checked) {
      spec.value = '';
      spec.removeAttribute('name');
      spec.required = false;
    } else {
      spec.setAttribute('name', `${cb.id}Spec`);
      spec.required = false; // change to true if you want it mandatory when checked
    }

    // remove previous handler if present
    if (cb._consHandler) cb.removeEventListener('change', cb._consHandler);

    cb._consHandler = function () {
      if (cb.checked) {
        spec.disabled = false;
        spec.setAttribute('name', `${cb.id}Spec`);
        spec.required = false; // set true if you want required
        // optional: focus the newly enabled field
        // spec.focus();
      } else {
        spec.disabled = true;
        spec.required = false;
        spec.removeAttribute('name');
        spec.value = '';
      }
    };

    cb.addEventListener('change', cb._consHandler);
  });

  // handle form submit
  // remove previous submit listeners by cloning node (safe)
  activeForm.removeEventListener('submit', handleFormSubmitWrapped);
  activeForm.addEventListener('submit', handleFormSubmitWrapped);


  // auto-age wiring
  wireAutoAge();


  // clean previous invalid highlights
  activeForm.querySelectorAll('.is-required-invalid').forEach(el => el.classList.remove('is-required-invalid'));
}

// we wrap the original handleFormSubmit to allow removing the listener easily
function handleFormSubmitWrapped(ev) {
  ev.preventDefault();
  handleFormSubmit(ev.currentTarget);
}

// ---------- Form Submit Validation (unchanged logic, minor cleanup) ----------
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

  // ---------- additional validation: TYPE OF CONSTRUCTION (Form 2 - Construction) ----------
  // run this after the basic required-check loop and before the invalids early return
  const consContainer = formEl.querySelector('#constructionTypes');
  if (consContainer) {
    const checks = Array.from(consContainer.querySelectorAll('.cons-check'));
    // if there are no checkboxes found, skip
    if (checks.length) {
      const anyChecked = checks.some(c => c.checked);
      if (!anyChecked) {
        // no selection -> force user to choose one
        invalids.push(checks[0]);
        checks.forEach(c => markInvalid(c));
      } else {
        // for each checked checkbox, ensure its spec input (if present) is filled
        for (const c of checks) {
          if (!c.checked) continue;
          const block = c.closest('.form-check');
          const spec = block ? block.querySelector('.cons-spec') : null;
          // if spec exists and is enabled, require a non-empty value
          if (spec) {
            const val = (spec.value ?? '').toString().trim();
            if (!val) {
              invalids.push(spec);
              markInvalid(spec);
            } else {
              unmarkInvalid(spec);
            }
          }
        }
      }
    }
  }
  // ---------- date validation: no future dates allowed + birthday min-age ----------
  const today = new Date();
  const dateInputs = Array.from(formEl.querySelectorAll('input[type="date"]'));
  dateInputs.forEach(di => {
    if (!di.value) return;
    // Use midnight for safe comparison
    const v = new Date(di.value + 'T00:00:00');
    if (v > today) {
      invalids.push(di);
      markInvalid(di);
    }
  });

  // ensure birthday corresponds to at least 8 years old
  const bdayEl = formEl.querySelector('#bday');
  if (bdayEl && bdayEl.value) {
    const age = computeAgeFromDOB(bdayEl.value);
    // computeAgeFromDOB returns '' for invalid/future date — treat as invalid
    if (age === '' || age < 8) {
      invalids.push(bdayEl);
      markInvalid(bdayEl);
    }
  }




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

// ---------- Summary / Print Modal (unchanged) ----------
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

  // Normalize contact display: if contactNum exists, ensure it's shown as "+63 xxx xxx xxxx"
  if (entries.contactNum) {
    const digits = String(entries.contactNum).replace(/\D/g, '').slice(0, 10);
    const formatted = digits ? formatPHNumber(digits) : '';
    entries.contactNum = formatted ? `+63 ${formatted}` : '';
  }

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
      window.location.href = 'index.html'; // Redirect to index.html
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
