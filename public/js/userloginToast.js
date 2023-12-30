        const isnewlogin = document.getElementById('newlogin').value;
    //  const isnewlogin = '<%=messages.login%>';
     console.log(isnewlogin);
     const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          customClass: {
          popup: 'sign-in-toast'
          },
          didOpen: (toast) => {
              toast.onmouseenter = Swal.stopTimer;
              toast.onmouseleave = Swal.resumeTimer;
          }
      }); 
      if(isnewlogin=='true'){
          Toast.fire({
              icon: "success",
              title: "Signed in successfully"
          });
      }