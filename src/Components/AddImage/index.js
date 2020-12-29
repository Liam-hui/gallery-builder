import './style.css';
import React, { useState, useEffect, useRef } from 'react';
import store from '../../store';
import { useSelector } from "react-redux";
import {Services} from '../../services';
import {isMobile} from 'react-device-detect';

import {setIconPopUpImage} from '../../Components/AddIconPopUp';

function AddImage(props) {

  const {border} = props;

  const status = useSelector(state => state.status);
  const display = useSelector(state => state.display);
  const images = useSelector(state => state.images);

  async function handleFileUpload(e) {
    store.dispatch({type:'SET_OVERLAY',mode:'loading',message:'圖片上傳中'});
    try {
      const files = e.target.files;
      if (!files) return;

      if(status.mode=='admin') {
        let currentLength = images.length;
        let photos = [];
        for (const [index, file] of Array.from(files).entries()) {

          let image = await load(file);
          photos = photos.concat([{...image, ...{file:file}}]);

          function load(file) {
            return new Promise((resolve, reject) => {
              let reader = new FileReader();
              reader.readAsDataURL(file);
              reader.onload = async function () {
                resolve(await loadImage(reader.result));
              };
              reader.onerror = ()=>reject()
            })
          }

          function loadImage(src) {
            return new Promise((resolve, reject) => {
              let image = new Image();
              image.onload = function () {
                let temp_id = Math.random().toString(36).substr(2, 9);
                resolve({id:temp_id,base64:src,width:this.width,height:this.height,order:currentLength+index});
              };
              image.onerror = ()=>reject()
              image.src = src;
            })
          }
          
        };

        Services.adminUploadPhoto(photos);
      }

      else if(status.mode=='user') {
        Array.from(files).forEach((file,index)  => {

          let reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = function () {
            let image = new Image();
            image.onload = function () {
              if(status.mode=='user') {
                setIconPopUpImage(reader.result);
                store.dispatch({type:'SET_OVERLAY',mode:'uploadIcon'});
              }
            };
            image.src = reader.result;
          };
          
        });
      }

    } catch (error) {
      alert(error);
      console.log("Catch Error: ", error);
    } finally {
      e.target.value = '';  // reset input file
    }
  }

  const save = (confirm) => {
    if(status.mode=='user'){
      store.dispatch({type:'SET_OVERLAY',mode:'loading',message:'儲存中'});
      Services.userUpdatePhotos(images,confirm);
    }
    else if(status.mode=='admin'){
      store.dispatch({type:'SET_OVERLAY',mode:'loading',message:'儲存中'});
      Services.adminUpdatePhotos(images,null,null,true);
    }
  }

  const finish = () => {
    if(images.every(x=>x.iconSelected!=-1)) store.dispatch({type:'SET_OVERLAY',mode:'message',message:'完成後將不能修改',cancel:true,confirm:()=> {if(isMobile) store.dispatch({type:'SHOW_VIEW'}); else Services.userUpdatePhotos(images,1); store.dispatch({type:'CLOSE_OVERLAY'}); }});
    else store.dispatch({type:'SET_OVERLAY',mode:'message',message:'請先選擇所有頭像'});
  }

  let className = '';
  if(display=='large') className += ' block'; else className += ' row'
  if(border) className += ' border';

  return (
    <div className={"actionContainer"+className}>
      <label className='clickable borderBox' for="add-image">上傳圖片</label>
      <input onChange={handleFileUpload} type="file" id="add-image" name="uploadPhotoInput" accept="image/*" multiple={status.mode=='admin'?true:false}/>
      
      {status.mode=='user'&&!status.demo||status.mode=='admin'?<label className='clickable borderBox' onClick={()=>save(0)}>儲存</label>:null}
      {status.mode=='user'&&!status.demo?<label className='clickable borderBox' onClick={()=>finish()}>完成</label>:null}

    </div>
  );
}

export default AddImage;



