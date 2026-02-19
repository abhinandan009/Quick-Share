document.addEventListener("DOMContentLoaded", function () {

    // Prevent browser from opening file when dropped outside drop zone
    document.addEventListener('dragover', (e) => e.preventDefault());
    document.addEventListener('drop', (e) => e.preventDefault());

    const uploadBtn = document.getElementById("uploadBtn");
    const fileInput = document.getElementById("fileInput");
    const result = document.getElementById("result");
    const dropZone = document.getElementById("dropZone");
    const fileInfo = document.getElementById("fileInfo");
    const fileName = document.getElementById("fileName");
    const fileSize = document.getElementById("fileSize");
    const fileRemove = document.getElementById("fileRemove");

    const progressContainer = document.getElementById("progressContainer");
    const uploadProgress = document.getElementById("uploadProgress");

    // ✅ FIX: Separate variable to hold dragged file
    let draggedFile = null;

    // Confetti function
    function createConfetti() {
        const canvas = document.createElement('canvas');
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '9999';
        document.body.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        const colors = ['#D6AA9F', '#987185', '#F4E2D1', '#E9D5B7', '#EFE2CF', '#ff6b9d', '#ffd93d'];
        const particleCount = 100;

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: canvas.width / 2,
                y: canvas.height / 2,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10 - 5,
                size: Math.random() * 8 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10
            });
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((p, index) => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.3;
                p.rotation += p.rotationSpeed;

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                ctx.restore();

                if (p.y > canvas.height + 50) {
                    particles.splice(index, 1);
                }
            });

            if (particles.length > 0) {
                requestAnimationFrame(animate);
            } else {
                document.body.removeChild(canvas);
            }
        }

        animate();

        setTimeout(() => {
            if (canvas.parentNode) {
                document.body.removeChild(canvas);
            }
        }, 5000);
    }

    // ✅ Toast notification for download complete
    function showToast() {
        const existing = document.getElementById('downloadToast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.id = 'downloadToast';
        toast.className = 'download-toast';
        toast.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2.5"
                stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <div class="download-toast-text">
                <span class="download-toast-title">Download Complete</span>
                <span class="download-toast-sub">Your file has been saved</span>
            </div>
        `;
        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                toast.classList.add('download-toast-show');
            });
        });

        setTimeout(() => {
            toast.classList.remove('download-toast-show');
            toast.classList.add('download-toast-hide');
            setTimeout(() => {
                if (toast.parentNode) toast.remove();
            }, 400);
        }, 5000);
    }

    // Format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    // Update file display
    function updateFileDisplay(file) {
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
        dropZone.style.display = 'none';
        fileInfo.style.display = 'flex';
    }

    // Reset file display
    function resetFileDisplay() {
        dropZone.style.display = 'block';
        fileInfo.style.display = 'none';
        fileInput.value = '';
        draggedFile = null;
    }

    let isDragging = false;
    let justDropped = false;

    dropZone.addEventListener('click', () => {
        if (!isDragging && !justDropped) {
            fileInput.click();
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            draggedFile = null;
            updateFileDisplay(e.target.files[0]);
        }
    });

    fileRemove.addEventListener('click', (e) => {
        e.stopPropagation();
        resetFileDisplay();
    });

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            isDragging = true;
            dropZone.classList.add('drag-over');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('drag-over');
        });
    });

    dropZone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            draggedFile = files[0];
            updateFileDisplay(files[0]);
        }
        justDropped = true;
        isDragging = false;
        setTimeout(() => { justDropped = false; }, 500);
    });

    // Upload button
    uploadBtn.addEventListener("click", function () {
        const fileToUpload = draggedFile || fileInput.files[0];

        if (!fileToUpload) {
            alert("Please select a file first");
            return;
        }

        result.innerHTML = "";
        progressContainer.classList.remove("d-none");
        uploadProgress.style.width = "0%";
        uploadProgress.textContent = "0%";

        const formData = new FormData();
        formData.append("file", fileToUpload);

        const xhr = new XMLHttpRequest();
        xhr.open("POST", "php/upload.php", true);

        xhr.upload.onprogress = function (e) {
            if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                uploadProgress.style.width = percent + "%";
                uploadProgress.textContent = percent + "%";
            }
        };

        xhr.onload = function () {
            progressContainer.classList.add("d-none");

            if (xhr.status === 200 && xhr.responseText.startsWith("SUCCESS")) {
                const shareCode = xhr.responseText.split("|")[1];

                result.innerHTML = `
                    <div class="alert alert-success slide-in">
                        <strong>Upload Successful</strong><br><br>
                        <div class="code-container">
                            <span class="code-label">Share Code:</span>
                            <span class="code-value">${shareCode}</span>
                            <button class="copy-btn" id="copyBtn" data-code="${shareCode}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                </svg>
                                <span class="copy-text">Copy</span>
                            </button>
                        </div>
                    </div>
                `;

                // Shrink divider margin after upload so everything fits on screen
                document.querySelector('.divider').style.margin = '8px 0';

                createConfetti();
                resetFileDisplay();

                // ✅ CHANGED: Copy button now uses execCommand for HTTP compatibility
                const copyBtn = document.getElementById("copyBtn");
                copyBtn.addEventListener("click", function () {
                    const code = this.getAttribute("data-code");
                    const copyText = this.querySelector(".copy-text");

                    try {
                        const textArea = document.createElement("textarea");
                        textArea.value = code;
                        textArea.style.position = 'fixed';
                        textArea.style.opacity = '0';
                        document.body.appendChild(textArea);
                        textArea.focus();
                        textArea.select();
                        document.execCommand("copy");
                        document.body.removeChild(textArea);
                        copyText.textContent = "Copied!";
                        copyBtn.classList.add("copied");
                        setTimeout(() => {
                            copyText.textContent = "Copy";
                            copyBtn.classList.remove("copied");
                        }, 2000);
                    } catch (err) {
                        copyText.textContent = "Failed";
                        setTimeout(() => {
                            copyText.textContent = "Copy";
                        }, 2000);
                    }
                });

            } else {
                result.innerHTML = `<div class="alert alert-danger">Upload failed</div>`;
                document.querySelector('.divider').style.margin = '8px 0';
            }
        };

        xhr.onerror = function () {
            progressContainer.classList.add("d-none");
            result.innerHTML = `<div class="alert alert-danger">Server error</div>`;
            document.querySelector('.divider').style.margin = '8px 0';
        };

        xhr.send(formData);
    });

    // ✅ Intercept download form with fetch
    const downloadForm = document.querySelector('form[action="php/download.php"]');
    const codeInput = document.getElementById("codeInput");
    const downloadBtn = document.querySelector('.btn-download');

    downloadForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const code = codeInput.value.trim();
        if (!code) return;

        downloadBtn.textContent = "Downloading...";
        downloadBtn.disabled = true;

        fetch(`php/download.php?code=${encodeURIComponent(code)}`)
            .then(response => {
                if (response.redirected && response.url.includes('error.html')) {
                    const url = new URL(response.url);
                    const type = url.searchParams.get('type') || 'invalid';
                    throw new Error(type);
                }

                const contentType = response.headers.get('Content-Type') || '';
                if (contentType.includes('text/html')) {
                    throw new Error('invalid');
                }

                if (!response.ok) throw new Error('invalid');

                const disposition = response.headers.get('Content-Disposition') || '';
                let filename = 'download';
                const match = disposition.match(/filename="?([^"]+)"?/);
                if (match) filename = match[1];

                return response.blob().then(blob => ({ blob, filename }));
            })
            .then(({ blob, filename }) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                downloadBtn.textContent = "Download File";
                downloadBtn.disabled = false;
                codeInput.value = '';

                showToast();
            })
            .catch(err => {
                downloadBtn.textContent = "Download File";
                downloadBtn.disabled = false;
                const type = err.message || 'invalid';
                window.location.href = `/quick_share/error.html?type=${type}`;
            });
    });

});
