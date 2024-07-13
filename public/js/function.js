let mediaRecorder;
let recordedChunks = [];

function startMicrophoneInput() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function (stream) {
            console.log('Microphone access granted');

            mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.ondataavailable = function (event) {
                if (event.data.size > 0) {
                    recordedChunks.push(event.data);
                }
            };

            mediaRecorder.onstop = function () {
                let blob = new Blob(recordedChunks, { type: 'audio/webm' });
                let audioUrl = URL.createObjectURL(blob);
                console.log('Recording stopped, audio URL:', audioUrl);
            };

            mediaRecorder.start();

            setTimeout(function () {
                mediaRecorder.stop();
                stream.getTracks().forEach(track => track.stop());
                console.log('Recording stopped after 5 seconds');
            }, 5000);
        })
        .catch(function (err) {
            console.error('Error accessing microphone:', err);
        });
}

document.querySelector('.fa-microphone').addEventListener('click', startMicrophoneInput);


function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        console.log('Uploaded file:', file);

    }
}

function submitMessage() {
    var message = document.querySelector('.text-space').value.trim();
    if (message !== '') {
        console.log('Submitted message:', message);
    }
}

function generateOutput() {
    document.querySelector('.generate-text').style.display = 'block';
    setTimeout(function () {
        document.querySelector('.generate-text').style.display = 'none';
        console.log('Generated output displayed');
    }, 2000);
};

generateOutput();
document.querySelector('.text-space').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        submitMessage();
    }
});

document.querySelector('.fa-paperclip').addEventListener('click', function () {
    document.querySelector('.file-input').click();
});
document.querySelector('.file-input').addEventListener('change', function (event) {
    handleFileUpload(event);
});
function recordAudio() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(function (stream) {
                const audioRecorder = new MediaRecorder(stream);
                const chunks = [];

                audioRecorder.ondataavailable = function (event) {
                    chunks.push(event.data);
                };

                audioRecorder.onstop = function () {
                    const audioBlob = new Blob(chunks, { type: 'audio/wav' });
                    const audioElement = document.createElement('audio');
                    audioElement.src = audioUrl;
                    audioElement.controls = true;
                    document.body.appendChild(audioElement);
                };


                audioRecorder.start();
                setTimeout(function () {
                    audioRecorder.stop();
                    stream.getAudioTracks()[0].stop();
                }, 5000);
            })
            .catch(function (error) {
                console.error('Error accessing microphone:', error);
            });
    } else {
        console.error('MediaDevices API not supported');
    }
}
const microphoneIcon = document.querySelector('.fa-microphone');
microphoneIcon.addEventListener('click', recordAudio);

function selectImageFromGallery() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = function (event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = function () {
            const image = new Image();
            image.src = reader.result;
            document.body.appendChild(image);
        };
        reader.readAsDataURL(file);
    };
    input.click();
}

const cameraIcon = document.querySelector('.fa-camera');
cameraIcon.addEventListener('click', selectImageFromGallery);

function toggleMenu() {
    console.log('Toggle menu clicked');
    let menuDropdown = document.getElementById('menuDropdown');
    if (menuDropdown) {
        console.log('Menu dropdown found');
        if (menuDropdown.style.display == "block") {
            menuDropdown.style.display = 'none';
        }
        else {
            menuDropdown.style.display = "block"
        }
    } else {
        console.error('Error: Menu dropdown element not found.');
    }
}
let drop = document.querySelector('.dropdown-arrow');
let closeIcon = document.querySelector('.close-icon');

drop.addEventListener('click', () => {
    let menu = document.querySelector('.theme-options');
    menu.style.display = (menu.style.display == 'block') ? 'none' : 'block';
    drop.style.transform = (menu.style.display == 'none') ? 'rotate(0deg)' : 'rotate(180deg)';
    drop.style.marginTop = '-8px';
});
document.addEventListener('DOMContentLoaded', function () {
    const dropdownArrow = document.querySelector('.dropdown-arrow');
    const menu = document.querySelector('.menu-drop');
    let isOpen = false;

    dropdownArrow.addEventListener('click', function () {
        if (!isOpen) {
            menu.style.display = 'block';
            menu.style.height = '300px';
            isOpen = true;
            console.log('Menu opened.');
        } else {
            menu.style.display = 'block';
            menu.style.height = '200px';
            isOpen = false;
            console.log('Menu closed.');
        }
    });

    const closeIcon = document.querySelector('.close-icon');
    closeIcon.addEventListener('click', function () {
        menu.style.display = 'none';
    });
});
/*function toggleMen() {
    console.log('Toggle menu clicked');
    let menuDropdown = document.getElementById('menuDropdown');
    if (menuDropdown) {
        console.log('Menu dropdown found');
        if (menuDropdown.style.display == "block") {
            menuDropdown.style.display = 'none';
        }
        else {
            menuDropdown.style.display = "block"
        }
    } else {
        console.error('Error: Menu dropdown element not found.');
    }
}
let drops = document.querySelector('.dropdown-arrow');
let closIcon = document.querySelector('.close-icon');

drop.addEventListener('click', () => {
    let menu = document.querySelector('.theme-options');
    menu.style.display = (menu.style.display == 'block') ? 'none' : 'block';
    drops.style.transform = (menu.style.display == 'none') ? 'rotate(0deg)' : 'rotate(180deg)';
    drops.style.marginTop = '-8px';
});
document.addEventListener('DOMContentLoaded', function () {
    const dropdownArrows = document.querySelector('.dropdown-arrow');
    const menu = document.querySelector('.menu-drop');
    let isOpen = false;

    dropdownArrows.addEventListener('click', function () {
        if (!isOpen) {
            menu.style.display = 'block';
            menu.style.height = '340px';
            isOpen = true;
            console.log('Menu opened.');
            dropdownArrows.style.marginTop = '-8px';
        } else {
            menu.style.display = 'block';
            menu.style.height = '265px';
            isOpen = false;
            console.log('Menu closed.');
        }
    });

    const closIcon = document.querySelector('.close-icon');
    closIcon.addEventListener('click', function () {
        menu.style.display = 'none';
    });
});
*/