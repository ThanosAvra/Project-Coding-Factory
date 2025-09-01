/**
 * Detects if the browser supports the date input type
 * and applies fallback styles if needed
 */
export function checkDateInputSupport() {
  const input = document.createElement('input');
  input.setAttribute('type', 'date');
  
  // Check if the browser shows a date picker
  const notADateValue = 'not-a-date';
  input.setAttribute('value', notADateValue);
  
  const isDateSupported = (input.value !== notADateValue);
  
  if (!isDateSupported) {
    console.log('Date input not supported, applying fallback styles');
    // Add a class to the html element to target with CSS
    document.documentElement.classList.add('no-date-support');
    
    // Add class to all date inputs
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
      input.classList.add('no-date-support');
      
      // Add a placeholder for browsers that don't support date inputs
      if (!input.hasAttribute('placeholder')) {
        input.setAttribute('placeholder', 'YYYY-MM-DD');
      }
    });
  }
  
  return isDateSupported;
}

// Run the check when the page loads
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', checkDateInputSupport);
}
