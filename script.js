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

  // Load first overlay by default
  overlayImage.src = `overlays/${member}/${capitalize(member)}1.png`;
};

const overlays = {
  lia: [
    { file: 'lia1.png', label: 'Lia Pose 1' },
    { file: 'lia2.png', label: 'Lia Pose 2' },
    { file: 'lia3.png', label: 'Lia Pose 3' },
    { file: 'lia4.png', label: 'Lia Pose 4' }
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
    { file: 'chaeryeong1.png', label: 'Chaeryeong Pose 1' },
    { file: 'chaeryeong2.png', label: 'Chaeryeong Pose 2' },
    { file: 'chaeryeong3.png', label: 'Chaeryeong Pose 3' },
    { file: 'chaeryeong4.png', label: 'Chaeryeong Pose 4' }
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

// Idol group mapping for filtering
const idolGroups = {
  itzy: ['yeji', 'lia', 'ryujin', 'chaeryeong', 'yuna'],
  loona: ['gowon'],
  twice: ['dahyun']
};

const groupSelect = document.getElementById('groupSelect');
const memberSelect = document.getElementById('memberSelect');
const poseGrid = document.getElementById('poseGrid');

function getMemberOverlays(member) {
  return overlays[member] || [];
}

let posePage = 0;
const POSES_PER_PAGE = 9;

function renderPoseGrid(members, page = 0) {
  poseGrid.innerHTML = '';
  if (!members || members.length === 0) return;
  // Gather all overlays for the current filter
  let allOverlays = [];
  members.forEach(member => {
    const memberOverlays = getMemberOverlays(member).filter(obj => !/Up\d+\.png$/i.test(obj.file));
    memberOverlays.forEach((obj, idx) => {
      allOverlays.push({ member, obj });
    });
  });
  // Pagination
  const totalPages = Math.ceil(allOverlays.length / POSES_PER_PAGE);
  const start = page * POSES_PER_PAGE;
  const end = start + POSES_PER_PAGE;
  const overlaysToShow = allOverlays.slice(start, end);
  overlaysToShow.forEach(({ member, obj }) => {
    const poseDiv = document.createElement('div');
    poseDiv.className = 'pose-thumb';
    const img = document.createElement('img');
    img.src = `overlays/${member}/${obj.file}`;
    img.alt = obj.label;
    img.title = obj.label;
    poseDiv.appendChild(img);
    const label = document.createElement('div');
    label.className = 'pose-label';
    label.textContent = obj.label;
    poseDiv.appendChild(label);
    poseDiv.addEventListener('click', () => {
      memberSelect.value = member;
      overlayImage.src = `overlays/${member}/${obj.file}`;
      currentOverlayFile = obj.file;
      isUpscaled = false;
      upscaleBtn.title = 'Swap to Upscaled Overlay';
      upscaleBtn.querySelector('.tooltip').textContent = 'Swap to Upscaled Overlay';
    });
    poseGrid.appendChild(poseDiv);
  });
  // Pagination controls
  if (totalPages > 1) {
    const paginationDiv = document.createElement('div');
    paginationDiv.className = 'pose-pagination';
    // Add a spacer div if overlaysToShow.length % 3 !== 0 to push pagination to new line
    if (overlaysToShow.length % 3 !== 0) {
      const spacer = document.createElement('div');
      spacer.style.flexBasis = '100%';
      spacer.style.height = '0';
      poseGrid.appendChild(spacer);
    }
    if (page > 0) {
      const prevBtn = document.createElement('button');
      prevBtn.className = 'pose-page-btn arrow-btn';
      prevBtn.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 18l-6-6 6-6" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      prevBtn.onclick = () => {
        posePage--;
        renderPoseGrid(members, posePage);
      };
      paginationDiv.appendChild(prevBtn);
    }
    const pageIndicator = document.createElement('span');
    pageIndicator.className = 'pose-page-indicator';
    pageIndicator.textContent = `Page ${page + 1} of ${totalPages}`;
    paginationDiv.appendChild(pageIndicator);
    if (page < totalPages - 1) {
      const nextBtn = document.createElement('button');
      nextBtn.className = 'pose-page-btn arrow-btn';
      nextBtn.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 6l6 6-6 6" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      nextBtn.onclick = () => {
        posePage++;
        renderPoseGrid(members, posePage);
      };
      paginationDiv.appendChild(nextBtn);
    }
    poseGrid.appendChild(paginationDiv);
  }
}

function filterMembersByGroup(group) {
  for (const option of memberSelect.options) {
    if (!option.value || option.value === 'all') continue;
    const idol = option.value;
    const idolGroup = Object.keys(idolGroups).find(g => idolGroups[g].includes(idol));
    option.style.display = (group === 'all' || idolGroup === group) ? '' : 'none';
  }
  // If current selection is not in group, reset to all
  if (memberSelect.value !== 'all' && memberSelect.options[memberSelect.selectedIndex].style.display === 'none') {
    memberSelect.value = 'all';
  }
}

groupSelect.addEventListener('change', function() {
  filterMembersByGroup(this.value);
  // Show all members of group in grid
  let members = [];
  if (this.value === 'all') {
    members = Object.values(idolGroups).flat();
  } else {
    members = idolGroups[this.value] || [];
  }
  memberSelect.value = 'all';
  posePage = 0;
  renderPoseGrid(members, posePage);
});

memberSelect.addEventListener('change', function() {
  if (this.value === 'all') {
    let group = groupSelect.value;
    let members = group === 'all' ? Object.values(idolGroups).flat() : idolGroups[group] || [];
    posePage = 0;
    renderPoseGrid(members, posePage);
  } else {
    posePage = 0;
    renderPoseGrid([this.value], posePage);
  }
});

// Helper to capitalize first letter
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Unified member select handler
memberSelect.onchange = function() {
  overlayIndex = 1;
  snapshots = [];
  // Only clear overlays and overlay image, not photos
  updateOverlayOptions(this.value);
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
  // Use currentOverlayFile or fallback to 'Photo'
  const overlayLabel = currentOverlayFile || 'Photo';
  if (photosContainer) {
    const item = document.createElement('div');
    item.className = 'photo-item';
    const img = document.createElement('img');
    img.src = dataUrl;
    img.alt = overlayLabel;
    img.style.opacity = '0';
    setTimeout(() => { img.style.opacity = '1'; }, 10);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = overlayLabel.replace(/\s+/g, '_') + '.png';
    link.className = 'photo-download';
    link.textContent = 'Download PNG';
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
  groupSelect.value = 'all';
  memberSelect.value = 'all';
  filterMembersByGroup('all');
  posePage = 0;
  renderPoseGrid(Object.values(idolGroups).flat(), posePage);
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

// Track the current overlay file for upscaling
let currentOverlayFile = null;

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
  if (!currentOverlayFile) return;
  let newFile;
  if (!isUpscaled) {
    newFile = getUpscaledOverlayFile(currentOverlayFile);
    isUpscaled = true;
    upscaleBtn.title = 'Swap to Normal Overlay';
    upscaleBtn.querySelector('.tooltip').textContent = 'Swap to Normal Overlay';
  } else {
    newFile = getNormalOverlayFile(currentOverlayFile);
    isUpscaled = false;
    upscaleBtn.title = 'Swap to Upscaled Overlay';
    upscaleBtn.querySelector('.tooltip').textContent = 'Swap to Upscaled Overlay';
  }
  overlayImage.src = `overlays/${member}/${newFile}`;
  currentOverlayFile = newFile;
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

// Initial render
filterMembersByGroup('all');
renderPoseGrid(Object.values(idolGroups).flat());
