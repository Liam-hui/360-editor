import api from '@/services/api';

export const uniqueId = () => {
  return '_' + Math.random().toString(36).substr(2, 9) +  Date.now();
}

export const uploadFile = async (file) => {
  return new Promise( async (resolve, reject) => {
    let body = new FormData();
    body.append('image', file);
    
    api.post(
      'uploadFile', 
      body
    )
      .then(response => {
        if (response?.data?.data)
          resolve(response.data.data)
        else reject();
      })
      .catch(error => {
        console.error(error)
        reject();
      })
  })
}

// export const uploadFiles = async (files) => {

//   return new Promise( async (resolve, reject) => {

//     const urls = await Promise.all(
//       files.map( async file => {
//         try {
//           let body = new FormData();
//           body.append('image', file);
//           const response = await api.post(
//             'uploadFile', 
//             body
//           );
          
//           if (response?.data?.data) {
//             return window.cdn + response?.data?.data;
//           }
//           else reject();
          
//         } catch(error) {
//           reject();
//           throw error;
//         }
//       })
//     );

//     resolve(urls);
//   });

// }
