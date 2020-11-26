import './style.css';
import React, { useState, useEffect, useRef } from 'react';
import store from '../../store';
import { useSelector } from "react-redux";
import {Services} from '../../services';

import {AddIconPopUp,setIconPopUpImage} from '../../Components/AddIconPopUp';

function AddImage(props) {

  const {border} = props;

  const status = useSelector(state => state.status);
  const display = useSelector(state => state.display);
  const images = useSelector(state => state.images);

  async function handleFileUpload(e) {
    try {
      const files = e.target.files;
      if (!files) return;

      // Array.from(files).forEach((file,index,array)  => {
      //   console.log(file);
      //   let image = new Image();
      //   image.src = URL.createObjectURL(file);;
      //   image.onload = function () {
      //     console.log(new Date());
      //     if(status.mode=='user') store.dispatch({type:'ADD_ICON',icon:{url:this.src,height:this.height,width:this.width,id:Math.random().toString(36).substr(2, 9)}})
      //     else if(status.mode=='admin') store.dispatch({type:'ADD_IMAGE',image:{url:this.src,height:this.height,width:this.width,id:Math.random().toString(36).substr(2, 9)}})
      //   };
      // });


      Array.from(files).forEach((file,index,array)  => {

        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
          let image = new Image();
          image.onload = function () {
            // if(status.mode=='user') Services.userUploadIcon({base64:reader.result});
            if(status.mode=='user') {
              setIconPopUpImage(reader.result);
              store.dispatch({type:'SET_OVERLAY',mode:'uploadIcon'});
            }
            else if(status.mode=='admin') {
              store.dispatch({type:'SET_OVERLAY',mode:'loading'});
              Services.adminUploadPhoto({base64:reader.result,width:this.width,height:this.height});
            }
          };
          image.src = reader.result;
        };
        
        
      });

    } catch (error) {
      alert(error);
      console.log("Catch Error: ", error);
    } finally {
      e.target.value = '';  // reset input file
    }
  }

  const save = () => {
    if(status.mode=='user'){
      Services.userUpdatePhotos(images);
    }
    else if(status.mode=='admin'){
      Services.adminUpdatePhotos(images);
    }
  }

  let className = '';
  if(display=='large') className += ' block'; else className += ' row'
  if(border) className += ' border';

  return (
    <div className={"actionContainer"+className}>
      <label className='borderBox' for="add-image">上傳圖片</label>
      <input onChange={handleFileUpload} type="file" id="add-image" name="uploadPhotoInput" accept="image/*" multiple={status.mode=='admin'?true:false}/>
      <label className='borderBox' onClick={save}>儲存</label>
      {status.mode=='user'?<label className='borderBox' onClick={save}>完成</label>:null}
    </div>
  );
}

export default AddImage;



