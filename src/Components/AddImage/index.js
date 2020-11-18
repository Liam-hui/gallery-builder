import './style.css';
import React, { useState, useEffect, useRef } from 'react';
import store from '../../store';
import { useSelector } from "react-redux";

function AddImage(props) {

  const iconId = useSelector(state => state.iconId);
  const mode = useSelector(state => state.mode);
  const screen = useSelector(state => state.screen);
  const images = useSelector(state => state.images);

  async function handleFileUpload(e) {
    try {
      const files = e.target.files;
      if (!files) return;

      let currentId = iconId;

      Array.from(files).forEach((file,index,array)  => {
        let image = new Image();
        image.src = URL.createObjectURL(file);;
        image.onload = function () {
          store.dispatch({type:'ADD_ICON',icon:{url:this.src,height:this.height,width:this.width,id:currentId+index}})
        };
      });

      store.dispatch({type:'UPDATE_ICON_ID',id:currentId+Array.from(files).length});

    } catch (error) {
      alert(error);
      console.log("Catch Error: ", error);
    } finally {
      e.target.value = '';  // reset input file
    }
  }

  const save = () => {
    if(mode=='user'){
      console.log(images.map(image=>{
        let output = {};
        output.id = image.id;
        output.iconInfo = image.iconInfo;
        return output;
      }));
    }
    else if(mode=='admin'){
      console.log(images.map(image=>{
        let output = {};
        output.id = image.id;
        output.placeHolderInfo = image.iconInfo;
        return JSON.stringify(output);
      }));
    }
  }


  return (
    <div className={mode=='user'&&screen.screenWidth>768&&screen.screenHeight>768?"actionContainer block":"actionContainer"}>

      {mode=='user'?(
        <>
          <label for="add-image">上傳圖片</label>
          <input onChange={handleFileUpload} type="file" id="add-image" name="uploadPhotoInput" accept="image/*" multiple="multiple"/>
        </>
      ):null}
      
      <label onClick={save}>儲存</label>

    </div>
  );
}

export default AddImage;



