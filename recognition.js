const SpeechRecognition =
  window.SpeechRecognition ||
  window.webkitSpeechRecognition ||
  window.mozSpeechRecognition ||
  window.msSpeechRecognition ||
  window.oSpeechRecognition;
if (!SpeechRecognition) {
  notCompatible();
  // annyang require this browser API
  throw new Error('annyang requires browser that supports SpeechRecognition');
}

(function main(annyang, aromanize) {
  if (!annyang) {
    throw new Error('Please include annyang script');
  }
  if (!aromanize) {
    throw new Error('Please include aromanize script');
  }
  if ([annyang, aromanize].includes(undefined)) {
    return;
  }
  const LANG = 'ko-KR'; // language: korean, country: Korea
  const WORD_TO_SAY = '현대'; // hyundai
  const WORD_TO_SAY_LATIN = 'Hyundai';

  // FLAGS
  let isRecording = false;
  let isReceivedSound = false;
  let wrongCounter = 0;

  annyang.addCommands({
    [WORD_TO_SAY]: function () {},
  });
  annyang.setLanguage(LANG);
  annyang.addCallback('error', (ev) => {
    console.log({ error: ev });
    if (ev.error === 'no-speech') {
      information.textContent = `I did not hear anything... Please say ${WORD_TO_SAY_LATIN}`;
    }
    stopRecognition();
  });
  annyang.addCallback('errorNetwork', (ev) => {
    information.textContent = 'Please check your internet connection';
    console.log({ errorNetwork: ev });
    stopRecognition();
  });
  annyang.addCallback('errorPermissionBlocked', (ev) => {
    information.innerHTML =
      'Microphone access is blocked by your browser.<br>You can change that setting manually.';
    console.log({ errorPermissionBlocked: ev });
    stopRecognition();
  });
  annyang.addCallback('errorPermissionDenied', (ev) => {
    information.textContent =
      'You must allow microphone access, so we can hear you';
    console.log({ errorPermissionDenied: ev });
    stopRecognition();
  });
  annyang.addCallback('soundstart', () => {
    isReceivedSound = true;
    console.log('Anyang is hearing...');
    information.textContent = "I'm Listening...";
  });
  annyang.addCallback('end', () => {
    console.log('End of Speech');
    if (isReceivedSound) {
      information.textContent = `Say it clearly with Korean Accent`;
      stopRecognition();
    }
  });
  // annyang.addCallback('result', (phrases = []) => {
  //   console.log('result: ', phrases);
  // });
  annyang.addCallback('resultMatch', (userSaid, commandText, phrases) => {
    console.log({ phrases });
    // improve the accuracy, prevent 'Honda' word is considered correct
    if (phrases.length > 2) {
      wrongCounter++;
      information.textContent = 'Almost right';
      showWrongOrHint();
      stopRecognition();
      return;
    }
    wrongCounter = 0;
    correctPopup();
    wordMatch();
    console.log('Correct! ' + userSaid);
    stopRecognition();
  });
  annyang.addCallback('resultNoMatch', (phrases = []) => {
    wrongCounter++;
    information.textContent = "That's Wrong";
    showWrongOrHint();
    console.log({ resultNoMatch: phrases });
    stopRecognition();
  });

  startButton.onclick = function () {
    startRecognition();
  };

  stopButton.onclick = forceStopRecognition;

  function startRecognition() {
    setInitialUI();
    annyang.start({ autoRestart: true, continuous: false });
    isRecording = true;
    startRecordUI();
    console.log('Recognition is Started');
  }

  function stopRecognition() {
    if (!isRecording) {
      return;
    }
    cleanState();
    stopRecordUI();
    annyang.abort();
    console.log('Recognition is Stopped');
  }

  function forceStopRecognition() {
    stopRecognition();
    information.textContent = 'Please Click Record Button';
  }

  function cleanState() {
    isRecording = false;
    isReceivedSound = false;
  }

  function showWrongOrHint() {
    if (wrongCounter % 5 === 0) {
      googleHintShow();
    } else {
      wordNotMatch();
    }
  }
})(window.annyang, window.Aromanize);
