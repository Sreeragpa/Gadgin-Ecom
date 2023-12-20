const imginput = document.getElementById('img-input');
 const productbtn = document.getElementById('add-pdt-btn')
let files = [];

document.getElementById('img-input').addEventListener('change',(event)=>{
  const file = imginput.files;
  const savedImg = document.getElementById('img-length')
  console.log(savedImg.dataset.imglength);
  const saveimglength = Number(savedImg.dataset.imglength)
  if(files.length + file.length + saveimglength > 4){
  
    document.getElementById('image-error').innerHTML='Please select up to 4 files';
    event.target.value = '';
    uploadImage2()
  }else{
    document.getElementById('image-error').innerHTML='';
    for(let i =0;i<file.length;i++){
      files.push(file[i])
    }

    // imginput.files=files;
    // form.reset();
    cropImage(files).then((response)=>{
      files = [...response];
      showImages();
      uploadImage2()
     })

    
  }
  
})

// productbtn.addEventListener('click',uploadImage2)


  
    const imageContainer = document.getElementById('imageContainer');

      const showImages = ()=>{
        let images = '';
        files.forEach( (e,i) =>{
          images += `	<div class="preview-img-div">
          <img class="img-fluid preview-img" src="${URL.createObjectURL(e)}">
          <button class="text-white text-bg-danger p-1 close-btnn" onclick="delImage(${i})">&times;</button>

        </div>`
        })

        imageContainer.innerHTML = images;
      }

      function delImage(index){

        files.splice(index,1)
        showImages()
        uploadImage2()
      }



  function uploadImage2(){
    console.log('uploadImage2');
    const dataTransfer = new DataTransfer()
    files.forEach((file,index)=>{
      dataTransfer.items.add(file)
           });

           imginput.files = dataTransfer.files;

          const form = document.getElementById('pdt-form');
      
  }

  function cropImage(files) {
    return new Promise((resolve) => {
      const croppedImages = [];
      let processedCount = 0;
  
      files.forEach((e, i) => {
        const imgElement = document.createElement('img');
        imgElement.src = URL.createObjectURL(e);
        imgElement.onload = (event) => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 640;
          const MAX_HEIGHT = 640;
          const scaleSize = MAX_WIDTH / event.target.width;
          canvas.width = MAX_WIDTH;
          // canvas.height = event.target.height * scaleSize;
          canvas.height = MAX_HEIGHT;
  
          const ctx = canvas.getContext('2d');
          ctx.drawImage(event.target, 0, 0, canvas.width, canvas.height);
  
          // Converting to file
          canvas.toBlob((blob) => {
            const croppedFile = new File([blob], `cropped_${Date.now()}.png`, { type: 'image/png' });
            croppedImages.push(croppedFile);
  
            processedCount++;
            if (processedCount === files.length) {
              resolve(croppedImages);
            }
          }, 'image/png');
        };
      });
    });
  }

