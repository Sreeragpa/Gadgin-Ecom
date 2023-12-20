// const form = document.getElementById('pdt-delete-form');
const forms = document.querySelectorAll('.pdt-delete-form');
const overlay = document.getElementById('continue-overlay');
const confirmBtn = document.getElementById('confirmBtn');
const cancelBtn = document.getElementById('cancelBtn');

forms.forEach((form) => {
  const btn = form.querySelector('.product-dlt-button');

  let permis = false;

  form.addEventListener('submit', (e) => {
    if (!permis) {
      e.preventDefault();
      overlay.style.display = 'flex';
     
      confirmBtn.addEventListener('click', () => {
        permis = true;
        callme(permis);
        // You can close the modal here if needed
        overlay.style.display = 'none';
      });

      cancelBtn.addEventListener('click', () => {
      
        // Close the modal
        overlay.style.display = 'none';
      });

      function callme(permis){
        if (permis==true) {
            form.submit();
          } else {
            // user no pressed
            return;
          }
      }

    
    }
  });
});



