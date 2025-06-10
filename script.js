let currentMember = '';
let overlayIndex = 0;
let snapshots = [];

const overlayImage = document.getElementById('overlayImage');
const captureBtn = document.getElementById('captureBtn');
const downloadBtn = document.getElementById('downloadStripBtn');
const countdownEl = document.getElementById('countdown');
const photosContainer = document.getElementById('photosContainer');

// Get video stream
const video = document.getElementById('webcam');
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
  })
  .catch(err => console.error('Webcam error:', err));

// Remove Start Photo Session button
const startBtn = document.getElementById('startBtn');
if (startBtn) startBtn.style.display = 'none';

document.getElementById('memberSelect').onchange = function() {
  const member = this.value;
  overlayIndex = 1;
  snapshots = [];
  photosContainer.innerHTML = '';

  if (!member) {
    overlayImage.src = '';
    return;
  }

  // Update overlay options
  const overlaySelect = document.getElementById('overlaySelect');
  overlaySelect.innerHTML = '<option value="">-- Select Overlay --</option>';
  if (overlays[member]) {
    overlays[member].forEach((img, idx) => {
      const opt = document.createElement('option');
      opt.value = img;
      opt.textContent = img.replace('.png', '');
      overlaySelect.appendChild(opt);
    });
  }

  // Load first overlay by default
  overlayImage.src = `overlays/${member}/${capitalize(member)}1.png`;
};

const overlaySelect = document.createElement('select');
overlaySelect.id = 'overlaySelect';
overlaySelect.style.marginLeft = '10px';
overlaySelect.style.display = 'none'; // Hide by default

document.querySelector('.controls').appendChild(overlaySelect);

const overlays = {
  lia: [
    { file: 'Lia1.png', label: 'Lia Pose 1' },
    { file: 'Lia2.png', label: 'Lia Pose 2' },
    { file: 'Lia3.png', label: 'Lia Pose 3' },
    { file: 'Lia4.png', label: 'Lia Pose 4' }
  ],
  yeji: [
    { file: 'yeji1.png', label: 'Yeji Pose 1' },
    { file: 'yeji2.png', label: 'Yeji Pose 2' },
    { file: 'yeji3.png', label: 'Yeji Pose 3' },
    { file: 'yeji4.png', label: 'Yeji Pose 4' }
  ],
  ryujin: [
    { file: 'ryujin1.png', label: 'Ryujin Pose 1' },
    { file: 'ryujin2.png', label: 'Ryujin Pose 2' },
    { file: 'ryujin3.png', label: 'Ryujin Pose 3' },
    { file: 'ryujin4.png', label: 'Ryujin Pose 4' }
  ],
  chaeryeong: [
    { file: 'Chaeryeong1.png', label: 'Chaeryeong Pose 1' },
    { file: 'Chaeryeong2.png', label: 'Chaeryeong Pose 2' },
    { file: 'Chaeryeong3.png', label: 'Chaeryeong Pose 3' },
    { file: 'Chaeryeong4.png', label: 'Chaeryeong Pose 4' }
  ],
  yuna: [
    { file: 'yuna1.png', label: 'Yuna Pose 1' },
    { file: 'yuna2.png', label: 'Yuna Pose 2' },
    { file: 'yuna3.png', label: 'Yuna Pose 3' },
    { file: 'yuna4.png', label: 'Yuna Pose 4' }
  ],
  gowon: [
    { file: 'gowon1.png', label: 'Gowon Pose 1' },
    { file: 'gowon2.png', label: 'Gowon Pose 2' },
    { file: 'gowon3.png', label: 'Gowon Pose 3' },
    { file: 'gowon4.png', label: 'Gowon Pose 4' }
  ],
  dahyun: [
    { file: 'dahyun1.png', label: 'Dahyun Pose 1'},
    { file: 'dahyun2.png', label: 'Dahyun Pose 2'},
    { file: 'dahyun3.png', label: 'Dahyun Pose 3'},
    { file: 'dahyun4.png', label: 'Dahyun Pose 4'}
  ]
};

