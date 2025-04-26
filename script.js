const fileInput = document.querySelector("input"),
  img = document.querySelector("img"),
  video = document.querySelector("video"),
  qrCodeView = document.querySelector(".qrCodeView"),
  iconGroup = document.querySelector(".iconGroup"),
  textarea = document.querySelector("textarea"),
  displayMessage = document.querySelector("p"),
  qrTextDetails = document.querySelector(".qrTextDetails"),
  stopScan = document.getElementById("stopScan")

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0]
  if (!file) return
  fetchQRCodeResponse(file)
})

function fetchQRCodeResponse(file) {
  const formData = new FormData()
  formData.append("file", file)

  fetch("https://api.qrserver.com/v1/read-qr-code/", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      textarea.innerText = ""
      const result = data[0].symbol[0].data

      if (!result) return (displayMessage.innerText = "Could not read QR code!")

      qrTextDetails.style.display = "block"
      textarea.innerText = result

      img.style.display = "block"
      img.src = URL.createObjectURL(file)

      iconGroup.style.display = "none"
      qrCodeView.style.display = "flex"
    })
}

function copyQRCodeText() {
  const text = textarea.textContent
  navigator.clipboard.writeText(text).then(() => {
    displayMessage.innerText = "QR code text copied to clipboard!"
    setTimeout(() => {
      displayMessage.innerText = ""
    }, 2000)
  })
}

function closeQRCodeReader() {
  displayMessage.innerText = "Upload or Scan QR Code to Read"
  iconGroup.style.display = "block"
  img.style.display = "none"
  video.style.display = "none"
  qrTextDetails.style.display = "none"
  textarea.innerText = ""
  fileInput.value = ""
  stopScan.style.display = "none"
}

// Add this function to handle responsive camera selection
function ScanQRImage() {
  const scanner = new Instascan.Scanner({ video: video, captureImage: true })
  if (scanner) {
    displayMessage.innerText = "Loading Camera...Please wait!"

    Instascan.Camera.getCameras()
      .then((cameras) => {
        if (cameras.length > 0) {
          // Try to use the back camera on mobile devices if available
          const backCamera = cameras.find((camera) => camera.name && camera.name.toLowerCase().includes("back"))
          scanner.start(backCamera || cameras[0])

          video.style.display = "block"
          iconGroup.style.display = "none"

          stopScan.style.display = "inline"
          stopScan.onclick = () => {
            scanner.stop()
            closeQRCodeReader()
          }
        }
      })
      .catch((err) => {
        displayMessage.innerText = "Request Camera Access Denied!Reset Permissions"
        console.log(err)
      })

    scanner.addListener("scan", (text, image) => {
      qrTextDetails.style.display = "block"
      qrCodeView.style.display = "flex"
      video.style.display = "none"
      if (scanner) scanner.stop()

      img.style.display = "block"
      img.src = image

      stopScan.style.display = "none"
      textarea.innerText = text
    })
  }
}
