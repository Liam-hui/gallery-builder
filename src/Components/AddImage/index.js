import './style.css';
import React, { useState, useEffect, useRef } from 'react';
import store from '../../store';
import { useSelector } from "react-redux";

function AddImage(props) {


  function processFile(dataURL, fileType) {
    var maxWidth = 800;
    var maxHeight = 800;
  
    var image = new Image();
    image.src = dataURL;

    console.log(dataURL)
  
    image.onload = function () {
      
    };
  
  }

  const iconId = useSelector(state => state.iconId);

  async function handleFileUpload(e) {
    try {
      const files = e.target.files;
      if (!files) return;

      let currentId = iconId;

      Array.from(files).forEach((file,index,array)  => {
        let reader = new FileReader();
        reader.onload = function(){
          let dataURL = reader.result;
          alert(dataURL);
          var image = new Image();
          image.src = dataURL;
          image.onload = function () {
            store.dispatch({type:'ADD_ICON',icon:{url:this.src,height:this.height,width:this.width,id:currentId+index}})
          };
        };
        reader.readAsDataURL(file);
      });

      store.dispatch({type:'UPDATE_ICON_ID',id:currentId+Array.from(files).length});

    } catch (error) {
      alert(error);
      console.log("Catch Error: ", error);
    } finally {
      e.target.value = '';  // reset input file
    }
  }


  return (
    <div className="actionContainer">
      <label for="add-image">上傳圖片</label>
      <input onChange={handleFileUpload} type="file" id="add-image" name="uploadPhotoInput" accept="image/*" multiple="multiple"/>

      <label>儲存</label>
    </div>
  );
}

export default AddImage;