// Helper to capitalize first letter
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Helper to update overlay select options and image
function updateOverlayOptions(member) {
  overlaySelect.innerHTML = '';
  overlayImage.src = '';
  if (overlays[member] && overlays[member].length > 0) {
    overlays[member].forEach((obj, idx) => {
      const opt = document.createElement('option');
      opt.value = obj.file;
      opt.textContent = obj.label;
      overlaySelect.appendChild(opt);
    });
    overlaySelect.style.display = '';
    overlaySelect.selectedIndex = 0;
    overlayImage.src = `overlays/${member}/${overlays[member][0].file}`;
  } else if (member) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = 'No overlay';
    overlaySelect.appendChild(opt);
    overlaySelect.style.display = '';
    overlayImage.src = '';
  } else {
    overlaySelect.style.display = 'none';
    overlayImage.src = '';
  }
}

// Unified member select handler
const memberSelect = document.getElementById('memberSelect');
memberSelect.onchange = function() {
  overlayIndex = 1;
  snapshots = [];
  // Only clear overlays and overlay image, not photos
  updateOverlayOptions(this.value);
};

// Overlay select handler
overlaySelect.onchange = function() {
  const member = memberSelect.value;
  const overlay = overlaySelect.value;
  overlayImage.src = (member && overlay) ? `overlays/${member}/${overlay}` : '';
};

// Show capture button by default
captureBtn.style.display = 'inline-block';

function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._hideTimeout);
  toast._hideTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2000);
}

function takePhotoWithOverlay() {
  // Target overlay aspect ratio (4:3 for 400x300 overlays)
  const targetAspect = 4 / 3;
  const videoAspect = video.videoWidth / video.videoHeight;
  let sx, sy, sw, sh;
  if (videoAspect > targetAspect) {
    // Video is wider than overlay: crop sides
    sh = video.videoHeight;
    sw = sh * targetAspect;
    sx = (video.videoWidth - sw) / 2;
    sy = 0;
  } else {
    // Video is taller than overlay: crop top/bottom
    sw = video.videoWidth;
    sh = sw / targetAspect;
    sx = 0;
    sy = (video.videoHeight - sh) / 2;
  }
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 400;
  canvas.height = 300;
  ctx.save();
  if (isFlipped) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  ctx.restore();
  if (overlayImage.complete && overlayImage.src) {
    ctx.drawImage(overlayImage, 0, 0, canvas.width, canvas.height);
  }
  const dataUrl = canvas.toDataURL('image/png');
  const overlayLabel = overlaySelect.options[overlaySelect.selectedIndex]?.textContent || 'Photo';
  if (photosContainer) {
    const item = document.createElement('div');
    item.className = 'photo-item';
    const img = document.createElement('img');
    img.src = dataUrl;
    img.alt = overlayLabel;
    img.style.opacity = '0';
    setTimeout(() => { img.style.opacity = '1'; }, 10); // fade-in fallback
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = overlayLabel.replace(/\s+/g, '_') + '.png';
    link.className = 'photo-download';
    link.textContent = 'Download PNG';
    
    // Add delete button
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.className = 'photo-delete';
    delBtn.onclick = () => item.remove();
    item.appendChild(img);
    item.appendChild(link);
    item.appendChild(delBtn);
    photosContainer.appendChild(item);
    showToast('Photo saved!');
  } else {
    console.error('photosContainer not found');
  }
}

let isCountdownActive = false;

function pulseCameraSection() {
  const preview = document.querySelector('.preview');
  if (!preview) return;
  preview.classList.add('pulse');
  setTimeout(() => preview.classList.remove('pulse'), 350);
}

// Flash button logic
const flashBtn = document.getElementById('flashBtn');
const flashOnIcon = document.getElementById('flashOnIcon');
const flashOffIcon = document.getElementById('flashOffIcon');
let flashEnabled = true; // Default ON

// Set initial state for flash button
flashOnIcon.style.display = '';
flashOffIcon.style.display = 'none';
flashBtn.title = 'Toggle Flash (default: on)';

flashBtn.addEventListener('click', () => {
  flashEnabled = !flashEnabled;
  if (flashEnabled) {
    flashOnIcon.style.display = '';
    flashOffIcon.style.display = 'none';
    flashBtn.title = 'Toggle Flash (default: on)';
  } else {
    flashOnIcon.style.display = 'none';
    flashOffIcon.style.display = '';
    flashBtn.title = 'Toggle Flash (default: off)';
  }
});

