const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechGrammarList =
  window.SpeechGrammarList || window.webkitSpeechGrammarList;
const SpeechRecognitionEvent =
  window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;
const annyang = window.annyang;

addCompat('SpeechRecognition', Boolean(SpeechRecognition));
addCompat('SpeechGrammarList', Boolean(SpeechGrammarList));
addCompat('SpeechRecognitionEvent', Boolean(SpeechRecognitionEvent));

let WORD_TO_SAY = '현대'; // hyundai
let WORD_TO_SAY_LATIN = 'Hyundai';
let LANG = 'ko-KR'; // language: korean, country: Korea
let fullWordToSay = getFullWord();
let tryCount = 0;
let trueCount = 0;
// WORD_TO_SAY = 'hyundai';
// WORD_TO_SAY_LATIN = 'Hyundai';
// LANG = 'en-US';
fullWordToSay = getFullWord();
document.querySelector('.js-word-to-say').textContent = fullWordToSay;

const resultArea = document.querySelector('.js-info');
const startButton = document.querySelector('.js-start');
const stopButton = document.querySelector('.js-stop');
const phrasesText = document.querySelector('.js-phrases');
const accuracy = document.querySelector('.js-acc');

let isRecording = false;
const speechServices = {
  el: null,
  current: '',
  add(value, text) {
    if (!this.el) {
      const select = document.createElement('select');
      select.id = 'speech-services';
      select.onchange = (event) => {
        this.current = event.target.value;
      };
      document.querySelector('.js-services').append(select);
      this.el = select;
    }
    const option = document.createElement('option');
    option.value = value;
    option.textContent = text;
    this.el.append(option);
    if (!this.current) {
      this.current = value;
    }
  },
};

if (!SpeechRecognition) {
  errorCompat('SpeechRecognition');
}

var recognition = new SpeechRecognition();
if (false) {
  if (SpeechGrammarList) {
    // SpeechGrammarList is not currently available in Safari, and does not have any effect in any other browser.
    // This code is provided as a demonstration of possible capability. You may choose not to use it.
    var speechRecognitionList = new SpeechGrammarList();
    var grammar =
      '#JSGF V1.0; grammar colors; public <color> = ' +
      colors.join(' | ') +
      ' ;';
    speechRecognitionList.addFromString(grammar, 1);
    recognition.grammars = speechRecognitionList;
  }
}
recognition.continuous = false;
recognition.lang = LANG;
recognition.interimResults = true; // apakah hasil ucapan non final perlu diambil
recognition.maxAlternatives = 1;

// Unimplemented Service
// speechServices.add('web', 'Web Speech API');

if (annyang) {
  annyang.addCommands({
    [WORD_TO_SAY]: function () {
      alert(`CORRECT! you said ${fullWordToSay}`);
    },
  });
  annyang.setLanguage(LANG);
  annyang.addCallback('error', (ev) => {
    switch (ev.error) {
      case 'aborted':
        resultArea.textContent = 'Okay, we are finished';
        break;
    }
    stopRecording();
    console.log(ev);
  });
  annyang.addCallback('errorNetwork', (ev) => {
    resultArea.textContent = 'Network Error';
    stopRecording();
    console.log(ev);
  });
  annyang.addCallback('errorPermissionBlocked', (ev) => {
    resultArea.textContent = 'Browser does not allow this service';
    stopRecording();
    console.log(ev);
  });
  annyang.addCallback('errorPermissionDenied', (ev) => {
    resultArea.textContent = 'You must allow microphone access';
    stopRecording();
    console.log(ev);
  });
  annyang.addCallback('soundstart', () => {
    resultArea.textContent = 'I am hearing...';
  });
  annyang.addCallback('end', () => {
    // stopRecording();
    console.log('Anyang is paused, ready for the next speech');
  });
  annyang.addCallback('result', (phrases = []) => {
    phrasesText.innerHTML = phrases
      .map((phrase) => `${phrase} (${Aromanize.romanize(phrase)})`)
      .join('<br>');
    console.log(phrases);
    sumAccuracy(trueCount, tryCount);
  });
  annyang.addCallback('resultMatch', (userSaid, commandText, phrases) => {
    resultArea.textContent = `That's right! '${userSaid}'`;
    phrasesText.innerHTML = phrases
      .map((phrase) => `${phrase} (${Aromanize.romanize(phrase)})`)
      .join('<br>');
    console.log(userSaid); // sample output: 'hello'
    console.log(commandText); // sample output: 'hello (there)'
    console.log(phrases); // sample output: ['hello', 'halo', 'yellow', 'polo', 'hello kitty']
    trueCount += 1;
    sumAccuracy(trueCount, tryCount);
    stopRecording();
  });
  annyang.addCallback('resultNoMatch', (ev) => {
    console.log(ev);
    resultArea.textContent = `Please say '${fullWordToSay}'`;
    // stopRecording();
  });
  speechServices.add('annyang', 'Annyang Library');
}

