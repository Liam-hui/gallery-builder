import './style.css';
import React, { useState, useEffect, useRef } from 'react';
import store from '../../store';
import { useSelector } from "react-redux";
import {Services} from '../../services';

let image = null;

export const setIconPopUpImage = (base64) => {
  image=base64;
}

export const AddIconPopUp = () => {

  return (
    <div className='overlayBox' onClick={()=>console.log('asdf')}>

      {image==null?null:<div className='iconBig' style={{backgroundImage:'url('+image+')'}} />}

      <div style={{display:'flex'}}>
        <div className='borderBox overlayButton' 
          onClick={()=>{
            // console.log('a');
            // Services.userUploadIcon({base64:image});
          }}>
          使用原圖
        </div>
        <div className='borderBox overlayButton'
          onClick={()=>{
            store.dispatch({type:'SET_OVERLAY',mode:'loading'});
            Services.userUploadIcon({base64:image});
          }}>
          去除背景
        </div>
      </div>
    </div>
  );
}





