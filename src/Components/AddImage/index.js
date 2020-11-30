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

  const icons = useSelector(state => state.icons);

  async function handleFileUpload(e) {
    try {
      const files = e.target.files;
      if (!files) return;

      let currentLength = images.length;

      Array.from(files).forEach((file,index,array)  => {

        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
          let image = new Image();
          image.onload = function () {
            if(status.mode=='user') {
              setIconPopUpImage(reader.result);
              store.dispatch({type:'SET_OVERLAY',mode:'uploadIcon'});
            }
            else if(status.mode=='admin') {
              store.dispatch({type:'ADD_IMAGE_START',image:{order:currentLength+index,loading:true}});
              Services.adminUploadPhoto({base64:reader.result,width:this.width,height:this.height,order:currentLength+index});
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

  const save = (confirm) => {
    if(status.mode=='user'){
      Services.userUpdatePhotos(images,confirm);
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
      
      {!status.demo?
      <>
      <label className='borderBox' onClick={()=>save(0)}>儲存</label>
      {status.mode=='user'?<label className='borderBox' onClick={()=>save(1)}>完成</label>:null}
      </>
      :null}

    </div>
  );
}

export default AddImage;



