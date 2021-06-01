// import { useEffect } from 'react';
import api from '@/services/api';

export const uniqueId = () => {
  return '_' + Math.random().toString(36).substr(2, 9) +  Date.now();
}

export const uploadFiles = async (files) => {

  return new Promise( async (resolve, reject) => {

    const urls = await Promise.all(
      files.map( async file => {
        try {
          const response = await api.get('infinityVisionList?page=1', // uploadFile 
            // {
    
            // },
            // {
            //   headers: { 'Content-Type': 'multipart/form-data'  },
            // }
          )
          return {
            ... file,
            base64: null,
            url: "http://media.comicbook.com/2018/03/avengers-infinity-war-poster-1093756.jpeg"
          }
        } catch(error) {
          reject();
          throw error;
        }
      })
    );

    resolve(urls);
  });

}


