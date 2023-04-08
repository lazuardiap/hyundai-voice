if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  console.log('getUserMedia is supported.');
  navigator.mediaDevices
    .getUserMedia(
      // constraints - only audio needed for this app
      {
        audio: true,
      }
    )

    // Success callback
    .then((stream) => {
      let mimeType;

      const audio = document.getElementById("audioo");
        audio.setAttribute("controls", "");

      if(MediaRecorder.isTypeSupported('audio/webm;codecs=opus')){
        mimeType = 'audio/webm;codecs=opus';
      } else if(MediaRecorder.isTypeSupported('audio/webm')){
        mimeType = 'audio/webm';
      } else if(MediaRecorder.isTypeSupported('audio/ogg')){
        mimeType = 'audio/ogg'
      } else if(MediaRecorder.isTypeSupported('audio/mp4')){
        mimeType = 'audio/mp4'
      } else {
        notCompatible();
        throw new Error(`User agent does not support ${mimeType}`);
      }
      alert(`Your mimeType ${mimeType}`)
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType,
      });
      mediaRecorder.mimeType
      var reader = new FileReader();

      let chunks = [];

      startButton.onclick = function () {
        startRecognition();
      };

      stopButton.onclick = function () {
        stopRecognition();
        information.textContent = 'Please Click Record Button';
      };

      function startRecognition() {
        setInitialUI();
        startRecordUI();
        mediaRecorder.start();
        console.log(mediaRecorder.state);
      }

      function stopRecognition() {
        stopRecordUI();
        mediaRecorder.stop();
        console.log(mediaRecorder.state);
      }

      //Push binary to array
      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      mediaRecorder.onstop = (e) => {
        const blob = new Blob(chunks, { type: 'audio/mp4'});
        chunks = [];
        reader.readAsDataURL(blob);
        console.log(
          'Copy full of this text and open in new tab to listen your audio:\n',
          URL.createObjectURL(blob)
        );
      };

      

      function dataURLtoFile(dataurl, filename) {
 
        var arr = dataurl.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), 
            n = bstr.length, 
            u8arr = new Uint8Array(n);
            
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        
        return new File([u8arr], filename, {type:mime});
    }

      //Read Base64
      reader.onloadend = function () {
        information.textContent = 'Analyzing Transcript...';
        console.log(reader.result);
        console.log(dataURLtoFile(reader.result, "audio"));

        audio.src = reader.result;

        // const encoding = {
        //   'audio/webm;codecs=opus': 'WEBM_OPUS',
        //   'audio/webm': 'WEBM_OPUS',
        //   'audio/ogg' : 'OGG_OPUS',
        //   'audio/mp4;codecs=mp4a': 'WEBM_OPUS',
        //   'audio/mp4': 'WEBM_OPUS',
        // }[mimeType]

        const encoding = 'WEBM_OPUS';

        // alert(`Your encoding ${encoding}`);

        fetch(
          'https://speech.googleapis.com/v1p1beta1/speech:recognize?key=' +
            atob('QUl6YVN5QWw4N1pCbEhyZnNuWXBvcjI3R3UwNlhQeDBzNkxIa2g4'),
          {
            method: 'POST',
            body: JSON.stringify({
              audio: {
                content: reader.result.split(',')[1],
              },
              config: {
                enableAutomaticPunctuation: false,
                encoding: encoding,
                languageCode: 'ko-KR',
                model: 'latest_short',
                sampleRateHertz: 48000,
                // "speechContexts": [
                //   {
                //     "phrases": ["Hello"],
                //     "boost" : 20
                //   }
                // ]
              },
            }),
            headers: {
              'Content-type': 'application/json; charset=UTF-8',
            },
          }
        )
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            compareTranscript(data);
          });
      };

      function compareTranscript(data) {
        if (!data.results) {
          wordNotMatch();
          information.textContent = 'Please say it clearly with Korean Accent';
          return;
        }
        const { transcript, confidence } = data.results[0].alternatives[0];
        alert(transcript);
        console.log({
          text: transcript,
          accuracy: (parseFloat(confidence) * 100).toPrecision(2) + '%',
        });
        if (transcript.includes('현대')) {
          correctPopup();
          wordMatch();
        } else {
          wordNotMatch();
          information.textContent = 'That is not Hyundai';
        }
      }
    })
    // Error callback
    .catch((err) => {
      console.error(`The following getUserMedia error occurred: ${err}`);
    });
} else {
  notCompatible();
  throw new Error('getUserMedia is not supported on your browser!');
}