function showFlashEffect() {
  const flashDiv = document.createElement('div');
  flashDiv.className = 'flash-effect';
  document.body.appendChild(flashDiv);
  setTimeout(() => {
    flashDiv.style.opacity = '0';
    setTimeout(() => flashDiv.remove(), 300);
  }, 120);
}

captureBtn.onclick = function() {
  if (isCountdownActive) return;
  isCountdownActive = true;
  captureBtn.disabled = true;
  let count = 3;
  countdownEl.style.display = 'block';
  countdownEl.textContent = count;
  countdownEl.className = 'countdown';
  countdownEl.style.opacity = '0.7';
  countdownEl.style.color = '#fff';
  let pulses = 0;
  const interval = setInterval(() => {
    count--;
    if (count > 0) {
      countdownEl.textContent = count;
      pulseCameraSection();
      pulses++;
    } else {
      clearInterval(interval);
      countdownEl.style.display = 'none';
      if (flashEnabled) showFlashEffect();
      setTimeout(() => {
        takePhotoWithOverlay();
        isCountdownActive = false;
        captureBtn.disabled = false;
      }, flashEnabled ? 120 : 0);
    }
  }, 1000);
};

let isFlipped = true; // Default to mirror for selfie

const flipBtn = document.getElementById('flipBtn');
flipBtn.addEventListener('click', () => {
  isFlipped = !isFlipped;
  const video = document.getElementById('webcam');
  if (isFlipped) {
    video.style.transform = 'scaleX(-1)';
  } else {
    video.style.transform = 'scaleX(1)';
  }
});

// Set initial flip state
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('webcam').style.transform = 'scaleX(-1)';
});

// Tooltip repositioning on hover for flash, flip, and upscale buttons
function positionTooltip(btn) {
  const tooltip = btn.querySelector('.tooltip');
  if (!tooltip) return;
  const rect = btn.getBoundingClientRect();
  tooltip.style.top = (rect.top - tooltip.offsetHeight - 8) + 'px';
  tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
}

['flashBtn', 'flipBtn', 'upscaleBtn'].forEach(id => {
  const btn = document.getElementById(id);
  if (btn) {
    btn.addEventListener('mouseenter', () => positionTooltip(btn));
    btn.addEventListener('focus', () => positionTooltip(btn));
  }
});

// Upscale button logic
const upscaleBtn = document.getElementById('upscaleBtn');
let isUpscaled = false;

function getUpscaledOverlayFile(file) {
  // e.g. yeji1.png -> yejiUp1.png, Lia1.png -> LiaUp1.png
  if (!file) return '';
  return file.replace(/(\w+)(\d+)\.png$/i, (match, name, num) => {
    if (name.endsWith('Up')) return name + num + '.png';
    return name + 'Up' + num + '.png';
  });
}

function getNormalOverlayFile(file) {
  // e.g. yejiUp1.png -> yeji1.png, LiaUp1.png -> Lia1.png
  if (!file) return '';
  return file.replace(/Up(\d+)\.png$/i, '$1.png');
}

upscaleBtn.addEventListener('click', () => {
  const member = memberSelect.value;
  const overlay = overlaySelect.value;
  if (!overlay) return;
  let newFile;
  if (!isUpscaled) {
    newFile = getUpscaledOverlayFile(overlay);
    isUpscaled = true;
    upscaleBtn.title = 'Swap to Normal Overlay';
    upscaleBtn.querySelector('.tooltip').textContent = 'Swap to Normal Overlay';
  } else {
    newFile = getNormalOverlayFile(overlay);
    isUpscaled = false;
    upscaleBtn.title = 'Swap to Upscaled Overlay';
    upscaleBtn.querySelector('.tooltip').textContent = 'Swap to Upscaled Overlay';
  }
  overlayImage.src = `overlays/${member}/${newFile}`;
});

// When overlay changes, reset upscale state
overlaySelect.addEventListener('change', () => {
  isUpscaled = false;
  upscaleBtn.title = 'Swap to Upscaled Overlay';
  upscaleBtn.querySelector('.tooltip').textContent = 'Swap to Upscaled Overlay';
});

// Also reset upscale state when member changes
memberSelect.addEventListener('change', () => {
  isUpscaled = false;
  upscaleBtn.title = 'Swap to Upscaled Overlay';
  upscaleBtn.querySelector('.tooltip').textContent = 'Swap to Upscaled Overlay';
});
