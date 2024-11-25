const goToTestPageButton = document.getElementById('goToTestPage');
const goToProfilePageButton = document.getElementById('goToProfilePage');

// These check to see if each button exists on the current page and to add the event listeners accordingly
if (goToTestPageButton) {
  goToTestPageButton.addEventListener('click', function() {
    window.location.href = '/test';
  });
}

if (goToProfilePageButton) {
  goToProfilePageButton.addEventListener('click', function() {
    window.location.href = '/profile';
  });
}








document.addEventListener("DOMContentLoaded", function () {
  
  // Listens to the "Test Your Privacy Knowledge" button click
  const testButton = document.getElementById('testButton');
  if (testButton) {
      testButton.addEventListener('click', function () {
          fetch('/test', { method: 'GET' })
              .then(response => response.json())
              .then(data => {
                  if (data.message) {
                      const profileContainer = document.querySelector('.profile-container');
                      profileContainer.innerHTML = `<h2>${data.message}</h2>`;
                  } else {
                      console.error("Unexpected response format:", data);
                  }
              })
              .catch(error => console.error("Error fetching /test:", error));
      });
  }

  // Listens to the "Redo Test" button click (if thhe testResult exists)
  const redoTestButton = document.getElementById('redoTestButton');
  if (redoTestButton) {
      redoTestButton.addEventListener('click', function () {
          fetch('/redoTest', { method: 'GET' })
              .then(response => response.json())
              .then(data => {
                  if (data.message) {
                      const profileContainer = document.querySelector('.profile-container');
                      profileContainer.innerHTML = `<h2>${data.message}</h2>`;
                  } else {
                      console.error("Unexpected response format:", data);
                  }
              })
              .catch(error => console.error("Error fetching /redoTest:", error));
      });
  }

  // Listens to form submission to delete test results
  const deleteTestForm = document.getElementById('deleteTestForm');
  if (deleteTestForm) {
      deleteTestForm.addEventListener('submit', function (event) {

          fetch('/deleteTest', { method: 'POST' })
              .then(response => response.json())
              .then(data => {
                  if (data.success) {
                      const profileContainer = document.querySelector('.profile-container');
                      profileContainer.innerHTML = `<h2>${data.message}</h2>`;
                  } else {
                      console.error("Failed to delete test results.");
                  }
              })
              .catch(error => console.error("Error fetching /deleteTest:", error));
      });
  }
});