startButton.onclick = function () {
  startRecording();
  tryCount += 1;
};

stopButton.onclick = function () {
  stopRecording();
};

recognition.onresult = function (event) {
  console.log({
    'SpeechRecognition.onresult.event': event,
  });
  // The SpeechRecognitionEvent results property returns a SpeechRecognitionResultList object
  // The SpeechRecognitionResultList object contains SpeechRecognitionResult objects.
  // It has a getter so it can be accessed like an array
  // The first [0] returns the SpeechRecognitionResult at the last position.
  // Each SpeechRecognitionResult object contains SpeechRecognitionAlternative objects that contain individual results.
  // These also have getters so they can be accessed like arrays.
  // The second [0] returns the SpeechRecognitionAlternative at position 0.
  // We then return the transcript property of the SpeechRecognitionAlternative object
  var word = event.results[0][0].transcript;
  var confidence = event.results[0][0].confidence;

  resultArea.textContent = `Result received: ${word}. Confidence: ${confidence}`;
  recording(false);
};

recognition.onspeechend = function (event) {
  console.log({
    'SpeechRecognition.onspeechend.event': event,
  });
  recognition.stop();
  recording(false);
};

recognition.onnomatch = function (event) {
  console.log({
    'SpeechRecognition.onnomatch.event': event,
  });
  resultArea.textContent = `Please say ${WORD_TO_SAY} (${WORD_TO_SAY_LATIN})`;
  recording(false);
};

recognition.onerror = function (event) {
  console.log({
    'SpeechRecognition.onerror.event': event,
  });
  resultArea.textContent = 'Error occurred in recognition: ' + event.error;
  recording(false);
};

function sumAccuracy(correct, count) {
  console.log(correct + '/' + count + ' = ' + (correct / count) * 100 + '%');
  accuracy.textContent = (correct / count) * 100 + '%';
}

function startRecording() {
  isRecording = true;
  switch (speechServices.current) {
    case 'web':
      recognition.start();
      break;
    case 'annyang':
      annyang.start({ autoRestart: true, continuous: false });
      phrasesText.textContent = '';
      break;
    default:
      isRecording = false;
      return;
  }
  resultArea.textContent = '';
  recording(true);
  console.log('Recognition Started');
}

function stopRecording() {
  if (!isRecording) {
    return;
  }
  switch (speechServices.current) {
    case 'web':
      recognition.stop();
      break;
    case 'annyang':
      annyang.debug();
      annyang.abort();
      break;
  }
  recording(false);
  console.log('Recognition Stopped');
}

function addCompat(name, isSupport) {
  const compatList = document.querySelector('.js-compat');
  const li = document.createElement('li');
  li.textContent = `${name}: ${isSupport ? 'YES' : 'NO'}`;
  compatList.append(li);
}

function errorCompat(name) {
  throw new Error(`${name} is not supported!`);
}

function recording(start) {
  const recordingEl = document.querySelector('.js-recording');
  if (start) {
    recordingEl.classList.add('start');
  } else {
    recordingEl.classList.remove('start');
  }
}

function getFullWord() {
  return LANG === 'ko-KR'
    ? `${WORD_TO_SAY} (${WORD_TO_SAY_LATIN})`
    : WORD_TO_SAY_LATIN;
}
