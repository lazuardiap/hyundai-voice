const startButton = document.getElementById('js-start');
const stopButton = document.getElementById('js-stop');
const information = document.querySelector('.js-info');
const statusInfo = document.querySelector('.status');
const recordIcon = document.getElementById('record-icon');
const googleHint = document.querySelector('.google-translate');
const compatButton = document.querySelector('.compat-button');

function startRecordUI() {
  startButton.style.display = 'none';
  stopButton.style.display = 'block';
  information.textContent = "I'm Listening...";
  recordIcon.classList.add('request-loader');
}

function stopRecordUI() {
  startButton.style.display = 'block';
  stopButton.style.display = 'none';
  recordIcon.classList.remove('request-loader');
}

function setInitialUI() {
  statusInfo.classList.remove('correct', 'wrong');
  removeInlineStyle(statusInfo, 'display');
  removeInlineStyle(googleHint, 'display');
}

//text result if the word match
function wordMatch() {
  statusInfo.classList.add('correct');
  statusInfo.classList.remove('wrong');
  statusInfo.querySelector('span').textContent = 'Correct!';
}

//text result if the word not match
function wordNotMatch() {
  statusInfo.classList.add('wrong');
  statusInfo.classList.remove('correct');
  statusInfo.querySelector('span').textContent = 'Please try again';
}

//popup if the word match
function correctPopup() {
  Swal.fire({
    title: 'Congratulations',
    text: "You've pronounced Hyundai in Korean correctly!",
    icon: 'success',
    confirmButtonColor: '#0A306B',
  }).then((result) => {
    if (result.isConfirmed) {
      startButton.style.display = 'block';
      stopButton.style.display = 'none';
      information.textContent = 'Try Again? Hit that Button!';
      recordIcon.classList.remove('request-loader');
    }
  });
}

//popup if browser not compatible
function notCompatible() {
  Swal.fire({
    title: 'Sorry',
    text: "It looks like you are using a browser that doesn't compatible with voice recognition",
    icon: 'error',
    showDenyButton: true,
    confirmButtonColor: '#0A306B',
    denyButtonText: 'Close The Window',
    denyButtonColor: '#6c6c6c',
  }).then((result) => {
    if (result.isDenied) {
      Swal.fire({
        title: 'Are you sure?',
        text: 'Are you sure you want to close the window?',
        showCancelButton: true,
        confirmButtonColor: '#0A306B',
      }).then((result) => {
        if (result.isConfirmed) {
          window.close();
        }
      });
    } else if (result.isConfirmed) {
      document.querySelector('.subtitle').textContent =
        'It seems like you are using an uncompatible Browser. Please use Chrome instead.';
      compatButton.style.display = 'block';
      recordIcon.style.display = 'none';
      information.style.display = 'none';
    }
  });
}

//if the user fail for several times (try 5)
function googleHintShow() {
  googleHint.style.display = 'grid';
  statusInfo.style.display = 'none';
}

function removeInlineStyle(elem, prop) {
  if (elem.style.removeProperty) {
    elem.style.removeProperty(prop);
  } else {
    elem.style.removeAttribute(prop);
  }
}
